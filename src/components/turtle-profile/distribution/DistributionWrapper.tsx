'use client';
import { useState, useEffect } from 'react';
import DistributionSection from './DistributionSection';
import SpeciesSelector from './SpeciesSelector';

interface DistributionWrapperProps {
  currentSpeciesId?: string | number;
}

const DistributionWrapper = ({ currentSpeciesId }: DistributionWrapperProps) => {
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
      
      {/* Map and Species Selector container */}
      <div className="relative">
        {/* Distribution content area - full width */}
        <div className="col-span-12">
          <DistributionSection 
            currentSpeciesId={currentSpeciesId} 
          />
        </div>
        
        {/* Species Selector positioned absolutely to align with map */}
        <div className="absolute top-6 left-6 w-80 z-10">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <SpeciesSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionWrapper;