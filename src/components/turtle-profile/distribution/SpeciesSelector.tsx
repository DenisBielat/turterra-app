import React from 'react';

interface SpeciesSelectorProps {
  // Placeholder props for future use
}

const SpeciesSelector: React.FC<SpeciesSelectorProps> = () => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Distribution Controls</h3>
      <p className="text-sm text-gray-600 mb-3">
        Additional controls will be added here in the future.
      </p>
      
      {/* Placeholder content */}
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-sm text-gray-500 text-center">
          Coming soon...
        </p>
      </div>
    </div>
  );
};

export default SpeciesSelector;