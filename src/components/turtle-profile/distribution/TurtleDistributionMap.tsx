import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapMouseEvent, ViewState, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/lib/db/supabaseClient';
import type { FeatureCollection, Feature, Geometry } from 'geojson';

// Constants
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const ZOOM_THRESHOLDS = {
  COUNTRY_TO_STATE: 4,
};

const COLOR_SCALES = [
  { native: '#2563eb', introduced: '#3b82f6', extinct: '#60a5fa' },
  { native: '#7c3aed', introduced: '#8b5cf6', extinct: '#a78bfa' },
  { native: '#16a34a', introduced: '#22c55e', extinct: '#4ade80' },
  { native: '#dc2626', introduced: '#ef4444', extinct: '#f87171' },
  { native: '#ea580c', introduced: '#f97316', extinct: '#fb923c' }
];

// Types
interface SpeciesData {
  speciesId: string | number;
  speciesName: string;
  scientificName: string;
  avatarUrl: string;
  countryGeojson: FeatureCollection<Geometry> | null;
  stateGeojson: FeatureCollection<Geometry> | null;
  bbox?: [number, number, number, number];
}

interface LayerState {
  native: boolean;
  introduced: boolean;
  extinct: boolean;
}

interface HoveredFeature {
  properties: {
    region_name: string;
    presence_status: 'Native' | 'Introduced' | 'Extinct';
    species_name: string;
    region_type: 'country' | 'state';
  };
  lngLat: { lng: number; lat: number };
}

interface TurtleDistributionMapProps {
  selectedSpeciesIds?: (string | number)[];
}

// Utility functions
const calculateBoundsFromFeatures = (geojson: FeatureCollection<Geometry>): [number, number, number, number] | null => {
  if (!geojson.features?.length) return null;

  let minLng = Infinity, minLat = Infinity;
  let maxLng = -Infinity, maxLat = -Infinity;

  const extractCoordinates = (coords: any): void => {
    if (Array.isArray(coords)) {
      if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        const [lng, lat] = coords;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      } else {
        coords.forEach(extractCoordinates);
      }
    }
  };

  geojson.features.forEach(feature => {
    if (feature.geometry && 'coordinates' in feature.geometry) {
      extractCoordinates(feature.geometry.coordinates);
    }
  });

  if (!isFinite(minLng) || !isFinite(minLat) || !isFinite(maxLng) || !isFinite(maxLat)) {
    return null;
  }

  return [minLng, minLat, maxLng, maxLat];
};

const cleanCoordinates = (geojson: FeatureCollection<any>): FeatureCollection<any> => {
  const cleanCoord = (coord: number[]): number[] => [
    Math.round(coord[0] * 1000000) / 1000000,
    Math.round(coord[1] * 1000000) / 1000000
  ];

  const cleanCoordinatesRecursive = (coords: any): any => {
    if (!Array.isArray(coords)) return coords;
    
    if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return cleanCoord(coords);
    }
    
    return coords.map(cleanCoordinatesRecursive);
  };

  return {
    ...geojson,
    features: geojson.features
      .map(feature => {
        if (!feature?.geometry?.coordinates) return null;
        
        try {
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: cleanCoordinatesRecursive(feature.geometry.coordinates)
            }
          };
        } catch (error) {
          return null;
        }
      })
      .filter((feature): feature is Feature<any> => feature !== null)
  };
};

