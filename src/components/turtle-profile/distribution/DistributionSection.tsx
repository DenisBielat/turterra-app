'use client';
import TurtleDistributionMap from './TurtleDistributionMap';

interface DistributionSectionProps {
  currentSpeciesId?: string | number;
  currentSpeciesName?: string;
}

const DistributionSection: React.FC<DistributionSectionProps> = ({ 
  currentSpeciesId, 
  currentSpeciesName 
}) => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Distribution</h2>
        {currentSpeciesName && (
          <p className="text-gray-600">
            Geographic distribution of the {currentSpeciesName}
          </p>
        )}
      </div>
      <TurtleDistributionMap 
        selectedSpeciesIds={currentSpeciesId ? [currentSpeciesId] : []} 
      />
    </div>
  );
};

export default DistributionSection; 