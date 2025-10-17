'use client';
import TurtleDistributionMap from './TurtleDistributionMap';

interface DistributionSectionProps {
  currentSpeciesId?: string | number;
  currentSpeciesName?: string;
  description?: string | null;
}

const DistributionSection: React.FC<DistributionSectionProps> = ({ 
  currentSpeciesId, 
  currentSpeciesName,
  description
}) => {
  return (
    <div id="distribution" className="scroll-mt-20">
      <div className="mb-8 max-w-lg">
        <h2 className="text-5xl font-bold mb-2">Distribution</h2>
        {currentSpeciesName && (
          <p className="text-gray-600">
            {description?.trim() || `Geographic distribution of the ${currentSpeciesName}`}
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