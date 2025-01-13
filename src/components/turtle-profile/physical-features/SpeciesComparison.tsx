'use client'

import { useState } from 'react';
import SpeciesCard from './SpeciesCard';
import PhysicalFeatures from './PhysicalFeatures';

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
}

export default function SpeciesComparison({ primarySpecies, comparisonSpecies }: SpeciesComparisonProps) {
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

      {/* Comparison Species (empty for now) */}
      <div className="col-span-5">
        {comparisonSpecies && (
          <>
            <div className="mb-6">
              <SpeciesCard {...comparisonSpecies.speciesCard} />
            </div>
            <PhysicalFeatures categories={comparisonSpecies.featureCategories} />
          </>
        )}
      </div>
    </div>
  );
} 