// Custom hooks
const useSpeciesData = (selectedSpeciesIds: (string | number)[]) => {
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistributions = async () => {
      if (selectedSpeciesIds.length === 0) {
        setSpeciesData([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const promises = selectedSpeciesIds.map(async (speciesId) => {
          // Fetch species info
          const { data: speciesInfo, error: speciesError } = await supabase
            .from('turtle_species')
            .select('id, species_common_name, species_scientific_name, avatar_image_circle_url')
            .eq('id', speciesId)
            .single();
            
          if (speciesError) throw new Error(`Failed to fetch species info for ID ${speciesId}`);

          // Fetch GeoJSON data
          const { data: geojsonData, error: geojsonError } = await supabase
            .rpc('get_species_geojson', { p_species_id: speciesId });
            
          if (geojsonError) throw new Error(`Failed to fetch GeoJSON for species ${speciesId}`);

          // Validate and process GeoJSON
          if (!geojsonData || geojsonData.type !== 'FeatureCollection' || !Array.isArray(geojsonData.features)) {
            return {
              speciesId: speciesInfo.id,
              speciesName: speciesInfo.species_common_name,
              scientificName: speciesInfo.species_scientific_name,
              avatarUrl: speciesInfo.avatar_image_circle_url,
              countryGeojson: null,
              stateGeojson: null
            };
          }

          // Separate country and state features
          const countryFeatures: Feature<Geometry>[] = [];
          const stateFeatures: Feature<Geometry>[] = [];

          geojsonData.features.forEach((feature: Feature<Geometry>) => {
            if (!feature?.geometry) return;

            const regionLevel = feature.properties?.region_level || 'country';
            const processedFeature = {
              ...feature,
              properties: {
                ...feature.properties,
                species_name: speciesInfo.species_common_name
              }
            };

            if (regionLevel === 'state') {
              stateFeatures.push(processedFeature);
            } else {
              countryFeatures.push(processedFeature);
            }
          });

          // Handle bounding box
          let bbox: [number, number, number, number] | undefined;
          
          if (geojsonData.bbox && Array.isArray(geojsonData.bbox) && geojsonData.bbox.length === 4) {
            const [minLng, minLat, maxLng, maxLat] = geojsonData.bbox;
            if (typeof minLng === 'number' && typeof minLat === 'number' && 
                typeof maxLng === 'number' && typeof maxLat === 'number' &&
                !isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
              bbox = [minLng, minLat, maxLng, maxLat];
            }
          }
          
          if (!bbox) {
            bbox = calculateBoundsFromFeatures(geojsonData) || undefined;
          }

          return {
            speciesId: speciesInfo.id,
            speciesName: speciesInfo.species_common_name,
            scientificName: speciesInfo.species_scientific_name,
            avatarUrl: speciesInfo.avatar_image_circle_url,
            countryGeojson: countryFeatures.length > 0 ? { type: 'FeatureCollection' as const, features: countryFeatures } : null,
            stateGeojson: stateFeatures.length > 0 ? { type: 'FeatureCollection' as const, features: stateFeatures } : null,
            bbox
          };
        });
        
        const results = await Promise.all(promises);
        const filteredResults = results.filter(item => item !== null);
        setSpeciesData(filteredResults);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch distribution data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistributions();
  }, [selectedSpeciesIds]);

  return { speciesData, loading, error };
};

const useMapFitBounds = (
  mapRef: React.RefObject<MapRef>, 
  selectedSpeciesIds: (string | number)[], 
  speciesData: SpeciesData[], 
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>
) => {
  // Track the previous selection to detect what was actually added
  const prevSelectedIdsRef = useRef<(string | number)[]>([]);
  // Track if we've done the initial zoom
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    if (selectedSpeciesIds.length === 0) {
      return;
    }
    
    // Check if we have species data for all selected species
    const missingSpeciesData = selectedSpeciesIds.filter(id => 
      !speciesData.some(data => data.speciesId === id)
    );
    
    if (missingSpeciesData.length > 0) {
      return;
    }
    
    const prevIds = prevSelectedIdsRef.current;
    const currentIds = selectedSpeciesIds;
    
    // Determine which species to zoom to
    let speciesIdToZoom: string | number | null = null;
    
    if (!hasInitializedRef.current) {
      // Initial load - zoom to the first species
      speciesIdToZoom = currentIds[0];
      hasInitializedRef.current = true;
    } else {
      // Find newly added species (in current but not in previous)
      const newlyAdded = currentIds.filter(id => !prevIds.includes(id));
      
      if (newlyAdded.length > 0) {
        // Zoom to the most recently added species
        speciesIdToZoom = newlyAdded[newlyAdded.length - 1];
      }
    }
    
    // Update the previous IDs for next comparison
    prevSelectedIdsRef.current = [...currentIds];
    
    // If no species to zoom to, exit early
    if (!speciesIdToZoom) {
      return;
    }
    
    // Find the species data for the one we want to zoom to
    const speciesForZoom = speciesData.find(s => s.speciesId === speciesIdToZoom);
    if (!speciesForZoom) {
      return;
    }
    
    // Function to perform the zoom with retries for map availability
    const performZoomWithRetries = () => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const attemptZoom = () => {
        attempts++;
        
        if (!mapRef.current) {
          if (attempts < maxAttempts) {
            setTimeout(attemptZoom, 100);
          }
          return;
        }
        
        // Map is available, proceed with zoom
        const map = mapRef.current.getMap();
        if (!map) {
          if (attempts < maxAttempts) {
            setTimeout(attemptZoom, 100);
          }
          return;
        }

        const bounds = new mapboxgl.LngLatBounds();
        let hasValidBounds = false;

        // Add bounds for the species we're zooming to
        if (speciesForZoom.bbox) {
          const [minLng, minLat, maxLng, maxLat] = speciesForZoom.bbox;
          bounds.extend([minLng, minLat]);
          bounds.extend([maxLng, maxLat]);
          hasValidBounds = true;
        } else if (speciesForZoom.countryGeojson) {
          const speciesBounds = calculateBoundsFromFeatures(speciesForZoom.countryGeojson);
          if (speciesBounds) {
            const [minLng, minLat, maxLng, maxLat] = speciesBounds;
            bounds.extend([minLng, minLat]);
            bounds.extend([maxLng, maxLat]);
            hasValidBounds = true;
          }
        }

        if (!hasValidBounds || bounds.isEmpty()) {
          return;
        }

        const fitToBounds = () => {
          try {
            // Calculate the offset to account for the Species Selector
            // Species Selector width: 320px (w-80) + 24px left padding + 24px right padding = 368px
            const speciesSelectorWidth = 368;
            const mapWidth = map.getContainer().offsetWidth;
            const offsetRatio = speciesSelectorWidth / mapWidth;
            
            // Adjust padding to shift the center rightward
            const adjustedPadding = {
              top: 50,
              bottom: 50,
              left: 50 + (speciesSelectorWidth / 2), // Add half the selector width to left padding
              right: 50
            };
            
            map.fitBounds(bounds, { 
              padding: adjustedPadding, 
              duration: 1000,
              maxZoom: 10
            });
            
            // Update view state after fitting
            setTimeout(() => {
              const center = map.getCenter();
              const zoom = map.getZoom();
              setViewState((prevState: ViewState) => ({
                ...prevState,
                longitude: center.lng,
                latitude: center.lat,
                zoom: zoom,
              }));
            }, 1100);
          } catch (error) {
            console.error('Error fitting bounds:', error);
          }
        };

        if (map.isStyleLoaded()) {
          fitToBounds();
        } else {
          map.once('load', fitToBounds);
        }
      };
      
      // Start the first attempt
      attemptZoom();
    };
    
    // Start zoom attempts
    performZoomWithRetries();
  }, [selectedSpeciesIds, speciesData, setViewState]);
  
  // Reset when all species are removed
  useEffect(() => {
    if (selectedSpeciesIds.length === 0) {
      prevSelectedIdsRef.current = [];
      hasInitializedRef.current = false;
    }
  }, [selectedSpeciesIds.length]);
};

