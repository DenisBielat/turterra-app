'use client';

import { useState } from 'react';
import SpeciesCard from './SpeciesCard';
import PhysicalFeatures from './PhysicalFeatures';
import SpeciesSearchModal from './SpeciesSearchModal';
import { Icon } from '@/components/Icon';
import Image from 'next/image';

// Import interfaces
import {
  SpeciesComparisonProps,
  RelatedSpecies,
  ComparisonSpecies
} from '@/types/turtleTypes';

export default function SpeciesComparison({
  primarySpecies,
  primarySpeciesId,
  comparisonSpecies: initialComparisonSpecies,
  relatedSpecies
}: SpeciesComparisonProps) {
  const [comparisonSpecies, setComparisonSpecies] = useState<ComparisonSpecies | undefined>(
    initialComparisonSpecies
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; species: RelatedSpecies } | null>(null);
  const [openCategory, setOpenCategory] = useState<string>('Head/Neck');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAddRelatedSpecies = async (species: RelatedSpecies) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/species/${encodeURIComponent(species.scientificName)}`);
      if (!response.ok) throw new Error('Failed to fetch species data');

      const speciesData = await response.json();
      setComparisonSpecies(speciesData);
      setOpenCategory('Head/Neck');
    } catch (err) {
      console.error('Error adding comparison species:', err);
      setError({
        message: 'Failed to load species data. Please try again.',
        species
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleCategoryClick = (categoryName: string, isOpen: boolean) => {
    setOpenCategory(isOpen ? '' : categoryName);
  };

  const handleRemoveComparison = () => {
    setComparisonSpecies(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Top Grid - Species Cards */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
        {/* Primary Species Card */}
        <div>
          <SpeciesCard {...primarySpecies.speciesCard} />
        </div>

        {/* Spacer column */}
        <div className="w-4 md:w-6" />

        {/* Comparison Species Card or Compare UI */}
        <div>
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading species data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex flex-col items-center justify-center border border-red-300 rounded-lg bg-red-50 p-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <Icon name="close" size="sm" style="filled" className="text-red-500" />
                <span className="text-sm text-red-700">{error.message}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddRelatedSpecies(error.species)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleDismissError}
                    className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : comparisonSpecies ? (
            <SpeciesCard
              {...comparisonSpecies.speciesCard}
              isComparison={true}
              onRemove={handleRemoveComparison}
            />
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg hover:bg-green-900/20 transition-all"
            >
              <Icon name="add" size="sm" style="line" className="mb-2" />
              <span className="text-sm">
                Compare against a different species
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Grid - Physical Features */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
        {/* Primary Species Features */}
        <div>
          <PhysicalFeatures 
            categories={primarySpecies.featureCategories}
            openCategory={openCategory}
            onCategoryClick={handleCategoryClick}
          />
        </div>

        {/* Spacer column */}
        <div className="w-4 md:w-6" />

        {/* Comparison Species Features or Related Species */}
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : comparisonSpecies ? (
            <PhysicalFeatures
              categories={comparisonSpecies.featureCategories}
              openCategory={openCategory}
              onCategoryClick={handleCategoryClick}
            />
          ) : (
            <div>
              <p className="text-xs mb-4 text-gray-700">
                {error ? 'Try a different species:' : 'Related Species | Quick Add'}
              </p>
              <div className="space-y-3">
                {relatedSpecies.map((species) => (
                  <button
                    key={species.scientificName}
                    onClick={() => handleAddRelatedSpecies(species)}
                    className="w-full group flex justify-between items-center bg-green-950 rounded-lg drop-shadow-md transition-all duration-200 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:translate-x-4"
                  >
                    <div className="flex items-center">
                      <div className="relative w-32 h-20 overflow-clip">
                        <Image
                          src={species.avatarUrl}
                          alt={species.commonName}
                          fill
                          className="object-cover rounded-l-lg"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="flex flex-col items-start gap-1 px-4">
                        <div className="font-heading font-bold text-white">
                          {species.commonName}
                        </div>
                        <div className="text-sm italic text-white">
                          {species.scientificName}
                        </div>
                      </div>
                    </div>
                    <div className="px-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-green-500 hover:outline-1 hover:outline-dashed hover:outline-green-500 hover:outline-offset-2 transition-all duration-200">
                        <Icon 
                          name="add" 
                          size="sm" 
                          style="line"
                          className="text-green-950" 
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SpeciesSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSpecies={handleAddRelatedSpecies}
        relatedSpecies={relatedSpecies}
        primarySpeciesId={primarySpeciesId}
      />
    </div>
  );
}