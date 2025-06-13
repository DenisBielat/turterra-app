'use client';
import { useState, useEffect } from 'react';
import SpeciesSelector from './SpeciesSelector';
import TurtleDistributionMap from './TurtleDistributionMap';

interface DistributionSectionProps {
  currentSpeciesId?: string | number;
}

const DistributionSection = ({ currentSpeciesId }: DistributionSectionProps) => {
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<(string | number)[]>([]);
  
  // Set initial species when currentSpeciesId changes
  useEffect(() => {
    if (currentSpeciesId) {
      setSelectedSpeciesIds([currentSpeciesId]);
    }
  }, [currentSpeciesId]);
  
  return (
    <>
      <TurtleDistributionMap selectedSpeciesIds={selectedSpeciesIds} />
      <SpeciesSelector onChange={setSelectedSpeciesIds} />
    </>
  );
};

export default DistributionSection; 