'use client';
import { useState, useEffect } from 'react';
import DistributionSection from './DistributionSection';
import SpeciesSelector from './SpeciesSelector';

interface DistributionWrapperProps {
  currentSpeciesId?: string | number;
}

const DistributionWrapper = ({ currentSpeciesId }: DistributionWrapperProps) => {
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<(string | number)[]>([]);

  // Initialize with current species
  useEffect(() => {
    if (currentSpeciesId) {
      setSelectedSpeciesIds([currentSpeciesId]);
    }
  }, [currentSpeciesId]);

  return (
    <div>
      {/* Heading outside the map container */}
      <h2 id="distribution" className="scroll-m-20 text-5xl mb-6 text-white">
        Distribution
      </h2>
      
      {/* Map and Species Selector container */}
      <div className="relative">
        {/* Distribution content area - full width */}
        <div className="col-span-12">
          <DistributionSection 
            currentSpeciesId={currentSpeciesId} 
            selectedSpeciesIds={selectedSpeciesIds}
          />
        </div>
        
        {/* Species Selector positioned absolutely to align with map */}
        <div className="absolute top-6 left-6 w-80 z-10">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <SpeciesSelector 
              onChange={setSelectedSpeciesIds} 
              initialSelectedIds={selectedSpeciesIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionWrapper;