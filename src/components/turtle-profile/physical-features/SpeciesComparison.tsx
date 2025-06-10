'use client';

import { useState } from 'react';
import SpeciesCard from './SpeciesCard';
import PhysicalFeatures from './PhysicalFeatures';
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
  comparisonSpecies: initialComparisonSpecies,
  relatedSpecies 
}: SpeciesComparisonProps) {
  const [comparisonSpecies, setComparisonSpecies] = useState<ComparisonSpecies | undefined>(
    initialComparisonSpecies
  );
  const [isLoading, setIsLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState<string>('Head/Neck');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAddRelatedSpecies = async (species: RelatedSpecies) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/species/${encodeURIComponent(species.scientificName)}`);
      if (!response.ok) throw new Error('Failed to fetch species data');
      
      const speciesData = await response.json();
      setComparisonSpecies(speciesData);
      setOpenCategory('Head/Neck');
    } catch (error) {
      console.error('Error adding comparison species:', error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_minmax(16px,24px)_1fr_1fr_1fr_1fr_1fr] gap-4">
        {/* Primary Species Card */}
        <div className="col-span-5">
          <SpeciesCard {...primarySpecies.speciesCard} />
        </div>

        {/* Empty column for spacing */}
        <div className="col-span-1" />

        {/* Comparison Species Card or Compare UI */}
        <div className="col-span-5">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading species data...</span>
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
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_minmax(16px,24px)_1fr_1fr_1fr_1fr_1fr] gap-4">
        {/* Primary Species Features */}
        <div className="col-span-5">
          <PhysicalFeatures 
            categories={primarySpecies.featureCategories}
            openCategory={openCategory}
            onCategoryClick={handleCategoryClick}
          />
        </div>

        {/* Empty column for spacing */}
        <div className="col-span-1" />

        {/* Comparison Species Features or Related Species */}
        <div className="col-span-5">
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
              <p className="text-xs mb-4 text-gray-700">Related Species | Quick Add</p>
              <div className="space-y-3">
                {relatedSpecies.map((species) => (
                  <button
                    key={species.scientificName}
                    onClick={() => handleAddRelatedSpecies(species)}
                    className="w-full group flex justify-between items-center bg-green-950 rounded-lg drop-shadow-md transition-all duration-200 ease-in-out hover:translate-x-4"
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

      {/* Add Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl m-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Find a Species</h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-center text-gray-500 hover:text-black"
              >
                <Icon name="close" size="sm" style="line" />
              </button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              Search functionality coming soon...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}