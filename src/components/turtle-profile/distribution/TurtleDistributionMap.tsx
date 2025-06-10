import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapMouseEvent, ViewState, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/db/supabaseClient';
import type { FeatureCollection, Feature, MultiPolygon } from 'geojson';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Define types for our component
interface SpeciesData {
  speciesId: string | number;
  speciesName: string;
  scientificName: string;
  avatarUrl: string;
  geojson: FeatureCollection<MultiPolygon>;
}

interface LayerState {
  native: boolean;
  introduced: boolean;
  extinct: boolean;
}

interface TurtleDistributionMapProps {
  selectedSpeciesIds?: (string | number)[];
}

interface HoveredFeature {
  properties: {
    region_name: string;
    presence_status: 'Native' | 'Introduced' | 'Extinct';
    species_name: string;
  };
  geometry: {
    coordinates: number[][][][];
  };
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
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeature | null>(null);
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    native: true,
    introduced: true,
    extinct: true
  });
  
  // Fetch distribution GeoJSON for selected species
  useEffect(() => {
    const fetchDistributions = async () => {
      if (selectedSpeciesIds.length === 0) {
        setSpeciesData([]);
        return;
      }
      
      // Add console log to check selected IDs
      console.log('Fetching distributions for species IDs:', selectedSpeciesIds);
      
      const promises = selectedSpeciesIds.map(async (speciesId) => {
        // Using the database function we created
        const { data: geojsonData, error: geojsonError } = await supabase
          .rpc('get_species_geojson', { p_species_id: speciesId });
          
        // Add console log to check GeoJSON data
        console.log('GeoJSON data for species', speciesId, ':', geojsonData);
          
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
      // Add console log to check final processed data
      console.log('Processed species data:', results.filter((item): item is SpeciesData => item !== null));
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

  // Memoize filterFeaturesByType
  const filterFeaturesByType = useMemo(() => (features: any[], type: string) => {
    if (!features || !Array.isArray(features)) return [];
    
    return features.filter(f => {
      const status = f.properties.presence_status;
      switch(type.toLowerCase()) {
        case 'native': return status === 'Native';
        case 'introduced': return status === 'Introduced';
        case 'extinct': return status === 'Extinct';
        default: return false;
      }
    });
  }, []);
  
  useEffect(() => {
    console.log('Map configuration:', {
      token: !!MAPBOX_TOKEN, // just log if it exists, not the actual token
      style: process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11'
    });
  }, []);
  
  useEffect(() => {
    speciesData.forEach(species => {
      const features = species.geojson?.features || [];
      console.log('Layer debug for species', species.speciesName, {
        nativeFeatures: filterFeaturesByType(features, 'native').length,
        introducedFeatures: filterFeaturesByType(features, 'introduced').length,
        extinctFeatures: filterFeaturesByType(features, 'extinct').length,
        allFeatures: features.length,
        sampleFeature: features[0]?.properties
      });
    });
  }, [speciesData, filterFeaturesByType]);
  
  // Add this effect to clean up removed species layers
  useEffect(() => {
    // Get all current species IDs
    const currentSpeciesIds = new Set(speciesData.map(s => s.speciesId));
    
    // Get all previously rendered species IDs by checking existing source IDs
    const map = mapRef.current?.getMap();
    if (!map) return;

    const style = map.getStyle();
    if (!style?.sources) return;
    
    const existingSources = style.sources;
    const sourceIds = Object.keys(existingSources);
    
    // Remove sources and layers for species that are no longer in speciesData
    sourceIds.forEach(sourceId => {
      if (sourceId.startsWith('species-')) {
        const speciesId = sourceId.split('-')[1];
        if (!currentSpeciesIds.has(Number(speciesId))) {
          if (map.getSource(sourceId)) {
            // Remove associated layers first
            const layerTypes = ['native', 'introduced', 'extinct'];
            layerTypes.forEach(type => {
              const layerId = `species-${speciesId}-${type}-fill`;
              if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
              }
            });
            // Then remove the source
            map.removeSource(sourceId);
          }
        }
      }
    });
  }, [speciesData]);

  // Add a map reference
  const mapRef = useRef<MapRef>(null);

  const transformCoordinates = (geojson: FeatureCollection<MultiPolygon>) => {
    return {
      ...geojson,
      features: geojson.features.map(feature => ({
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: feature.geometry.coordinates.map(polygon =>
            polygon.map(ring =>
              ring.map(coord => [
                Number(coord[0].toFixed(6)),
                Number(coord[1].toFixed(6))
              ])
            )
          )
        }
      }))
    };
  };

  return (
    <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        projection="mercator"
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11'}
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5
        }}
        interactiveLayerIds={
          speciesData.flatMap((species, speciesIndex) => 
            (Object.keys(activeLayers) as Array<keyof LayerState>)
              .filter(type => activeLayers[type])
              .map(type => `species-${species.speciesId}-${type}-fill`)
          )
        }
        onMouseMove={(e: MapMouseEvent) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.properties && 
                'region_name' in feature.properties && 
                'presence_status' in feature.properties && 
                'species_name' in feature.properties) {
              setHoveredFeature({
                properties: {
                  region_name: feature.properties.region_name as string,
                  presence_status: feature.properties.presence_status as 'Native' | 'Introduced' | 'Extinct',
                  species_name: feature.properties.species_name as string
                },
                geometry: feature.geometry as { coordinates: number[][][][] }
              });
            }
          }
        }}
        onMouseLeave={() => setHoveredFeature(null)}
      >
        <NavigationControl position="top-right" />
        
        {/* Render each species distribution */}
        {speciesData.map((species, speciesIndex) => {
          const colorScale = getColorScale(speciesIndex);
          
          if (!species.geojson || !species.geojson.features) {
            console.log('Invalid GeoJSON data for species:', species);
            return null;
          }
          
          return (
            <React.Fragment key={`species-${species.speciesId}-native-fill`}>
              <Source 
                id={`species-${species.speciesId}-native-fill`} 
                type="geojson" 
                data={transformCoordinates(species.geojson)}
              >
                <Layer
                  id={`species-${species.speciesId}-native-fill`}
                  type="fill"
                  paint={{
                    'fill-color': colorScale.native.fillColor,
                    'fill-opacity': 0.5,
                    'fill-outline-color': colorScale.native.lineColor
                  }}
                />
              </Source>
              <Source 
                id={`species-${species.speciesId}-introduced-fill`} 
                type="geojson" 
                data={transformCoordinates(species.geojson)}
              >
                <Layer
                  id={`species-${species.speciesId}-introduced-fill`}
                  type="fill"
                  paint={{
                    'fill-color': colorScale.introduced.fillColor,
                    'fill-opacity': 0.5,
                    'fill-outline-color': colorScale.introduced.lineColor
                  }}
                />
              </Source>
              <Source 
                id={`species-${species.speciesId}-extinct-fill`} 
                type="geojson" 
                data={transformCoordinates(species.geojson)}
              >
                <Layer
                  id={`species-${species.speciesId}-extinct-fill`}
                  type="fill"
                  paint={{
                    'fill-color': colorScale.extinct.fillColor,
                    'fill-opacity': 0.5,
                    'fill-outline-color': colorScale.extinct.lineColor
                  }}
                />
              </Source>
            </React.Fragment>
          );
        })}
        
        {/* Update the Popup component */}
        {hoveredFeature && hoveredFeature.properties && 
         !isNaN(hoveredFeature.geometry.coordinates[0][0][0][0]) && 
         !isNaN(hoveredFeature.geometry.coordinates[0][0][0][1]) && (
          <Popup
            longitude={Number(hoveredFeature.geometry.coordinates[0][0][0][0])}
            latitude={Number(hoveredFeature.geometry.coordinates[0][0][0][1])}
            anchor="bottom"
            onClose={() => setHoveredFeature(null)}
            closeButton={false}
            closeOnClick={false}
          >
            <div className="p-2">
              <h3 className="font-bold text-sm">{hoveredFeature.properties.region_name || 'Region'}</h3>
              <p className="text-xs">
                {hoveredFeature.properties.presence_status === 'Native' ? 'Native' : 
                 hoveredFeature.properties.presence_status === 'Introduced' ? 'Introduced' : 
                 'Extinct'} Range
              </p>
              <p className="text-xs italic">{hoveredFeature.properties.species_name}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default TurtleDistributionMap;