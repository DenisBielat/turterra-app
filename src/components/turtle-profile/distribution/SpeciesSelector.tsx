// components/SpeciesSelector.js
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/db/supabaseClient';

interface Species {
  id: string | number;
  species_common_name: string;
  species_scientific_name: string;
  avatar_image_circle_url?: string;
}

interface SpeciesSelectorProps {
  onChange: (selectedIds: (string | number)[]) => void;
  maxSpecies?: number;
}

const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({ onChange, maxSpecies = 3 }) => {
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all species with distribution data
  useEffect(() => {
    const fetchSpecies = async () => {
      setLoading(true);
      
      // First get species IDs that have distribution data
      const { data: distributionData, error: distributionError } = await supabase
        .from('species_distributions')
        .select('species_id');
      
      if (distributionError) {
        console.error('Error fetching distributions:', distributionError);
        setLoading(false);
        return;
      }
      
      // Create a Set to get unique species IDs
      const uniqueSpeciesIds = [...new Set(distributionData.map(item => item.species_id))];
      
      // Then get the species details for those IDs
      const { data, error } = await supabase
        .from('turtle_species')
        .select('id, species_common_name, species_scientific_name, avatar_image_circle_url')
        .in('id', uniqueSpeciesIds);
      
      if (error) {
        console.error('Error fetching species:', error);
      } else {
        setAllSpecies(data || []);
      }
      
      setLoading(false);
    };
    
    fetchSpecies();
  }, []);

  // Filter species based on search query
  const filteredSpecies = allSpecies.filter(species => 
    species.species_common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    species.species_scientific_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle species selection
  const toggleSpecies = (species: Species) => {
    let newSelected = [...selectedSpecies];
    
    const index = newSelected.findIndex(s => s.id === species.id);
    if (index > -1) {
      // Remove if already selected
      newSelected.splice(index, 1);
    } else if (newSelected.length < maxSpecies) {
      // Add if under max limit
      newSelected.push(species);
    } else {
      // Replace the first item if at max
      newSelected.shift();
      newSelected.push(species);
    }
    
    setSelectedSpecies(newSelected);
    
    // Call the onChange prop with only the IDs
    if (onChange) {
      onChange(newSelected.map(s => s.id));
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Compare Turtle Distributions</h3>
      <p className="text-sm text-gray-600 mb-3">
        Select up to {maxSpecies} species to compare their distributions
      </p>
      
      {/* Search input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search species..."
          className="w-full p-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Selected species */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-1">Selected Species:</h4>
        <div className="flex flex-wrap gap-2">
          {selectedSpecies.length === 0 ? (
            <span className="text-sm text-gray-500">No species selected</span>
          ) : (
            selectedSpecies.map(species => (
              <div
                key={species.id}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{species.species_common_name}</span>
                <button
                  onClick={() => toggleSpecies(species)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Species list */}
      <div className="border rounded-md max-h-60 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading species...</div>
        ) : filteredSpecies.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No species found</div>
        ) : (
          filteredSpecies.map(species => (
            <div
              key={species.id}
              onClick={() => toggleSpecies(species)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 flex items-center
                ${selectedSpecies.some(s => s.id === species.id) ? 'bg-green-50' : ''}`}
            >
              {species.avatar_image_circle_url && (
                <img 
                  src={species.avatar_image_circle_url} 
                  alt={species.species_common_name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              )}
              <div>
                <div className="font-medium">{species.species_common_name}</div>
                <div className="text-sm text-gray-600 italic">{species.species_scientific_name}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SpeciesSelector;