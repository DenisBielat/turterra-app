import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, ViewState, MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
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
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const hoveredIdStr = hoveredFeatureId ?? '';
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    native: true,
    introduced: true,
    extinct: true
  });
  
  // Track zoom level for layer visibility
  const [currentZoom, setCurrentZoom] = useState(1.5);
  const ZOOM_BREAKPOINT = 2.5; // Show states when zoom >= 2.5, countries when zoom < 2.5
  
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
  
  // Helper function to darken a hex color
  const darkenColor = useCallback((hex: string, amount: number = 0.2) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }, []);

  // Define color for each species (up to 3)
  const getColorScale = useCallback((index: number) => {
    // Different base colors for each species
    const colorScales = [
      // Species 1: Blue scale
      {
        native: { fillColor: '#60a5fa', lineColor: '#2563eb', hoverFillColor: '#3b82f6' }, // blue-400, blue-600, blue-500
        introduced: { fillColor: '#93c5fd', lineColor: '#3b82f6', hoverFillColor: '#60a5fa' }, // blue-300, blue-500, blue-400
        extinct: { fillColor: '#bfdbfe', lineColor: '#60a5fa', hoverFillColor: '#93c5fd' }  // blue-200, blue-400, blue-300
      },
      // Species 2: Purple scale
      {
        native: { fillColor: '#a78bfa', lineColor: '#7c3aed', hoverFillColor: '#8b5cf6' }, // purple-400, purple-600, purple-500
        introduced: { fillColor: '#c4b5fd', lineColor: '#8b5cf6', hoverFillColor: '#a78bfa' }, // purple-300, purple-500, purple-400
        extinct: { fillColor: '#ddd6fe', lineColor: '#a78bfa', hoverFillColor: '#c4b5fd' }  // purple-200, purple-400, purple-300
      },
      // Species 3: Green scale
      {
        native: { fillColor: '#4ade80', lineColor: '#16a34a', hoverFillColor: '#22c55e' }, // green-400, green-600, green-500
        introduced: { fillColor: '#86efac', lineColor: '#22c55e', hoverFillColor: '#4ade80' }, // green-300, green-500, green-400
        extinct: { fillColor: '#bbf7d0', lineColor: '#4ade80', hoverFillColor: '#86efac' }  // green-200, green-400, green-300
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
        
        // Use the bbox from the GeoJSON if available
        const allFeatures = speciesData.flatMap(species => species.geojson?.features || []);
        
        if (allFeatures.length > 0) {
          // Try to use the bbox from the first species GeoJSON
          const firstSpecies = speciesData[0];
          if (firstSpecies.geojson.bbox) {
            console.log('🎯 Using GeoJSON bbox:', firstSpecies.geojson.bbox);
            map.fitBounds([
              [firstSpecies.geojson.bbox[0], firstSpecies.geojson.bbox[1]],
              [firstSpecies.geojson.bbox[2], firstSpecies.geojson.bbox[3]]
            ], {
              padding: 50,
              duration: 1500,
              easing: (t) => t * (2 - t)
            });
          } else {
            console.log('🎯 No bbox in GeoJSON, using default zoom');
            // Just zoom to a reasonable level if no bbox
            map.easeTo({
              zoom: 3,
              duration: 1500,
              easing: (t) => t * (2 - t)
            });
          }
        } else {
          console.warn('⚠️ No features found for auto-zoom');
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
            const fid = feature.id == null ? '' : String(feature.id);
            setHoveredFeatureId(fid);
            // Change cursor to pointer
            if (e.target.getCanvas()) {
              e.target.getCanvas().style.cursor = 'pointer';
            }
          }
        }}
        onMouseLeave={() => {
          setHoveredFeatureId(null);
          // Reset cursor
          if (mapRef.current) {
            const canvas = mapRef.current.getCanvas();
            if (canvas) {
              canvas.style.cursor = '';
            }
          }
        }}
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
              const origin = feature.properties?.origin || feature.properties?.presence_status;
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
                    ['==', ['to-string', ['id']], hoveredIdStr],
                    [
                      'case',
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Native']], colorScale.native.hoverFillColor,
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Introduced']], colorScale.introduced.hoverFillColor,
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Extinct']], colorScale.extinct.hoverFillColor,
                      colorScale.native.hoverFillColor // fallback color
                    ],
                    [
                      'case',
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Native']], colorScale.native.fillColor,
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Introduced']], colorScale.introduced.fillColor,
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Extinct']], colorScale.extinct.fillColor,
                      colorScale.native.fillColor // fallback color
                    ]
                  ],
                  'fill-opacity': 0.6,
                  'fill-outline-color': [
                    'case',
                    ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Native']], colorScale.native.lineColor,
                    ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Introduced']], colorScale.introduced.lineColor,
                    ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Extinct']], colorScale.extinct.lineColor,
                    colorScale.native.lineColor // fallback color
                  ]
                }}
                filter={[
                  'any',
                  ...(activeLayers.native ? [['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Native']]] : []),
                  ...(activeLayers.introduced ? [['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Introduced']]] : []),
                  ...(activeLayers.extinct ? [['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Extinct']]] : [])
                ]}
              />
            </Source>
          );
        })}
      </Map>
    </div>
  );
};

export default TurtleDistributionMap;