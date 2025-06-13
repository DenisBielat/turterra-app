import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup, MapMouseEvent, ViewState, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/lib/db/supabaseClient';
import type { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Zoom thresholds for layer switching
const ZOOM_THRESHOLDS = {
  COUNTRY_TO_STATE: 4, // Switch from country to state at zoom level 4
};

// Define types for our component
interface SpeciesData {
  speciesId: string | number;
  speciesName: string;
  scientificName: string;
  avatarUrl: string;
  countryGeojson: FeatureCollection<Geometry> | null;
  stateGeojson: FeatureCollection<Geometry> | null;
  bbox?: [number, number, number, number]; // minLng, minLat, maxLng, maxLat
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
    region_type: 'country' | 'state';
  };
  lngLat: {
    lng: number;
    lat: number;
  };
}

const TurtleDistributionMap: React.FC<TurtleDistributionMapProps> = ({ selectedSpeciesIds = [] }) => {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeature | null>(null);
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    native: true,
    introduced: true,
    extinct: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<MapRef>(null);
  
  // Determine which detail level to show based on zoom
  const currentDetailLevel = useMemo(() => {
    return viewState.zoom >= ZOOM_THRESHOLDS.COUNTRY_TO_STATE ? 'state' : 'country';
  }, [viewState.zoom]);
  
  // Calculate bounds from GeoJSON features (fallback method)
  const calculateBoundsFromFeatures = useCallback((geojson: FeatureCollection<Geometry>): [number, number, number, number] | null => {
    if (!geojson.features || geojson.features.length === 0) {
      return null;
    }

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    const extractCoordinates = (coords: any): void => {
      if (Array.isArray(coords)) {
        if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          // This is a coordinate pair [lng, lat]
          const [lng, lat] = coords;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        } else {
          // This is a nested array, recurse
          coords.forEach(extractCoordinates);
        }
      }
    };

    geojson.features.forEach(feature => {
      if (feature.geometry && 'coordinates' in feature.geometry) {
        extractCoordinates(feature.geometry.coordinates);
      }
    });

    if (minLng === Infinity || minLat === Infinity || maxLng === -Infinity || maxLat === -Infinity) {
      return null;
    }

    return [minLng, minLat, maxLng, maxLat];
  }, []);
  
  // Fetch distribution GeoJSON for selected species
  useEffect(() => {
    const fetchDistributions = async () => {
      if (selectedSpeciesIds.length === 0) {
        setSpeciesData([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      console.log('Fetching distributions for species IDs:', selectedSpeciesIds);
      
      try {
        const promises = selectedSpeciesIds.map(async (speciesId) => {
          // First, get species info
          const { data: speciesInfo, error: speciesError } = await supabase
            .from('turtle_species')
            .select('id, species_common_name, species_scientific_name, avatar_image_circle_url')
            .eq('id', speciesId)
            .single();
            
          if (speciesError) {
            console.error('Error fetching species info:', speciesError);
            throw new Error(`Failed to fetch species info for ID ${speciesId}`);
          }

          // Use the PostGIS function to get properly formatted GeoJSON
          const { data: geojsonData, error: geojsonError } = await supabase
            .rpc('get_species_geojson', { p_species_id: speciesId });
            
          if (geojsonError) {
            console.error('Error fetching species GeoJSON:', geojsonError);
            throw new Error(`Failed to fetch GeoJSON for species ${speciesId}`);
          }

          console.log('Raw GeoJSON data for species', speciesId, ':', geojsonData);

          // Let's also log the features to see what region_level values we're getting
          if (geojsonData && geojsonData.features) {
            console.log('Features breakdown for species', speciesId, ':');
            geojsonData.features.forEach((feature: Feature<Geometry>, index: number) => {
              console.log(`Feature ${index}:`, {
                region_name: feature.properties?.region_name,
                region_level: feature.properties?.region_level,
                presence_status: feature.properties?.presence_status,
                hasGeometry: !!feature.geometry
              });
            });            
          }

          // Validate the GeoJSON data structure
          if (!geojsonData || typeof geojsonData !== 'object') {
            console.warn(`No distribution data found for species ${speciesId}`);
            return {
              speciesId: speciesInfo.id,
              speciesName: speciesInfo.species_common_name,
              scientificName: speciesInfo.species_scientific_name,
              avatarUrl: speciesInfo.avatar_image_circle_url,
              countryGeojson: null,
              stateGeojson: null
            };
          }

          // Validate that it's a proper FeatureCollection
          if (geojsonData.type !== 'FeatureCollection' || !Array.isArray(geojsonData.features)) {
            console.warn(`Invalid FeatureCollection for species ${speciesId}:`, geojsonData);
            return {
              speciesId: speciesInfo.id,
              speciesName: speciesInfo.species_common_name,
              scientificName: speciesInfo.species_scientific_name,
              avatarUrl: speciesInfo.avatar_image_circle_url,
              countryGeojson: null,
              stateGeojson: null
            };
          }

          // Process and separate country/state level data from the FeatureCollection
          const processGeojsonData = (featureCollection: FeatureCollection<Geometry>): { country: FeatureCollection<Geometry>, state: FeatureCollection<Geometry> } => {
            const countryFeatures: Feature<Geometry>[] = [];
            const stateFeatures: Feature<Geometry>[] = [];

            featureCollection.features.forEach(feature => {
              if (!feature || !feature.geometry) {
                console.warn('Invalid feature in GeoJSON data:', feature);
                return;
              }

              // Get region level from feature properties
              const regionLevel = feature.properties?.region_level || 'country';

              // Create a proper Feature
              const processedFeature: Feature<Geometry> = {
                ...feature,
                properties: {
                  ...feature.properties,
                  species_name: speciesInfo.species_common_name
                }
              };

              // Separate by region level
              if (regionLevel === 'state') {
                stateFeatures.push(processedFeature);
              } else {
                countryFeatures.push(processedFeature);
              }
            });

            return {
              country: {
                type: 'FeatureCollection',
                features: countryFeatures
              },
              state: {
                type: 'FeatureCollection',
                features: stateFeatures
              }
            };
          };

          const processedData = processGeojsonData(geojsonData);
          
          console.log('Processed data for species', speciesId, ':', {
            countryFeatures: processedData.country.features.length,
            stateFeatures: processedData.state.features.length
          });

          // Handle bounding box - first try to use the one from SQL, then calculate our own
          let bbox: [number, number, number, number] | undefined;
          
          if (geojsonData.bbox && Array.isArray(geojsonData.bbox) && geojsonData.bbox.length === 4) {
            // Validate bbox values are numbers
            const [minLng, minLat, maxLng, maxLat] = geojsonData.bbox;
            if (typeof minLng === 'number' && typeof minLat === 'number' && 
                typeof maxLng === 'number' && typeof maxLat === 'number' &&
                !isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
              bbox = [minLng, minLat, maxLng, maxLat];
              console.log('Using SQL-provided bbox for species', speciesId, ':', bbox);
            }
          }
          
          // If no valid bbox from SQL, calculate from features
          if (!bbox) {
            console.log('No valid bbox from SQL, calculating from features for species', speciesId);
            bbox = calculateBoundsFromFeatures(geojsonData) || undefined;
            if (bbox) {
              console.log('Calculated bbox for species', speciesId, ':', bbox);
            }
          }

          return {
            speciesId: speciesInfo.id,
            speciesName: speciesInfo.species_common_name,
            scientificName: speciesInfo.species_scientific_name,
            avatarUrl: speciesInfo.avatar_image_circle_url,
            countryGeojson: processedData.country.features.length > 0 ? processedData.country : null,
            stateGeojson: processedData.state.features.length > 0 ? processedData.state : null,
            bbox
          };
        });
        
        const results = await Promise.all(promises);
        const validResults = results.filter((item): item is SpeciesData => {
          return item !== null && 
                 typeof item === 'object' && 
                 'speciesId' in item &&
                 'speciesName' in item;
        });
        
        console.log('Final processed species data:', validResults);
        setSpeciesData(validResults);
        
      } catch (err) {
        console.error('Error fetching distributions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch distribution data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistributions();
  }, [selectedSpeciesIds, calculateBoundsFromFeatures]);
  
  // Handle zoom-to-fit when species data changes (country-level only)
  useEffect(() => {
    console.log('Zoom-to-fit useEffect triggered. SpeciesData length:', speciesData.length);
    
    if (speciesData.length === 0) {
      console.log('No species data available');
      return;
    }

    // Function to perform the zoom-to-fit
    const performZoomToFit = () => {
      if (!mapRef.current) {
        console.log('Map ref still not available');
        return false;
      }
      
      const map = mapRef.current.getMap();
      if (!map) {
        console.log('Map not available from ref');
        return false;
      }

      console.log('Starting zoom-to-fit for species data...');

      // Use the SQL-provided bbox first, then fall back to calculating from features
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidBounds = false;

      speciesData.forEach(species => {
        console.log(`Processing bounds for species: ${species.speciesName}`);
        
        // First try to use the SQL-provided bbox
        if (species.bbox && Array.isArray(species.bbox) && species.bbox.length === 4) {
          const [minLng, minLat, maxLng, maxLat] = species.bbox;
          if (typeof minLng === 'number' && typeof minLat === 'number' && 
              typeof maxLng === 'number' && typeof maxLat === 'number' &&
              !isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
            console.log(`Using SQL bbox for ${species.speciesName}:`, species.bbox);
            bounds.extend([minLng, minLat]);
            bounds.extend([maxLng, maxLat]);
            hasValidBounds = true;
          } else {
            console.warn(`Invalid bbox values for ${species.speciesName}:`, species.bbox);
          }
        }
        // If no valid bbox, try calculating from country features
        else if (species.countryGeojson && species.countryGeojson.features.length > 0) {
          console.log(`No valid bbox, calculating from ${species.countryGeojson.features.length} country features for ${species.speciesName}`);
          
          const speciesBounds = calculateBoundsFromFeatures(species.countryGeojson);
          if (speciesBounds) {
            const [minLng, minLat, maxLng, maxLat] = speciesBounds;
            console.log(`Calculated bounds for ${species.speciesName}:`, speciesBounds);
            
            bounds.extend([minLng, minLat]);
            bounds.extend([maxLng, maxLat]);
            hasValidBounds = true;
          } else {
            console.warn(`Could not calculate bounds for ${species.speciesName}`);
          }
        } else {
          console.warn(`No bbox or country-level GeoJSON data for ${species.speciesName}`);
        }
      });

      console.log('Final combined bounds:', bounds);
      console.log('Has valid bounds:', hasValidBounds);

      if (!hasValidBounds || bounds.isEmpty()) {
        console.warn('No valid bounds found for any species data');
        return false;
      }

      const fitToBounds = () => {
        try {
          console.log('Fitting map to bounds...');
          map.fitBounds(bounds, { 
            padding: 50, 
            duration: 1000,
            maxZoom: 10 // Prevent zooming in too much, good for country-level view
          });
          
          // Update view state after fitting
          setTimeout(() => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            console.log('Map fitted to bounds. New center:', center, 'New zoom:', zoom);
            
            setViewState(prevState => ({
              ...prevState,
              longitude: center.lng,
              latitude: center.lat,
              zoom: zoom,
            }));
          }, 1100); // Wait for animation to complete
          
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      };

      // Ensure map is loaded before fitting bounds
      if (map.isStyleLoaded()) {
        fitToBounds();
      } else {
        console.log('Map style not loaded, waiting for load event...');
        map.once('load', fitToBounds);
      }

      return true;
    };

    // Try to perform zoom-to-fit immediately
    if (!performZoomToFit()) {
      console.log('Map not ready, will retry...');
      
      // If map isn't ready, keep trying every 100ms for up to 3 seconds
      let attempts = 0;
      const maxAttempts = 30;
      
      const retryInterval = setInterval(() => {
        attempts++;
        console.log(`Retry attempt ${attempts}/${maxAttempts} for zoom-to-fit`);
        
        if (performZoomToFit() || attempts >= maxAttempts) {
          clearInterval(retryInterval);
          if (attempts >= maxAttempts) {
            console.warn('Max attempts reached, could not perform zoom-to-fit');
          }
        }
      }, 100);

      // Cleanup function to clear interval if component unmounts
      return () => {
        clearInterval(retryInterval);
      };
    }

  }, [speciesData]);

  // Define color for each species
  const getColorScale = useCallback((index: number) => {
    const colorScales = [
      {
        native: { fillColor: '#2563eb', fillOpacity: 0.6 },
        introduced: { fillColor: '#3b82f6', fillOpacity: 0.5 }, 
        extinct: { fillColor: '#60a5fa', fillOpacity: 0.4 }
      },
      {
        native: { fillColor: '#7c3aed', fillOpacity: 0.6 },
        introduced: { fillColor: '#8b5cf6', fillOpacity: 0.5 },
        extinct: { fillColor: '#a78bfa', fillOpacity: 0.4 }
      },
      {
        native: { fillColor: '#16a34a', fillOpacity: 0.6 },
        introduced: { fillColor: '#22c55e', fillOpacity: 0.5 },
        extinct: { fillColor: '#4ade80', fillOpacity: 0.4 }
      },
      {
        native: { fillColor: '#dc2626', fillOpacity: 0.6 },
        introduced: { fillColor: '#ef4444', fillOpacity: 0.5 },
        extinct: { fillColor: '#f87171', fillOpacity: 0.4 }
      },
      {
        native: { fillColor: '#ea580c', fillOpacity: 0.6 },
        introduced: { fillColor: '#f97316', fillOpacity: 0.5 },
        extinct: { fillColor: '#fb923c', fillOpacity: 0.4 }
      }
    ];
    
    return colorScales[index % colorScales.length];
  }, []);
  
  // Filter features by presence status
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
  
  // Clean coordinate precision to avoid rendering issues
  const cleanCoordinates = useCallback((geojson: FeatureCollection<any>) => {
    return {
      ...geojson,
      features: geojson.features.map(feature => {
        if (!feature.geometry || !feature.geometry.coordinates) {
          console.warn('Feature missing geometry or coordinates:', feature);
          return null;
        }

        const cleanCoord = (coord: number[]): number[] => [
          Math.round(coord[0] * 1000000) / 1000000,
          Math.round(coord[1] * 1000000) / 1000000
        ];

        const cleanCoordinatesRecursive = (coords: any): any => {
          if (!Array.isArray(coords)) {
            return coords;
          }
          
          // Check if this is a coordinate pair [lng, lat]
          if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            return cleanCoord(coords);
          }
          
          // Otherwise, recursively clean nested arrays
          return coords.map(cleanCoordinatesRecursive);
        };

        try {
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: cleanCoordinatesRecursive(feature.geometry.coordinates)
            }
          };
        } catch (error) {
          console.error('Error cleaning coordinates for feature:', feature, error);
          return null;
        }
      }).filter(feature => feature !== null)
    };
  }, []);
  
  // Clean up removed species layers
  useEffect(() => {
    const currentSpeciesIds = new Set(speciesData.map(s => s.speciesId));
    const map = mapRef.current?.getMap();
    if (!map) return;

    const style = map.getStyle();
    if (!style?.sources) return;
    
    const existingSources = Object.keys(style.sources);
    
    existingSources.forEach(sourceId => {
      if (sourceId.startsWith('species-')) {
        const parts = sourceId.split('-');
        if (parts.length >= 3) {
          const speciesId = parts[1];
          if (!currentSpeciesIds.has(Number(speciesId))) {
            // Remove layers first
            const layerTypes = ['native', 'introduced', 'extinct'];
            const detailTypes = ['country', 'state'];
            
            detailTypes.forEach(detailType => {
              layerTypes.forEach(type => {
                const layerId = `${sourceId}-${detailType}-${type}`;
                const outlineId = `${sourceId}-${detailType}-${type}-outline`;
                
                if (map.getLayer(layerId)) {
                  map.removeLayer(layerId);
                }
                if (map.getLayer(outlineId)) {
                  map.removeLayer(outlineId);
                }
              });
            });
            
            // Remove source
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          }
        }
      }
    });
  }, [speciesData]);

  // Generate interactive layer IDs for hover/click events
  const interactiveLayerIds = useMemo(() => {
    return speciesData.flatMap((species) => 
      (Object.keys(activeLayers) as Array<keyof LayerState>)
        .filter(type => activeLayers[type])
        .map(type => `species-${species.speciesId}-${currentDetailLevel}-${type}-layer`)
    );
  }, [speciesData, activeLayers, currentDetailLevel]);

  // Get the appropriate geojson data based on current detail level
  const getGeojsonForDetailLevel = useCallback((species: SpeciesData, detailLevel: 'country' | 'state') => {
    console.log(`Getting ${detailLevel} data for ${species.speciesName}:`, {
      hasCountryData: !!(species.countryGeojson && species.countryGeojson.features.length > 0),
      hasStateData: !!(species.stateGeojson && species.stateGeojson.features.length > 0),
      countryFeatures: species.countryGeojson?.features.length || 0,
      stateFeatures: species.stateGeojson?.features.length || 0
    });

    if (detailLevel === 'state') {
      // For state level, prefer state data if available, otherwise fall back to country
      if (species.stateGeojson && species.stateGeojson.features.length > 0) {
        console.log(`Using state data for ${species.speciesName}`);
        return species.stateGeojson;
      } else {
        console.log(`No state data available for ${species.speciesName}, falling back to country data`);
        return species.countryGeojson;
      }
    } else {
      // For country level, use country data
      console.log(`Using country data for ${species.speciesName}`);
      return species.countryGeojson;
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full w-8 h-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading distribution data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden bg-red-50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold">Error loading map data</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

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
        interactiveLayerIds={interactiveLayerIds}
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
        }}
        onMouseLeave={() => setHoveredFeature(null)}
      >
        <NavigationControl position="top-right" />
        
        {/* Render each species distribution with zoom-aware detail level */}
        {speciesData.map((species, index) => {
          const colorScale = getColorScale(index);
          const currentGeojson = getGeojsonForDetailLevel(species, currentDetailLevel);
          
          if (!currentGeojson || !currentGeojson.features || currentGeojson.features.length === 0) {
            console.log(`No ${currentDetailLevel} GeoJSON data for species:`, species.speciesName);
            return null;
          }
          
          console.log(`Rendering ${currentDetailLevel} level data for ${species.speciesName}, features:`, currentGeojson.features.length);
          
          // Filter features for each presence status
          const nativeFeatures = filterFeaturesByStatus(currentGeojson, 'Native');
          const introducedFeatures = filterFeaturesByStatus(currentGeojson, 'Introduced');
          const extinctFeatures = filterFeaturesByStatus(currentGeojson, 'Extinct');
          
          return (
            <React.Fragment key={`species-${species.speciesId}-${currentDetailLevel}`}>
              {/* Native Range */}
              {activeLayers.native && nativeFeatures.features.length > 0 && (
                <Source 
                  id={`species-${species.speciesId}-${currentDetailLevel}-native-source`} 
                  type="geojson" 
                  data={cleanCoordinates(nativeFeatures)}
                >
                  <Layer
                    id={`species-${species.speciesId}-${currentDetailLevel}-native-layer`}
                    type="fill"
                    paint={{
                      'fill-color': colorScale.native.fillColor,
                      'fill-opacity': colorScale.native.fillOpacity
                    }}
                  />
                  <Layer
                    id={`species-${species.speciesId}-${currentDetailLevel}-native-outline`}
                    type="line"
                    paint={{
                      'line-color': colorScale.native.fillColor,
                      'line-width': currentDetailLevel === 'state' ? 0.5 : 1,
                      'line-opacity': 0.8
                    }}
                  />
                </Source>
              )}
              
              {/* Introduced Range */}
              {activeLayers.introduced && introducedFeatures.features.length > 0 && (
                <Source 
                  id={`species-${species.speciesId}-${currentDetailLevel}-introduced-source`} 
                  type="geojson" 
                  data={cleanCoordinates(introducedFeatures)}
                >
                  <Layer
                    id={`species-${species.speciesId}-${currentDetailLevel}-introduced-layer`}
                    type="fill"
                    paint={{
                      'fill-color': colorScale.introduced.fillColor,
                      'fill-opacity': colorScale.introduced.fillOpacity
                    }}
                  />
                  <Layer
                    id={`species-${species.speciesId}-${currentDetailLevel}-introduced-outline`}
                    type="line"
                    paint={{
                      'line-color': colorScale.introduced.fillColor,
                      'line-width': currentDetailLevel === 'state' ? 0.5 : 1,
                      'line-opacity': 0.8
                    }}
                  />
                </Source>
              )}
              
              {/* Extinct Range */}
              {activeLayers.extinct && extinctFeatures.features.length > 0 && (
                <Source 
                  id={`species-${species.speciesId}-${currentDetailLevel}-extinct-source`} 
                  type="geojson" 
                  data={cleanCoordinates(extinctFeatures)}
                >
                  <Layer
                    id={`species-${species.speciesId}-${currentDetailLevel}-extinct-layer`}
                    type="fill"
                    paint={{
                      'fill-color': colorScale.extinct.fillColor,
                      'fill-opacity': colorScale.extinct.fillOpacity
                    }}
                  />
                  <Layer
                    id={`species-${species.speciesId}-${currentDetailLevel}-extinct-outline`}
                    type="line"
                    paint={{
                      'line-color': colorScale.extinct.fillColor,
                      'line-width': currentDetailLevel === 'state' ? 0.5 : 1,
                      'line-opacity': 0.8,
                      'line-dasharray': [2, 2]
                    }}
                  />
                </Source>
              )}
            </React.Fragment>
          );
        })}
        
        {/* Hover Popup */}
        {hoveredFeature && hoveredFeature.properties && (
          <Popup
            longitude={hoveredFeature.lngLat.lng}
            latitude={hoveredFeature.lngLat.lat}
            anchor="bottom"
            onClose={() => setHoveredFeature(null)}
            closeButton={false}
            closeOnClick={false}
          >
            <div className="p-2">
              <h3 className="font-bold text-sm">{hoveredFeature.properties.region_name || 'Region'}</h3>
              <p className="text-xs text-gray-500 capitalize">
                {hoveredFeature.properties.region_type} Level
              </p>
              <p className="text-xs">
                {hoveredFeature.properties.presence_status} Range
              </p>
              <p className="text-xs italic">{hoveredFeature.properties.species_name}</p>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Layer Toggle Controls */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-semibold text-sm mb-2">Show Ranges</h4>
        <div className="space-y-2">
        <label className="flex items-center text-xs">
        <input
              type="checkbox"
              checked={activeLayers.native}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, native: e.target.checked }))}
              className="mr-2"
            />
            Native
          </label>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={activeLayers.introduced}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, introduced: e.target.checked }))}
              className="mr-2"
            />
            Introduced
          </label>
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={activeLayers.extinct}
              onChange={(e) => setActiveLayers(prev => ({ ...prev, extinct: e.target.checked }))}
              className="mr-2"
            />
            Extinct
          </label>
        </div>
      </div>
      
      {/* Species Legend */}
      {speciesData.length > 0 && (
        <div className="absolute top-4 right-16 bg-white p-3 rounded-lg shadow-lg max-w-xs">
          <h4 className="font-semibold text-sm mb-2">Species</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {speciesData.map((species, index) => {
              const colorScale = getColorScale(index);
              return (
                <div key={species.speciesId} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 rounded mr-2 flex-shrink-0"
                    style={{ backgroundColor: colorScale.native.fillColor }}
                  ></div>
                  <span className="truncate">{species.speciesName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg">
        <p className="text-xs text-gray-600">
          Detail Level: <span className="font-semibold capitalize">{currentDetailLevel}</span>
          {currentDetailLevel === 'state' && speciesData.some(s => !s.stateGeojson || s.stateGeojson.features.length === 0) && (
            <span className="text-orange-500 ml-1">(using country data)</span>
          )}
        </p>
        <p className="text-xs text-gray-500">
          Zoom: {viewState.zoom.toFixed(1)}
        </p>
        {speciesData.length > 0 && (
          <p className="text-xs text-gray-500">
            Species: {speciesData.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default TurtleDistributionMap;