'use client';
import { useState } from 'react';
import SpeciesSelector from './SpeciesSelector';
import TurtleDistributionMap from './TurtleDistributionMap';

const DistributionSection = () => {
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<(string | number)[]>([]);
  
  return (
    <>
      <TurtleDistributionMap selectedSpeciesIds={selectedSpeciesIds} />
      <SpeciesSelector onChange={setSelectedSpeciesIds} />
    </>
  );
};

export default DistributionSection; 