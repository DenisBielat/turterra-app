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
    <>
      {/* Left sidebar for SpeciesSelector */}
      <div className="col-span-3 flex flex-col justify-start w-full">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <SpeciesSelector 
            onChange={setSelectedSpeciesIds} 
            initialSelectedIds={selectedSpeciesIds}
          />
        </div>
      </div>
      
      {/* Distribution content area */}
      <div className="col-span-9">
        <DistributionSection 
          currentSpeciesId={currentSpeciesId} 
          selectedSpeciesIds={selectedSpeciesIds}
        />
      </div>
    </>
  );
};

export default DistributionWrapper;