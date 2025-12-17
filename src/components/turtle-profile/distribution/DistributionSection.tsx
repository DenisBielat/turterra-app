'use client';
import TurtleDistributionMap from './TurtleDistributionMap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      <div className="mb-8 max-w-2xl">
        <h2 className="text-5xl font-bold mb-8">Distribution</h2>
        {currentSpeciesName && (
          <div className="text-base whitespace-pre-line">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description?.trim() || `Geographic distribution of the ${currentSpeciesName}`}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <TurtleDistributionMap 
        selectedSpeciesIds={currentSpeciesId ? [currentSpeciesId] : []} 
      />
    </div>
  );
};

export default DistributionSection; 