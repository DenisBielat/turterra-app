'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { RelatedSpecies } from '@/types/turtleTypes';

interface SpeciesSearchResult {
  id: number;
  commonName: string;
  scientificName: string;
  avatarUrl: string | null;
  conservationStatus: string | null;
}

interface SpeciesSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies: (species: RelatedSpecies) => void;
  relatedSpecies: RelatedSpecies[];
  primarySpeciesId?: number;
}

export default function SpeciesSearchModal({
  isOpen,
  onClose,
  onSelectSpecies,
  relatedSpecies,
  primarySpeciesId
}: SpeciesSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [habitatFilter, setHabitatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [species, setSpecies] = useState<SpeciesSearchResult[]>([]);
  const [habitatTypes, setHabitatTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const initialFetchDone = useRef(false);

  // Controlled state for dropdowns - when one opens, close the other
  const [habitatOpen, setHabitatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Debounce search query with longer delay (500ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch species based on filters
  const fetchSpecies = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (habitatFilter && habitatFilter !== 'all') params.set('habitatType', habitatFilter);
      if (sortBy) params.set('sort', sortBy);
      if (primarySpeciesId) params.set('excludeId', String(primarySpeciesId));

      const response = await fetch(`/api/species/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch species');

      const data = await response.json();
      setSpecies(data.species || []);
      setHabitatTypes(data.habitatTypes || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching species:', error);
    } finally {
      setIsLoading(false);
    }
  }, [habitatFilter, sortBy, primarySpeciesId]);

  // Initial fetch when modal opens
  useEffect(() => {
    if (isOpen && !initialFetchDone.current) {
      fetchSpecies('');
      initialFetchDone.current = true;
    }
    if (!isOpen) {
      initialFetchDone.current = false;
      setSearchQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen, fetchSpecies]);

  // Fetch when debounced query or filters change
  useEffect(() => {
    if (isOpen && initialFetchDone.current) {
      fetchSpecies(debouncedQuery);
    }
  }, [debouncedQuery, habitatFilter, sortBy, isOpen, fetchSpecies]);

  const handleSelectSpecies = (result: SpeciesSearchResult) => {
    onSelectSpecies({
      commonName: result.commonName,
      scientificName: result.scientificName,
      avatarUrl: result.avatarUrl || '',
      conservationStatus: result.conservationStatus || undefined
    });
    onClose();
  };

  const handleSelectRelated = (species: RelatedSpecies) => {
    onSelectSpecies(species);
    onClose();
  };

  // Filter out related species from the main results to avoid duplicates
  const relatedScientificNames = new Set(relatedSpecies.map(s => s.scientificName));
  const filteredSpecies = species.filter(s => !relatedScientificNames.has(s.scientificName));

  // Handlers to close other dropdown when one opens
  const handleHabitatOpenChange = (open: boolean) => {
    setHabitatOpen(open);
    if (open) setSortOpen(false);
  };

  const handleSortOpenChange = (open: boolean) => {
    setSortOpen(open);
    if (open) setHabitatOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[75vh] flex flex-col p-0 gap-0 bg-warm rounded-xl [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Search Species to Compare</DialogTitle>
        </VisuallyHidden>

        {/* Modal Container with Padding */}
        <div className="flex flex-col h-full p-6">
          {/* Search Bar Row - Inline with Close Button */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Icon
                name="search"
                size="sm"
                style="line"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search Turtles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-300 bg-white rounded-lg"
              />
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <Icon name="close" size="sm" style="line" className="text-gray-600" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* All Species Section */}
            <div className="flex-[2] flex flex-col min-h-0 overflow-visible">
              <div className="flex items-center justify-between mb-3 relative z-10">
                <h4 className="text-sm font-normal text-gray-700">
                  All Species
                </h4>
                <div className="flex gap-2">
                  {/* Habitat Filter */}
                  <Select
                    value={habitatFilter}
                    onValueChange={setHabitatFilter}
                    open={habitatOpen}
                    onOpenChange={handleHabitatOpenChange}
                  >
                    <SelectTrigger className="w-[140px] h-9 text-sm bg-white border-gray-300">
                      <SelectValue placeholder="All Habitats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Habitats</SelectItem>
                      {habitatTypes.map((habitat) => (
                        <SelectItem key={habitat} value={habitat}>
                          {habitat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                    open={sortOpen}
                    onOpenChange={handleSortOpenChange}
                  >
                    <SelectTrigger className="w-[140px] h-9 text-sm bg-white border-gray-300">
                      <SelectValue placeholder="Alphabetical" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="scientific">Scientific Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 mb-3" />

              {/* Scrollable Results List */}
              <ScrollArea className="flex-1 min-h-0" thumbClassName="bg-black/20">
              {isLoading ? (
                <div className="space-y-2 pr-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[72px] bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredSpecies.length > 0 ? (
                <div className="space-y-2 pr-3">
                  {filteredSpecies.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectSpecies(result)}
                      className="w-full flex items-center gap-4 p-3 rounded-lg bg-warm hover:bg-green-900 cursor-pointer transition-all text-left group"
                    >
                      {/* Avatar */}
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200 group-hover:ring-white transition-all">
                        {result.avatarUrl ? (
                          <Image
                            src={result.avatarUrl}
                            alt={result.commonName}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Icon name="turtle" size="sm" style="line" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-gray-900 group-hover:text-white transition-colors">
                          {result.commonName}
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                          <span className="italic">{result.scientificName}</span>
                          {result.conservationStatus && (
                            <>
                              <span className="mx-2">|</span>
                              <span>{result.conservationStatus}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                  <Icon name="search" size="base" style="line" className="mb-2 text-gray-400" />
                  <p className="font-medium">No species found</p>
                  {(searchQuery || (habitatFilter && habitatFilter !== 'all')) && (
                    <p className="text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  )}
                </div>
              ) : null}
            </ScrollArea>
          </div>

            {/* Related Species Section */}
            {relatedSpecies.length > 0 && (
              <div className="flex-[1] flex flex-col min-h-0 mt-4">
                {/* Divider */}
                <div className="border-t border-gray-300 mb-3" />

                <h4 className="text-sm font-normal text-gray-700 mb-3">
                  Related Species
                </h4>
                <ScrollArea className="flex-1 min-h-0" thumbClassName="bg-black/20">
                  <div className="space-y-2 pr-3">
                    {relatedSpecies.map((species) => (
                      <button
                        key={species.scientificName}
                        onClick={() => handleSelectRelated(species)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg bg-warm hover:bg-green-900 cursor-pointer transition-all text-left group"
                      >
                        {/* Avatar */}
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-white transition-all">
                          <Image
                            src={species.avatarUrl}
                            alt={species.commonName}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-gray-900 group-hover:text-white transition-colors">
                            {species.commonName}
                          </p>
                          <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                            <span className="italic">{species.scientificName}</span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
