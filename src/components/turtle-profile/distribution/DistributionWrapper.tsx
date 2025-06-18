'use client';
import { useState, useEffect } from 'react';
import DistributionSection from './DistributionSection';
import DistributionDetailsPanel from './DistributionDetailsPanel';

interface DistributionWrapperProps {
  currentSpeciesId?: string | number;
  speciesName?: string;
  scientificName?: string;
  profileImageUrl?: string;
  slug?: string;
}

const DistributionWrapper = ({ 
  currentSpeciesId, 
  speciesName, 
  scientificName, 
  profileImageUrl,
  slug
}: DistributionWrapperProps) => {
  return (
    <div>
      <div className="mb-6">
        <h2 id="distribution" className="scroll-m-20 text-5xl text-white">
          Distribution
        </h2>
        <div className="mt-2">
          <p className="text-white">Explore turtle species distribution across regions.</p>
        </div>
      </div>
      
      {/* Map and Distribution Details Panel container */}
      <div className="relative">
        {/* Distribution content area - full width */}
        <div className="col-span-12">
          <DistributionSection 
            currentSpeciesId={currentSpeciesId} 
          />
        </div>
        
        {/* Distribution Details Panel positioned absolutely to align with map */}
        <div className="absolute top-6 left-6 bottom-6 w-96 z-10">
          <div className="bg-white rounded-lg p-6 shadow-lg h-full">
            <DistributionDetailsPanel 
              currentSpeciesId={currentSpeciesId}
              speciesName={speciesName}
              scientificName={scientificName}
              profileImageUrl={profileImageUrl}
              slug={slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionWrapper;