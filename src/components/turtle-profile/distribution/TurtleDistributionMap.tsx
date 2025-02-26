import React, { useState, useEffect, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapMouseEvent, ViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/db/supabaseClient';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Define types for our component
interface SpeciesData {
  speciesId: string | number;
  speciesName: string;
  scientificName: string;
  avatarUrl: string;
  geojson: {
    features: Array<{
      properties: {
        presence_status: string;
        origin: string;
        region_name: string;
        species_name: string;
      };
      geometry: {
        coordinates: number[][][];
      };
    }>;
  };
}

interface LayerState {
  native: boolean;
  introduced: boolean;
  extinct: boolean;
}

interface TurtleDistributionMapProps {
  selectedSpeciesIds?: (string | number)[];
}

const TurtleDistributionMap: React.FC<TurtleDistributionMapProps> = ({ selectedSpeciesIds = [] }) => {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 20, // Centered to show most turtle habitats
    zoom: 1.5,
    bearing: 0,
    pitch: 0,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });
  
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    native: true,
    introduced: true,
    extinct: true
  });
  
  // Fetch distribution GeoJSON for selected species
  useEffect(() => {
    const fetchDistributions = async () => {
      if (selectedSpeciesIds.length === 0) return;
      
      // For each selected species, fetch its distribution geojson directly
      const promises = selectedSpeciesIds.map(async (speciesId) => {
        // Using the database function we created
        const { data: geojsonData, error: geojsonError } = await supabase
          .rpc('get_species_geojson', { p_species_id: speciesId });
          
        if (geojsonError) {
          console.error('Error fetching distribution:', geojsonError);
          return null;
        }
        
        // Also get species info
        const { data: speciesInfo, error: speciesError } = await supabase
          .from('turtle_species')
          .select('id, species_common_name, species_scientific_name, avatar_image_circle_url')
          .eq('id', speciesId)
          .single();
          
        if (speciesError) {
          console.error('Error fetching species info:', speciesError);
          return null;
        }
        
        return {
          speciesId: speciesInfo.id,
          speciesName: speciesInfo.species_common_name,
          scientificName: speciesInfo.species_scientific_name,
          avatarUrl: speciesInfo.avatar_image_circle_url,
          geojson: geojsonData
        };
      });
      
      const results = await Promise.all(promises);
      setSpeciesData(results.filter((item): item is SpeciesData => item !== null));
    };
    
    fetchDistributions();
  }, [selectedSpeciesIds]);
  
  // Define color for each species (up to 3)
  const getColorScale = useCallback((index: number) => {
    // Different base colors for each species
    const colorScales = [
      // Species 1: Blue scale
      {
        native: { fillColor: '#60a5fa', lineColor: '#2563eb' }, // blue-400, blue-600
        introduced: { fillColor: '#93c5fd', lineColor: '#3b82f6' }, // blue-300, blue-500 
        extinct: { fillColor: '#bfdbfe', lineColor: '#60a5fa' }  // blue-200, blue-400
      },
      // Species 2: Purple scale
      {
        native: { fillColor: '#a78bfa', lineColor: '#7c3aed' }, // purple-400, purple-600
        introduced: { fillColor: '#c4b5fd', lineColor: '#8b5cf6' }, // purple-300, purple-500
        extinct: { fillColor: '#ddd6fe', lineColor: '#a78bfa' }  // purple-200, purple-400
      },
      // Species 3: Green scale
      {
        native: { fillColor: '#4ade80', lineColor: '#16a34a' }, // green-400, green-600
        introduced: { fillColor: '#86efac', lineColor: '#22c55e' }, // green-300, green-500
        extinct: { fillColor: '#bbf7d0', lineColor: '#4ade80' }  // green-200, green-400
      }
    ];
    
    return colorScales[index % colorScales.length];
  }, []);
  
  // Toggle layer visibility
  const toggleLayer = (layerType: keyof LayerState) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerType]: !prev[layerType]
    }));
  };

  // Helper to filter GeoJSON features by type
  const filterFeaturesByType = useCallback((features: any[], type: string, origin?: string) => {
    if (!features || !Array.isArray(features)) return [];
    
    return features.filter(f => {
      if (type === 'extinct') {
        return f.properties.presence_status === 'extinct';
      }
      return f.properties.presence_status === 'extant' && f.properties.origin === origin;
    });
  }, []);
  
  return (
    <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11'}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={
          speciesData.flatMap((species, speciesIndex) => 
            (Object.keys(activeLayers) as Array<keyof LayerState>)
              .filter(type => activeLayers[type])
              .map(type => `species-${species.speciesId}-${type}-fill`)
          )
        }
        onMouseMove={(e: MapMouseEvent) => {
          if (e.features && e.features.length > 0) {
            setHoveredFeature(e.features[0]);
          }
        }}
        onMouseLeave={() => setHoveredFeature(null)}
      >
        <NavigationControl position="top-right" />
        
        {/* Render each species distribution */}
        {speciesData.map((species, speciesIndex) => {
          const colorScale = getColorScale(speciesIndex);
          
          if (!species.geojson || !species.geojson.features) {
            return null;
          }
          
          return (
            <React.Fragment key={`species-source-${species.speciesId}`}>
              {/* Native range */}
              {activeLayers.native && (
                <Source
                  id={`source-${species.speciesId}-native`}
                  type="geojson"
                  data={{
                    type: 'FeatureCollection',
                    features: filterFeaturesByType(species.geojson.features, 'native', 'native')
                  }}
                >
                  <Layer
                    id={`species-${species.speciesId}-native-fill`}
                    type="fill"
                    paint={{
                      'fill-color': colorScale.native.fillColor,
                      'fill-opacity': 0.5
                    }}
                  />
                  <Layer
                    id={`species-${species.speciesId}-native-line`}
                    type="line"
                    paint={{
                      'line-color': colorScale.native.lineColor,
                      'line-width': 1
                    }}
                  />
                </Source>
              )}
              
              {/* Introduced range */}
              {activeLayers.introduced && (
                <Source
                  id={`source-${species.speciesId}-introduced`}
                  type="geojson"
                  data={{
                    type: 'FeatureCollection',
                    features: filterFeaturesByType(species.geojson.features, 'introduced', 'introduced')
                  }}
                >
                  <Layer
                    id={`species-${species.speciesId}-introduced-fill`}
                    type="fill"
                    paint={{
                      'fill-color': colorScale.introduced.fillColor,
                      'fill-opacity': 0.5
                    }}
                  />
                  <Layer
                    id={`species-${species.speciesId}-introduced-line`}
                    type="line"
                    paint={{
                      'line-color': colorScale.introduced.lineColor,
                      'line-width': 1,
                      'line-dasharray': [3, 1]
                    }}
                  />
                </Source>
              )}
              
              {/* Extinct range */}
              {activeLayers.extinct && (
                <Source
                  id={`source-${species.speciesId}-extinct`}
                  type="geojson"
                  data={{
                    type: 'FeatureCollection',
                    features: filterFeaturesByType(species.geojson.features, 'extinct')
                  }}
                >
                  <Layer
                    id={`species-${species.speciesId}-extinct-fill`}
                    type="fill"
                    paint={{
                      'fill-color': colorScale.extinct.fillColor,
                      'fill-opacity': 0.4
                    }}
                  />
                  <Layer
                    id={`species-${species.speciesId}-extinct-line`}
                    type="line"
                    paint={{
                      'line-color': colorScale.extinct.lineColor,
                      'line-width': 1,
                      'line-dasharray': [2, 2]
                    }}
                  />
                </Source>
              )}
            </React.Fragment>
          );
        })}
        
        {/* Popup for hovering */}
        {hoveredFeature && hoveredFeature.properties && (
          <Popup
            longitude={hoveredFeature.geometry.coordinates[0][0][0]}
            latitude={hoveredFeature.geometry.coordinates[0][0][1]}
            anchor="bottom"
            onClose={() => setHoveredFeature(null)}
            closeButton={false}
            closeOnClick={false}
          >
            <div className="p-2">
              <h3 className="font-bold text-sm">{hoveredFeature.properties.region_name || 'Region'}</h3>
              <p className="text-xs">
                {hoveredFeature.properties.presence_status === 'extant' ? 'Current' : 'Extinct'} range
                {hoveredFeature.properties.origin && ` (${hoveredFeature.properties.origin})`}
              </p>
              <p className="text-xs italic">{hoveredFeature.properties.species_name}</p>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-md shadow-md">
        <h4 className="font-bold text-sm mb-2">Range Types</h4>
        <div className="space-y-1">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={activeLayers.native}
              onChange={() => toggleLayer('native')}
              className="mr-2"
            />
            Native
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={activeLayers.introduced}
              onChange={() => toggleLayer('introduced')}
              className="mr-2"
            />
            Introduced
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={activeLayers.extinct}
              onChange={() => toggleLayer('extinct')}
              className="mr-2"
            />
            Extinct
          </label>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md">
        <h4 className="font-bold text-sm mb-2">Species Legend</h4>
        {speciesData.map((species, index) => {
          const colorScale = getColorScale(index);
          
          return (
            <div key={`legend-${species.speciesId}`} className="mb-3 flex items-center">
              {species.avatarUrl && (
                <img 
                  src={species.avatarUrl} 
                  alt={species.speciesName}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              )}
              <div>
                <div className="text-sm font-medium">{species.speciesName}</div>
                <div className="text-xs italic">{species.scientificName}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TurtleDistributionMap;