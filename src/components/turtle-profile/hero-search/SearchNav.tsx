"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { Icon } from '@/components/Icon';

interface SearchResult {
  species_common_name: string;
  species_scientific_name: string;
  slug: string;
  avatar_image_circle_url: string;
}

export default function TurtleSearchNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const { scrollDirection, isAtTop } = useScrollDirection(50);

  // SearchNav becomes sticky when scrolling down (navbar is hidden)
  const isSticky = !isAtTop && scrollDirection === 'down';

  const debouncedSearch = debounce(async (query: string) => {
    if (!query) {
      setMessage(null);
      setSearchResults([]);
      return;
    }

    if (query.length < 3) {
      setMessage("Please use at least three characters.");
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search-turtles?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
      setMessage(data.length === 0 ? "No results match your search. Please try again." : null);
    } catch (error) {
      console.error('Error searching turtles:', error);
      setSearchResults([]);
      setMessage("An error occurred while searching. Please try again.");
    }
  }, 500);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(true);
    
    // Immediately clear message if input is empty
    if (!value.trim()) {
      setMessage(null);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setMessage(null);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    clearSearch();
  };

  // Focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus({ preventScroll: true });
    }
  }, [mobileSearchOpen]);

  // Close mobile search when scrolling up (navbar reappears)
  useEffect(() => {
    if (mobileSearchOpen && scrollDirection === 'up' && !isAtTop) {
      closeMobileSearch();
    }
  }, [scrollDirection, isAtTop, mobileSearchOpen]);

  return (
    <>
      {/* Mobile SearchNav */}
      <div
        className={`lg:hidden w-full bg-green-950 transition-all duration-300 border-0 ${
          isSticky
            ? 'fixed top-0 left-0 right-0 shadow-lg py-2 px-4 z-10'
            : 'relative py-2 px-4 z-20'
        }`}
      >
        {/* Default view - shown when search is closed */}
        {!mobileSearchOpen && (
          <div className="flex items-center justify-between h-10">
            {/* Left: Book icon + Search icon - book icon has p-2 to match navbar menu button */}
            <div className="flex items-center gap-1 -ml-2">
              <Link href="/species-guide" className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors">
                <Icon name="book-open" style="line" size="base" />
              </Link>
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors"
                aria-label="Open search"
              >
                <Icon name="search" style="line" size="base" />
              </button>
            </div>

            {/* Center: Species Guide link */}
            <Link
              href="/species-guide"
              className="font-heading font-semibold text-white uppercase text-sm tracking-wide hover:text-green-400 transition-colors"
            >
              Species Guide
            </Link>

            {/* Right: Empty placeholder for balance */}
            <div className="w-16" />
          </div>
        )}

        {/* Inline search view - shown when search is open */}
        {mobileSearchOpen && (
          <div className="flex items-center gap-1 search-container h-10 -ml-2">
            {/* Left: Book icon linking to species guide - p-2 to match navbar menu button */}
            <Link href="/species-guide" className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors flex-shrink-0">
              <Icon name="book-open" style="line" size="base" />
            </Link>

            {/* Center: Search input */}
            <div className="relative flex-1">
              <Input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search for turtles"
                value={searchQuery}
                onChange={handleSearchInput}
                className="pl-10 pr-4 h-10 bg-green-900 text-white placeholder:text-white/70 border-2 border-green-900 rounded-full focus:border-green-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            </div>

            {/* Right: Close button */}
            <button
              onClick={closeMobileSearch}
              className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Search Results - floating overlay below search bar */}
      {mobileSearchOpen && showResults && searchQuery && (searchResults.length > 0 || message) && (
        <div
          className={`lg:hidden fixed left-14 right-4 z-50 search-container ${
            isSticky ? 'top-[58px]' : 'top-[114px]'
          }`}
        >
          <div className="bg-green-900 border border-green-700 rounded-xl shadow-2xl overflow-auto max-h-[60vh]">
            {message ? (
              <div className="p-3 text-white/70 text-center">{message}</div>
            ) : (
              searchResults.map((result) => (
                <Link
                  key={result.slug}
                  href={`/turtle/${result.slug}`}
                  className="flex gap-3 p-3 hover:bg-green-800 transition-colors"
                  onClick={closeMobileSearch}
                >
                  <Image
                    src={result.avatar_image_circle_url}
                    alt={result.species_common_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    width={500}
                    height={300}
                  />
                  <div className="flex flex-col min-w-0 justify-center">
                    <p className="font-bold text-white break-words">
                      {result.species_common_name}
                    </p>
                    <p className="text-gray-300 text-sm italic break-words">
                      {result.species_scientific_name}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Desktop SearchNav */}
      <div
        className={`hidden lg:block w-full bg-green-950 transition-all duration-300 border-0 ${
          isSticky
            ? 'fixed top-0 left-0 right-0 shadow-lg py-2 px-10 z-10'
            : 'relative pt-6 pb-4 px-10 z-20'
        }`}
      >
        <div className="container max-w-8xl mx-auto">
          <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 items-center">
            {/* Search Section */}
            <div className={`relative search-container ${isSticky ? 'max-w-[240px]' : ''}`}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for turtles"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  className={`px-8 bg-green-900 text-white placeholder:text-white/70 border-2 border-green-900 rounded-full text-sm focus:border-green-500 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    isSticky ? 'h-8' : 'h-10'
                  }`}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-white/70 ${isSticky ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 group"
                  >
                    <X className="h-4 w-4 text-white/70 group-hover:text-green-500 transition-colors" />
                  </button>
                )}
              </div>

              {/* Search Results or Messages */}
              {showResults && searchQuery && (searchResults.length > 0 || message) && (
                <div className="absolute z-[100] w-full mt-2 bg-green-900 border-2 border-green-800 rounded-lg shadow-lg overflow-auto max-h-[80vh]">
                  {message ? (
                    <div className="p-3 text-white/70 text-center">{message}</div>
                  ) : (
                    searchResults.map((result) => (
                      <Link
                        key={result.slug}
                        href={`/turtle/${result.slug}`}
                        className="flex gap-3 p-3 hover:bg-green-950 transition-colors"
                        onClick={clearSearch}
                      >
                        <Image
                          src={result.avatar_image_circle_url}
                          alt={result.species_common_name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0 self-start mt-1"
                          width={500}
                          height={300}
                        />
                        <div className="flex flex-col min-w-0">
                          <p className="font-bold text-white break-words">
                            {result.species_common_name}
                          </p>
                          <p className="text-gray-300 text-sm italic break-words">
                            {result.species_scientific_name}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Breadcrumbs Section - Centered */}
            <nav className="flex items-center justify-center space-x-2 text-white/90">
              <Link href="/species-guide" className="hover:text-orange-500 font-semibold transition-colors">
                Species Guide
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-300" />
              <span className="font-semibold hover:text-orange-500 transition-colors cursor-pointer text-white/90">
                Austro-American Sideneck Turtles
              </span>
            </nav>

            {/* Empty Section - Reserved for future use */}
            <div />
          </div>
        </div>
      </div>
    </>
  );
}