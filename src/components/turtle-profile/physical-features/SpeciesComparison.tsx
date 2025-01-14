'use client'

import { useState } from 'react';
import SpeciesCard from './SpeciesCard';
import PhysicalFeatures from './PhysicalFeatures';
import { Icon } from '@/components/Icon';
import Image from 'next/image';

interface Feature {
  name: string;
  value: string;
  subFeatures: {
    name: string;
    value: string;
  }[];
  images?: { url: string }[];
}

interface Category {
  name: string;
  features: Feature[];
  image?: { url: string };
}

interface RelatedSpecies {
  commonName: string;
  scientificName: string;
  avatarUrl: string;
}

interface SpeciesComparisonProps {
  primarySpecies: {
    speciesCard: {
      commonName: string;
      scientificName: string;
      avatarUrl: string;
      backgroundImageUrl?: string;
      variant: {
        sex: string;
        lifeStage: string;
      };
    };
    featureCategories: Category[];
  };
  comparisonSpecies?: {
    speciesCard: {
      commonName: string;
      scientificName: string;
      avatarUrl: string;
      backgroundImageUrl?: string;
      variant: {
        sex: string;
        lifeStage: string;
      };
    };
    featureCategories: Category[];
  };
  relatedSpecies: RelatedSpecies[];
}

export default function SpeciesComparison({ 
  primarySpecies, 
  comparisonSpecies,
  relatedSpecies 
}: SpeciesComparisonProps) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_minmax(16px,24px)_1fr_1fr_1fr_1fr_1fr] gap-4">
      {/* Primary Species */}
      <div className="col-span-5">
        <div className="mb-6">
          <SpeciesCard {...primarySpecies.speciesCard} />
        </div>
        <PhysicalFeatures categories={primarySpecies.featureCategories} />
      </div>

      {/* Empty column for spacing */}
      <div className="col-span-1" />

      {/* Comparison Species or Compare UI */}
      <div className="col-span-5">
        {comparisonSpecies ? (
          <>
            <div className="mb-6">
              <SpeciesCard {...comparisonSpecies.speciesCard} />
            </div>
            <PhysicalFeatures categories={comparisonSpecies.featureCategories} />
          </>
        ) : (
          <div className="space-y-8">
            {/* Compare Button Area - Matching SpeciesCard height */}
            <button className="w-full h-[140px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg hover:bg-green-900/20 transition-all mb-6">
              <Icon name="add" size="sm" style="line" className="mb-2" />
              <span className="text-sm">
                Compare against a different species
              </span>
            </button>

            {/* Related Species Section */}
            <div>
              <p className="text-xs mb-4 text-gray-700">Related Species | Quick Add</p>
              <div className="space-y-3">
                {relatedSpecies.map((species) => (
                  <button
                    key={species.scientificName}
                    className="w-full group flex justify-between items-center bg-green-950 rounded-lg drop-shadow-md transition-all duration-200 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:translate-x-4"
                  >
                    <div className="flex items-center">
                      <div className="relative w-32 h-20 overflow-clip">
                        <Image
                          src={species.avatarUrl}
                          alt={species.commonName}
                          fill
                          className="object-cover rounded-l-lg"
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
          </div>
        )}
      </div>
    </div>
  );
} 