// Components
const LoadingState = () => (
  <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600 mx-auto mb-2" />
      <p className="text-gray-600">Loading distribution data...</p>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden bg-red-50 flex items-center justify-center">
    <div className="text-center p-4">
      <p className="text-red-600 font-semibold">Error loading map data</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
    </div>
  </div>
);

const SpeciesLegend = ({ speciesData }: { speciesData: SpeciesData[] }) => (
  <div className="absolute top-4 right-16 bg-white p-3 rounded-lg shadow-lg max-w-xs">
    <h4 className="font-semibold text-sm mb-2">Species</h4>
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {speciesData.map((species, index) => (
        <div key={species.speciesId} className="flex items-center text-xs">
          <div 
            className="w-3 h-3 rounded mr-2 flex-shrink-0"
            style={{ backgroundColor: COLOR_SCALES[index % COLOR_SCALES.length].native }}
          />
          <span className="truncate">{species.speciesName}</span>
        </div>
      ))}
    </div>
  </div>
);

const LayerControls = ({ activeLayers, onChange }: { activeLayers: LayerState; onChange: (layers: LayerState) => void }) => (
  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
    <h4 className="font-semibold text-sm mb-2">Show Ranges</h4>
    <div className="space-y-2">
      {Object.entries(activeLayers).map(([key, value]) => (
        <label key={key} className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange({ ...activeLayers, [key]: e.target.checked })}
            className="mr-2"
          />
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
      ))}
    </div>
  </div>
);

