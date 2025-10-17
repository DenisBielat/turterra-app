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
    origin: 'Native' | 'Introduced' | 'Extinct';
    species_name: string;
    region_level: string;
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
  
  // Track zoom level for layer visibility
  const [currentZoom, setCurrentZoom] = useState(1.5);
  const ZOOM_BREAKPOINT = 4; // Show states when zoom >= 4, countries when zoom < 4
  
  // Fetch distribution GeoJSON for selected species
  useEffect(() => {
    const fetchDistributions = async () => {
      if (selectedSpeciesIds.length === 0) {
        console.log('No species IDs provided, clearing species data');
        setSpeciesData([]);
        return;
      }
      
      console.log('🔍 Fetching distributions for species IDs:', selectedSpeciesIds);
      
      const promises = selectedSpeciesIds.map(async (speciesId) => {
        console.log(`📊 Fetching data for species ID: ${speciesId}`);
        
        // Using the database function
        const { data: geojsonData, error: geojsonError } = await supabase
          .rpc('get_species_geojson', { p_species_id: speciesId });
          
        console.log(`🗺️ GeoJSON response for species ${speciesId}:`, {
          data: geojsonData,
          error: geojsonError,
          hasFeatures: geojsonData?.features?.length || 0
        });
          
        if (geojsonError) {
          console.error(`❌ Error fetching distribution for species ${speciesId}:`, geojsonError);
          return null;
        }
        
        if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
          console.warn(`⚠️ No distribution data found for species ${speciesId}`);
          return null;
        }
        
        // Also get species info
        const { data: speciesInfo, error: speciesError } = await supabase
          .from('turtle_species')
          .select('id, species_common_name, species_scientific_name, avatar_image_circle_url')
          .eq('id', speciesId)
          .single();
          
        if (speciesError) {
          console.error(`❌ Error fetching species info for species ${speciesId}:`, speciesError);
          return null;
        }
        
        const result = {
          speciesId: speciesInfo.id,
          speciesName: speciesInfo.species_common_name,
          scientificName: speciesInfo.species_scientific_name,
          avatarUrl: speciesInfo.avatar_image_circle_url,
          geojson: geojsonData
        };
        
        console.log(`✅ Successfully processed data for ${speciesInfo.species_common_name}:`, {
          featuresCount: geojsonData.features.length,
          sampleFeature: geojsonData.features[0]?.properties
        });
        
        return result;
      });
      
      const results = await Promise.all(promises);
      const validResults = results.filter((item): item is SpeciesData => item !== null);
      
      console.log('📋 Final processed species data:', {
        totalRequested: selectedSpeciesIds.length,
        totalReceived: validResults.length,
        speciesNames: validResults.map(s => s.speciesName)
      });
      
      setSpeciesData(validResults);
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
  
  // Auto-zoom to species distribution when data loads
  useEffect(() => {
    if (speciesData.length > 0 && mapRef.current) {
      const map = mapRef.current.getMap();
      
      // Wait for map to be fully loaded
      const waitForMapLoad = () => {
        if (!map.isStyleLoaded()) {
          console.log('⏳ Waiting for map style to load...');
          setTimeout(waitForMapLoad, 100);
          return;
        }
        
        console.log('🗺️ Map style loaded, calculating bounds...');
        
        // Calculate bounding box for all species
        let bounds: number[][] | null = null;
        
        speciesData.forEach(species => {
          if (species.geojson && species.geojson.features) {
            species.geojson.features.forEach(feature => {
              if (feature.geometry && feature.geometry.coordinates) {
                // For MultiPolygon, iterate through all polygons and rings
                feature.geometry.coordinates.forEach(polygon => {
                  polygon.forEach(ring => {
                    ring.forEach(coord => {
                      if (!bounds) {
                        bounds = [[coord[0], coord[1]], [coord[0], coord[1]]];
                      } else {
                        bounds[0][0] = Math.min(bounds[0][0], coord[0]);
                        bounds[0][1] = Math.min(bounds[0][1], coord[1]);
                        bounds[1][0] = Math.max(bounds[1][0], coord[0]);
                        bounds[1][1] = Math.max(bounds[1][1], coord[1]);
                      }
                    });
                  });
                });
              }
            });
          }
        });
        
        // Fit map to bounds with some padding
        if (bounds) {
          const padding = 0.1; // 10% padding
          const width = bounds[1][0] - bounds[0][0];
          const height = bounds[1][1] - bounds[0][1];
          
          const paddedBounds: [[number, number], [number, number]] = [
            [bounds[0][0] - width * padding, bounds[0][1] - height * padding],
            [bounds[1][0] + width * padding, bounds[1][1] + height * padding]
          ];
          
          console.log('🎯 Fitting map to bounds:', paddedBounds);
          
          map.fitBounds(paddedBounds, {
            padding: 50,
            duration: 1500,
            easing: (t) => t * (2 - t) // ease-out
          });
        } else {
          console.warn('⚠️ No bounds calculated from species data');
        }
      };
      
      waitForMapLoad();
    }
  }, [speciesData]);

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
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-medium mb-2">Distribution Types</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeLayers.native}
              onChange={() => toggleLayer('native')}
              className="rounded"
            />
            <span className="text-sm">
              <span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: '#60a5fa'}}></span>
              Native
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeLayers.introduced}
              onChange={() => toggleLayer('introduced')}
              className="rounded"
            />
            <span className="text-sm">
              <span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: '#a78bfa'}}></span>
              Introduced
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeLayers.extinct}
              onChange={() => toggleLayer('extinct')}
              className="rounded"
            />
            <span className="text-sm">
              <span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: '#4ade80'}}></span>
              Extinct
            </span>
          </label>
        </div>
      </div>
      <Map
        ref={mapRef}
        {...viewState}
        projection="mercator"
        onMove={evt => {
          setViewState(evt.viewState);
          setCurrentZoom(evt.viewState.zoom);
        }}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11'}
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5
        }}
        interactiveLayerIds={
          speciesData.map(species => `species-${species.speciesId}-fill`)
        }
        onMouseMove={(e: MapMouseEvent) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.properties && 
                'region_name' in feature.properties && 
                'origin' in feature.properties && 
                'species_name' in feature.properties) {
              setHoveredFeature({
                properties: {
                  region_name: feature.properties.region_name as string,
                  origin: feature.properties.origin as 'Native' | 'Introduced' | 'Extinct',
                  species_name: feature.properties.species_name as string,
                  region_level: feature.properties.region_level as string
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
          
          console.log(`🎨 Rendering layers for species: ${species.speciesName}`, {
            hasGeoJSON: !!species.geojson,
            hasFeatures: !!species.geojson?.features,
            featuresCount: species.geojson?.features?.length || 0,
            sampleFeature: species.geojson?.features?.[0]?.properties
          });
          
          if (!species.geojson || !species.geojson.features) {
            console.log('❌ Invalid GeoJSON data for species:', species);
            return null;
          }
          
          // Filter features by zoom level and origin status
          const filteredGeoJSON = {
            ...species.geojson,
            features: species.geojson.features.filter(feature => {
              const origin = feature.properties?.origin;
              const regionLevel = feature.properties?.region_level;
              
              // Map origin to layer types (assuming origin values match layer names)
              const isActiveLayer = activeLayers.native && origin === 'Native' ||
                                   activeLayers.introduced && origin === 'Introduced' ||
                                   activeLayers.extinct && origin === 'Extinct';
              
              console.log(`🔍 Feature filter for ${species.speciesName}:`, {
                origin,
                regionLevel,
                isActiveLayer,
                activeLayers,
                featureProperties: feature.properties
              });
              
              if (!isActiveLayer) return false;
              
              // Add zoom-based filtering for country/state levels
              const shouldShowAtCurrentZoom = 
                (regionLevel === 'country' && currentZoom < ZOOM_BREAKPOINT) ||
                (regionLevel === 'state' && currentZoom >= ZOOM_BREAKPOINT) ||
                (regionLevel !== 'country' && regionLevel !== 'state'); // Show other levels always
              
              return shouldShowAtCurrentZoom;
            })
          };
          
          console.log(`📊 Filtered GeoJSON for ${species.speciesName}:`, {
            originalFeatures: species.geojson.features.length,
            filteredFeatures: filteredGeoJSON.features.length
          });
          
          // Only render if there are features to show
          if (filteredGeoJSON.features.length === 0) {
            console.log(`⚠️ No features to render for ${species.speciesName}`);
            return null;
          }
          
          console.log(`✅ Rendering source and layer for ${species.speciesName}`);
          
          return (
            <Source 
              key={`species-${species.speciesId}`}
              id={`species-${species.speciesId}`} 
              type="geojson" 
              data={transformCoordinates(filteredGeoJSON)}
            >
              <Layer
                id={`species-${species.speciesId}-fill`}
                type="fill"
                paint={{
                  'fill-color': [
                    'case',
                    ['==', ['get', 'origin'], 'Native'], colorScale.native.fillColor,
                    ['==', ['get', 'origin'], 'Introduced'], colorScale.introduced.fillColor,
                    colorScale.extinct.fillColor
                  ],
                  'fill-opacity': 0.6,
                  'fill-outline-color': [
                    'case',
                    ['==', ['get', 'origin'], 'Native'], colorScale.native.lineColor,
                    ['==', ['get', 'origin'], 'Introduced'], colorScale.introduced.lineColor,
                    colorScale.extinct.lineColor
                  ]
                }}
                filter={[
                  'any',
                  ...(activeLayers.native ? [['==', ['get', 'origin'], 'Native']] : []),
                  ...(activeLayers.introduced ? [['==', ['get', 'origin'], 'Introduced']] : []),
                  ...(activeLayers.extinct ? [['==', ['get', 'origin'], 'Extinct']] : [])
                ]}
              />
            </Source>
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
                {hoveredFeature.properties.origin === 'Native' ? 'Native' : 
                 hoveredFeature.properties.origin === 'Introduced' ? 'Introduced' : 
                 'Extinct'} Range
              </p>
              <p className="text-xs text-gray-600">{hoveredFeature.properties.region_level}</p>
              <p className="text-xs italic">{hoveredFeature.properties.species_name}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default TurtleDistributionMap;