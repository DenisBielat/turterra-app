"use client";

import { useState, useMemo } from 'react';
import FilterBar from './FilterBar';
import ResultsBar, { ViewMode, SortOption } from './ResultsBar';
import TurtleCard from './TurtleCard';
import type { TurtleGuideSpecies, TurtleGuideFilters } from '@/app/api/turtle-guide/route';

// Conservation status order for sorting (most critical first)
const CONSERVATION_ORDER: Record<string, number> = {
  'EX': 0,  // Extinct
  'EW': 1,  // Extinct in Wild
  'CR': 2,  // Critically Endangered
  'EN': 3,  // Endangered
  'VU': 4,  // Vulnerable
  'NT': 5,  // Near Threatened
  'LC': 6,  // Least Concern
  'DD': 7,  // Data Deficient
  'NE': 8,  // Not Evaluated
};

interface TurtleGuideClientProps {
  initialTurtles: TurtleGuideSpecies[];
  filters: TurtleGuideFilters;
}

export default function TurtleGuideClient({
  initialTurtles,
  filters
}: TurtleGuideClientProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' ||
    selectedFamily !== 'all' ||
    selectedRegion !== 'all';

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFamily('all');
    setSelectedRegion('all');
  };

  // Filter and sort turtles
  const filteredTurtles = useMemo(() => {
    let result = [...initialTurtles];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(turtle =>
        turtle.commonName.toLowerCase().includes(query) ||
        turtle.scientificName.toLowerCase().includes(query)
      );
    }

    // Filter by family
    if (selectedFamily !== 'all') {
      result = result.filter(turtle =>
        turtle.familyScientific === selectedFamily
      );
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      result = result.filter(turtle =>
        turtle.regions.includes(selectedRegion)
      );
    }

    // Sort
    switch (sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.commonName.localeCompare(b.commonName));
        break;
      case 'name-desc':
        result.sort((a, b) => b.commonName.localeCompare(a.commonName));
        break;
      case 'status':
        result.sort((a, b) => {
          const orderA = a.conservationStatus ? CONSERVATION_ORDER[a.conservationStatus.code] ?? 99 : 99;
          const orderB = b.conservationStatus ? CONSERVATION_ORDER[b.conservationStatus.code] ?? 99 : 99;
          return orderA - orderB;
        });
        break;
    }

    return result;
  }, [initialTurtles, searchQuery, selectedFamily, selectedRegion, sortOption]);

  // Grid classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col gap-6';
      case 'grid':
      default:
        // 3 columns max for landscape cards with extra breathing room
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFamily={selectedFamily}
        onFamilyChange={setSelectedFamily}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        families={filters.families}
        regions={filters.regions}
      />

      {/* Results Bar */}
      <ResultsBar
        resultCount={filteredTurtles.length}
        totalCount={initialTurtles.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* Results Grid/List */}
      {filteredTurtles.length > 0 ? (
        <div className={getGridClasses()}>
          {filteredTurtles.map((turtle) => (
            <TurtleCard
              key={turtle.id}
              commonName={turtle.commonName}
              scientificName={turtle.scientificName}
              familyCommon={turtle.familyCommon}
              slug={turtle.slug}
              imageUrl={turtle.imageUrl}
              conservationStatus={turtle.conservationStatus}
              habitats={turtle.habitats}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No turtles found matching your criteria.</p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 text-green-500 hover:text-green-400 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
