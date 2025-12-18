'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/ui/input';
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
  const [habitatFilter, setHabitatFilter] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [species, setSpecies] = useState<SpeciesSearchResult[]>([]);
  const [habitatTypes, setHabitatTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch species based on filters
  const fetchSpecies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
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
  }, [searchQuery, habitatFilter, sortBy, primarySpeciesId]);

  // Initial fetch when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSpecies();
    }
  }, [isOpen, fetchSpecies]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      fetchSpecies();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, habitatFilter, sortBy, isOpen, fetchSpecies]);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-lg shadow-xl m-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 id="search-modal-title" className="text-xl font-heading font-bold">
            Find a Species
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-gray-500 hover:text-black p-1"
            aria-label="Close search modal"
          >
            <Icon name="close" size="sm" style="line" />
          </button>
        </div>

        {/* Search Bar */}
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
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Related Species Section */}
          {relatedSpecies.length > 0 && !searchQuery && !habitatFilter && (
            <div className="mb-6">
              <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Related Species
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {relatedSpecies.map((species) => (
                  <button
                    key={species.scientificName}
                    onClick={() => handleSelectRelated(species)}
                    className="flex-shrink-0 w-32 group"
                  >
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={species.avatarUrl}
                        alt={species.commonName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="128px"
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {species.commonName}
                    </p>
                    <p className="text-xs text-gray-500 italic truncate">
                      {species.scientificName}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Species Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs text-gray-500 uppercase tracking-wide">
                {searchQuery || habitatFilter ? 'Search Results' : 'All Species'}
              </h4>
              <div className="flex gap-2">
                {/* Habitat Filter */}
                <select
                  value={habitatFilter}
                  onChange={(e) => setHabitatFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Sort by"
                >
                  <option value="alphabetical">A-Z</option>
                  <option value="scientific">Scientific Name</option>
                </select>
              </div>
            </div>

            {/* Results List */}
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredSpecies.length > 0 ? (
              <div className="space-y-2">
                {filteredSpecies.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectSpecies(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
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
                      <p className="font-semibold text-gray-900 truncate">
                        {result.commonName}
                      </p>
                      <p className="text-sm text-gray-500 italic truncate">
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
              <div className="text-center py-8 text-gray-500">
                <Icon name="search" size="base" style="line" className="mx-auto mb-2 text-gray-300" />
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
      </div>
    </div>
  );
}