// Main component
const TurtleDistributionMap: React.FC<TurtleDistributionMapProps> = ({ selectedSpeciesIds = [] }) => {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeature | null>(null);
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    native: true,
    introduced: true,
    extinct: true
  });
  
  const mapRef = useRef<MapRef>(null);
  const { speciesData, loading, error } = useSpeciesData(selectedSpeciesIds);
  
  useMapFitBounds(mapRef, selectedSpeciesIds, speciesData, setViewState);
  
  const currentDetailLevel = useMemo(() => {
    return viewState.zoom >= ZOOM_THRESHOLDS.COUNTRY_TO_STATE ? 'state' : 'country';
  }, [viewState.zoom]);
  
  const getGeojsonForDetailLevel = useCallback((species: SpeciesData, detailLevel: 'country' | 'state') => {
    if (detailLevel === 'state') {
      return species.stateGeojson || species.countryGeojson;
    }
    return species.countryGeojson;
  }, []);
  
  const filterFeaturesByStatus = useCallback((
    geojson: FeatureCollection<Geometry>, 
    status: 'Native' | 'Introduced' | 'Extinct'
  ): FeatureCollection<Geometry> => {
    return {
      ...geojson,
      features: geojson.features.filter(feature => 
        feature.properties?.presence_status === status
      )
    };
  }, []);
  
  const interactiveLayerIds = useMemo(() => {
    return speciesData.flatMap((species) => 
      (Object.keys(activeLayers) as Array<keyof LayerState>)
        .filter(type => activeLayers[type])
        .map(type => `species-${species.speciesId}-${currentDetailLevel}-${type}-layer`)
    );
  }, [speciesData, activeLayers, currentDetailLevel]);

  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      if (feature.properties?.region_name && feature.properties?.presence_status && feature.properties?.species_name) {
        setHoveredFeature({
          properties: {
            region_name: feature.properties.region_name as string,
            presence_status: feature.properties.presence_status as 'Native' | 'Introduced' | 'Extinct',
            species_name: feature.properties.species_name as string,
            region_type: currentDetailLevel
          },
          lngLat: {
            lng: e.lngLat.lng,
            lat: e.lngLat.lat
          }
        });
      }
    }
  }, [currentDetailLevel]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

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
        interactiveLayerIds={interactiveLayerIds}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredFeature(null)}
      >
        <NavigationControl position="top-right" />
        
        {/* Render species distributions */}
        {speciesData.map((species, index) => {
          const colorScale = COLOR_SCALES[index % COLOR_SCALES.length];
          const currentGeojson = getGeojsonForDetailLevel(species, currentDetailLevel);
          
          if (!currentGeojson?.features?.length) return null;
          
          const presenceTypes: Array<keyof LayerState> = ['native', 'introduced', 'extinct'];
          
          return presenceTypes.map(presenceType => {
            if (!activeLayers[presenceType]) return null;
            
            const features = filterFeaturesByStatus(currentGeojson, presenceType.charAt(0).toUpperCase() + presenceType.slice(1) as any);
            if (!features.features.length) return null;
            
            const sourceId = `species-${species.speciesId}-${currentDetailLevel}-${presenceType}-source`;
            const layerId = `species-${species.speciesId}-${currentDetailLevel}-${presenceType}-layer`;
            const outlineId = `species-${species.speciesId}-${currentDetailLevel}-${presenceType}-outline`;
            
            return (
              <Source 
                key={sourceId}
                id={sourceId}
                type="geojson" 
                data={cleanCoordinates(features)}
              >
                <Layer
                  id={layerId}
                  type="fill"
                  paint={{
                    'fill-color': colorScale[presenceType],
                    'fill-opacity': 0.6 - (presenceTypes.indexOf(presenceType) * 0.1)
                  }}
                />
                <Layer
                  id={outlineId}
                  type="line"
                  paint={{
                    'line-color': colorScale[presenceType],
                    'line-width': currentDetailLevel === 'state' ? 0.5 : 1,
                    'line-opacity': 0.8,
                    ...(presenceType === 'extinct' ? { 'line-dasharray': [2, 2] } : {})
                  }}
                />
              </Source>
            );
          });
        })}
        
        {/* Hover Popup */}
        {hoveredFeature && (
          <Popup
            longitude={hoveredFeature.lngLat.lng}
            latitude={hoveredFeature.lngLat.lat}
            anchor="bottom"
            onClose={() => setHoveredFeature(null)}
            closeButton={false}
            closeOnClick={false}
            className="mapbox-popup"
          >
            <div className="p-2 text-black">
              <h3 className="font-bold text-sm leading-tight">{hoveredFeature.properties.region_name}</h3>
              <p className="text-xs text-gray-500 capitalize leading-tight">
                {hoveredFeature.properties.region_type} Level
              </p>
              <p className="text-xs leading-tight">
                {hoveredFeature.properties.presence_status} Range
              </p>
              <p className="text-xs italic leading-tight">{hoveredFeature.properties.species_name}</p>
            </div>
          </Popup>
        )}
      </Map>
      
      {speciesData.length > 0 && <SpeciesLegend speciesData={speciesData} />}
      <LayerControls activeLayers={activeLayers} onChange={setActiveLayers} />
    </div>
  );
};

export default TurtleDistributionMap;