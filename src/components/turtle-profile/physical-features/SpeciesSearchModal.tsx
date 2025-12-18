'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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
  const [habitatFilter, setHabitatFilter] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [species, setSpecies] = useState<SpeciesSearchResult[]>([]);
  const [habitatTypes, setHabitatTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const initialFetchDone = useRef(false);

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
      if (habitatFilter) params.set('habitatType', habitatFilter);
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
      avatarUrl: result.avatarUrl || ''
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Search Bar - Fixed at top */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
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
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* All Species Section */}
          <div className="flex-1 flex flex-col min-h-0 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-gray-600">
                All Species
              </h4>
              <div className="flex gap-2">
                {/* Habitat Filter */}
                <select
                  value={habitatFilter}
                  onChange={(e) => setHabitatFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Filter by habitat"
                >
                  <option value="">All Habitats</option>
                  {habitatTypes.map((habitat) => (
                    <option key={habitat} value={habitat}>
                      {habitat}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Sort by"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="scientific">Scientific Name</option>
                </select>
              </div>
            </div>

            {/* Scrollable Results List */}
            <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border border-gray-200 bg-[#f5f5f0]">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredSpecies.length > 0 ? (
                <div className="p-2 space-y-2">
                  {filteredSpecies.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectSpecies(result)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                        {result.avatarUrl ? (
                          <Image
                            src={result.avatarUrl}
                            alt={result.commonName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Icon name="image" size="sm" style="line" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {result.commonName}
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          {result.scientificName}
                        </p>
                      </div>

                      {/* Conservation Status Badge */}
                      {result.conservationStatus && (
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                          {result.conservationStatus}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                  <Icon name="search" size="base" style="line" className="mb-2 text-gray-300" />
                  <p>No species found</p>
                  {(searchQuery || habitatFilter) && (
                    <p className="text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Related Species Section - Fixed at bottom */}
          {relatedSpecies.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm text-gray-600 mb-3">
                Related Species
              </h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {relatedSpecies.map((species) => (
                  <button
                    key={species.scientificName}
                    onClick={() => handleSelectRelated(species)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#c5c5b8] hover:bg-[#b5b5a8] transition-colors text-left"
                  >
                    {/* Avatar */}
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={species.avatarUrl}
                        alt={species.commonName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {species.commonName}
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        {species.scientificName}
                      </p>
                    </div>

                    {/* Add Button */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white">
                      <Icon name="add" size="sm" style="line" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
