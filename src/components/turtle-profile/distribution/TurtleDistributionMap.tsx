import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, ViewState, MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/db/supabaseClient';
import { Icon } from '@/components/Icon';
import { X } from 'lucide-react';
import type { FeatureCollection, MultiPolygon, Geometry } from 'geojson';
import type { LngLatBoundsLike } from 'mapbox-gl';

type DistributionProperties = {
  presence_status?: string;
  origin?: string;
  region_level?: string;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Define types for our component
interface SpeciesData {
  speciesId: string | number;
  speciesName: string;
  scientificName: string;
  avatarUrl: string;
  geojson: FeatureCollection<MultiPolygon>;
}

interface RangeMapData {
  speciesId: string | number;
  geojson: FeatureCollection<Geometry>;
}

interface INaturalistObservation {
  id: number;
  latitude: number;
  longitude: number;
}

interface LayerState {
  native: boolean;
  introduced: boolean;
  extinct: boolean;
  range: boolean;
  sightings: boolean;
}

interface TurtleDistributionMapProps {
  selectedSpeciesIds?: (string | number)[];
}


const TurtleDistributionMap: React.FC<TurtleDistributionMapProps> = ({ selectedSpeciesIds = [] }) => {
  const [isLegendOpen, setIsLegendOpen] = useState(false);
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
  const [rangeMapData, setRangeMapData] = useState<RangeMapData[]>([]);
  const [iNatObservations, setINatObservations] = useState<INaturalistObservation[]>([]);
  const lastHoverRef = useRef<{ source: string; id: string | number } | null>(null);
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    native: true,
    introduced: true,
    extinct: true,
    range: true,
    sightings: true
  });
  
  // Track zoom level for layer visibility
  const [currentZoom, setCurrentZoom] = useState(1.5);
  const ZOOM_BREAKPOINT = 2.5; // Show states when zoom >= 2.5, countries when zoom < 2.5

  // Track origin bounds for "Back to Origin" functionality
  const [originBounds, setOriginBounds] = useState<LngLatBoundsLike | null>(null);
  const [hasMovedFromOrigin, setHasMovedFromOrigin] = useState(false);
  const isInitialZoomRef = useRef(true);
  
  // Track if we're on mobile for button positioning
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch distribution GeoJSON for selected species
  useEffect(() => {
    const fetchDistributions = async () => {
      if (selectedSpeciesIds.length === 0) {
        setSpeciesData([]);
        return;
      }
      
      
      const promises = selectedSpeciesIds.map(async (speciesId) => {
        
        // Using the database function
        const { data: geojsonData, error: geojsonError } = await supabase
          .rpc('get_species_geojson', { p_species_id: speciesId });
          
          
        if (geojsonError) {
          console.error('Error fetching distribution', speciesId, geojsonError);
          return null;
        }
        
        if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
          return null;
        }
        
        // Also get species info
        const { data: speciesInfo, error: speciesError } = await supabase
          .from('turtle_species')
          .select('id, species_common_name, species_scientific_name, avatar_image_circle_url')
          .eq('id', speciesId)
          .single();
          
        if (speciesError) {
          console.error('Error fetching species info', speciesId, speciesError);
          return null;
        }
        
        const result = {
          speciesId: speciesInfo.id,
          speciesName: speciesInfo.species_common_name,
          scientificName: speciesInfo.species_scientific_name,
          avatarUrl: speciesInfo.avatar_image_circle_url,
          geojson: geojsonData
        };
        
        // processed
        
        return result;
      });
      
      const results = await Promise.all(promises);
      const validResults = results.filter((item): item is SpeciesData => item !== null);
      
      // set processed data
      
      setSpeciesData(validResults);
    };
    
    fetchDistributions();
  }, [selectedSpeciesIds]);

  // Fetch range map GeoJSON for selected species
  useEffect(() => {
    const fetchRangeMaps = async () => {
      if (selectedSpeciesIds.length === 0) {
        setRangeMapData([]);
        return;
      }

      const promises = selectedSpeciesIds.map(async (speciesId) => {
        // Fetch range map using the RPC function
        const { data: rangeGeojson, error: rangeError } = await supabase
          .rpc('get_species_range_geojson', { p_species_id: speciesId });

        if (rangeError) {
          // Range map might not exist for all species, this is not an error
          console.log('No range map found for species', speciesId);
          return null;
        }

        if (!rangeGeojson || !rangeGeojson.features || rangeGeojson.features.length === 0) {
          return null;
        }

        return {
          speciesId,
          geojson: rangeGeojson
        };
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((item): item is RangeMapData => item !== null);
      setRangeMapData(validResults);
    };

    fetchRangeMaps();
  }, [selectedSpeciesIds]);

  // Fetch iNaturalist observations for selected species
  useEffect(() => {
    const fetchINatObservations = async () => {
      if (speciesData.length === 0) {
        setINatObservations([]);
        return;
      }

      try {
        // Get scientific name from the first species
        const scientificName = speciesData[0]?.scientificName;
        if (!scientificName) {
          setINatObservations([]);
          return;
        }

        // Query iNaturalist API for research-grade observations with coordinates
        const response = await fetch(
          `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(scientificName)}&quality_grade=research&geo=true&per_page=200&order=desc&order_by=created_at`
        );

        if (!response.ok) {
          console.error('Failed to fetch iNaturalist observations');
          setINatObservations([]);
          return;
        }

        const data = await response.json();

        // Extract observations with valid coordinates
        const observations: INaturalistObservation[] = data.results
          ?.filter((obs: { location?: string }) => obs.location)
          .map((obs: { id: number; location: string }) => {
            const [lat, lng] = obs.location.split(',').map(Number);
            return {
              id: obs.id,
              latitude: lat,
              longitude: lng
            };
          })
          .filter((obs: INaturalistObservation) => !isNaN(obs.latitude) && !isNaN(obs.longitude)) || [];

        setINatObservations(observations);
      } catch (error) {
        console.error('Error fetching iNaturalist observations:', error);
        setINatObservations([]);
      }
    };

    fetchINatObservations();
  }, [speciesData]);

  // Helper function to darken a hex color
  const darkenColor = useCallback((hex: string, amount: number = 0.2) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }, []);

  // Define color scale using Tailwind theme equivalents regardless of species index
  const getColorScale = useCallback(() => {
    // Map origins to Tailwind-based hex colors from tailwind.config.ts
    // Native -> green, Introduced -> violet, Extinct -> orange
    const colorScales = [
      {
        native: { fillColor: '#33f590', lineColor: '#00c35e', hoverFillColor: '#09de6f' }, // green-400, green-600, green-500
        introduced: { fillColor: '#a173ff', lineColor: '#7d14ff', hoverFillColor: '#873bff' }, // violet-400, violet-600, violet-500
        extinct: { fillColor: '#eeb231', lineColor: '#cc6f13', hoverFillColor: '#ffa91e' }  // orange-400, orange-600, orange-500
      }
    ];
    
    return colorScales[0];
  }, []);
  
  // Toggle layer visibility
  const toggleLayer = (layerType: keyof LayerState) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerType]: !prev[layerType]
    }));
  };

  // Memoize filterFeaturesByType
  const filterFeaturesByType = useMemo(
    () => (features: Array<{ properties?: DistributionProperties }>, type: string) => {
    if (!features || !Array.isArray(features)) return [];
    
    return features.filter(f => {
      const status = f.properties?.presence_status;
      switch(type.toLowerCase()) {
        case 'native': return status === 'Native';
        case 'introduced': return status === 'Introduced';
        case 'extinct': return status === 'Extinct';
        default: return false;
      }
    });
  }, []);
  
  useEffect(() => {}, []);
  
  useEffect(() => {}, [speciesData, filterFeaturesByType]);
  
  // Add this effect to clean up removed species layers
  useEffect(() => {
    // Get all current species IDs
    const currentSpeciesIds = new Set(speciesData.map(s => s.speciesId));

    // Get all previously rendered species IDs by checking existing source IDs
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Wait for style to be loaded before accessing it
    if (!map.isStyleLoaded()) return;

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

  // Ensure proper layer ordering: Sightings (top) > Range Maps > Species Shapes (bottom)
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    const reorderLayers = () => {
      try {
        // Get all layers that exist
        const speciesLayerIds = speciesData
          .map(species => `species-${species.speciesId}-fill`)
          .filter(id => map.getLayer(id));

        const rangeLayerIds = rangeMapData.flatMap(rangeData => [
          `range-${rangeData.speciesId}-fill`,
          `range-${rangeData.speciesId}-line`,
          `range-${rangeData.speciesId}-linestring`
        ]).filter(id => map.getLayer(id));

        const hasSightings = map.getLayer('inat-sightings');

        // Step 1: Ensure species layers are at the bottom
        // Move them before any range layers or sightings
        const referenceLayer = rangeLayerIds[0] || (hasSightings ? 'inat-sightings' : null);
        if (referenceLayer) {
          speciesLayerIds.forEach((layerId) => {
            try {
              map.moveLayer(layerId, referenceLayer);
            } catch {}
          });
        }

        // Step 2: Move range layers above species, but below sightings
        if (hasSightings) {
          // Move range layers before sightings (so sightings stay on top)
          rangeLayerIds.reverse().forEach((layerId) => { // Reverse to maintain order
            try {
              map.moveLayer(layerId, 'inat-sightings');
            } catch {}
          });
        } else {
          // No sightings, so range layers go to top
          rangeLayerIds.forEach((layerId) => {
            try {
              map.moveLayer(layerId);
            } catch {}
          });
        }

        // Step 3: Move sightings to the very top (last operation)
        if (hasSightings) {
          try {
            map.moveLayer('inat-sightings');
          } catch {}
        }
      } catch (error) {
        // Layers might not all exist yet, will retry
      }
    };

    // Run immediately and with delays to catch all layer additions
    reorderLayers();
    const timeout1 = setTimeout(reorderLayers, 300);
    const timeout2 = setTimeout(reorderLayers, 700);
    const timeout3 = setTimeout(reorderLayers, 1200);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [rangeMapData, speciesData, iNatObservations, activeLayers]);

  // Add a map reference
  const mapRef = useRef<MapRef>(null);

  // Auto-zoom to species distribution or range map when data loads
  useEffect(() => {
    const hasDistributionData = speciesData.length > 0;
    const hasRangeData = rangeMapData.length > 0;

    if ((hasDistributionData || hasRangeData) && mapRef.current) {
      const map = mapRef.current.getMap();

      // Wait for map to be fully loaded
      const waitForMapLoad = () => {
        if (!map.isStyleLoaded()) {
          setTimeout(waitForMapLoad, 100);
          return;
        }

        // Use the bbox from distribution GeoJSON if available, otherwise try range map
        const distributionFeatures = speciesData.flatMap(species => species.geojson?.features || []);
        const rangeFeatures = rangeMapData.flatMap(range => range.geojson?.features || []);

        // Prefer distribution data bbox, fall back to range map bbox
        let bbox: number[] | undefined;

        if (distributionFeatures.length > 0 && speciesData[0]?.geojson?.bbox) {
          bbox = speciesData[0].geojson.bbox as number[];
        } else if (rangeFeatures.length > 0 && rangeMapData[0]?.geojson?.bbox) {
          bbox = rangeMapData[0].geojson.bbox as number[];
        }

        if (bbox && bbox.length >= 4) {
          const bounds: LngLatBoundsLike = [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]]
          ];
          // Store the origin bounds for "Back to Origin" functionality
          setOriginBounds(bounds);
          isInitialZoomRef.current = true;
          setHasMovedFromOrigin(false);

          // Use responsive padding: less on mobile, more on desktop
          const isMobile = window.innerWidth < 768;
          const padding = isMobile ? 20 : 50;

          map.fitBounds(bounds, {
            padding: padding,
            duration: 1500,
            easing: (t) => t * (2 - t)
          });

          // Mark initial zoom complete after animation with extra buffer to ensure all onMove events are ignored
          setTimeout(() => {
            isInitialZoomRef.current = false;
            // Ensure hasMovedFromOrigin is still false after initial zoom completes
            setHasMovedFromOrigin(false);
          }, 1700);
        } else if (distributionFeatures.length > 0 || rangeFeatures.length > 0) {
          // Just zoom to a reasonable level if no bbox
          isInitialZoomRef.current = true;
          setHasMovedFromOrigin(false);
          map.easeTo({
            zoom: 3,
            duration: 1500,
            easing: (t) => t * (2 - t)
          });

          // Mark initial zoom complete after animation with extra buffer
          setTimeout(() => {
            isInitialZoomRef.current = false;
            setHasMovedFromOrigin(false);
          }, 1700);
        }
      };

      waitForMapLoad();
    }
  }, [speciesData, rangeMapData]);

  // Handle returning to origin
  const handleBackToOrigin = useCallback(() => {
    if (originBounds && mapRef.current) {
      const map = mapRef.current.getMap();
      isInitialZoomRef.current = true;
      setHasMovedFromOrigin(false);
      // Use responsive padding: less on mobile, more on desktop
      const isMobile = window.innerWidth < 768;
      const padding = isMobile ? 20 : 50;
      map.fitBounds(originBounds, {
        padding: padding,
        duration: 1000,
        easing: (t) => t * (2 - t)
      });
      setTimeout(() => {
        isInitialZoomRef.current = false;
        setHasMovedFromOrigin(false);
      }, 1200);
    }
  }, [originBounds]);

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
      {/* Mobile Legend Toggle Button */}
      <button
        onClick={() => setIsLegendOpen(!isLegendOpen)}
        className="md:hidden absolute top-3 left-3 z-[5] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors flex items-center justify-center"
        aria-label="Toggle map legend"
      >
        <Icon name="filter-settings" style="line" size="sm" className="text-gray-700" />
      </button>

      {/* Layer Controls - Always visible on desktop, toggleable on mobile */}
      <div className={`absolute top-3 left-3 z-[5] bg-white rounded-lg shadow-lg p-3 min-w-[200px] md:min-w-0 transition-all duration-200 ${
        isLegendOpen ? 'block' : 'hidden'
      } md:block md:top-4 md:left-4`}>
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between md:mb-2">
          <h4 className="text-sm font-medium">Distribution Types</h4>
          <button
            onClick={() => setIsLegendOpen(false)}
            className="md:hidden rounded-sm opacity-70 hover:opacity-100 transition-opacity p-1 -mr-1"
            aria-label="Close legend"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-2 mt-3 md:mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeLayers.native}
              onChange={() => toggleLayer('native')}
              className="rounded"
            />
            <span className="text-sm">
              <span className="inline-block w-3 h-3 rounded mr-1 bg-green-500"></span>
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
              <span className="inline-block w-3 h-3 rounded mr-1 bg-violet-500"></span>
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
              <span className="inline-block w-3 h-3 rounded mr-1 bg-orange-500"></span>
              Extinct
            </span>
          </label>
          {rangeMapData.length > 0 && (
            <label className="flex items-center space-x-2 pt-2 border-t border-gray-200 mt-2">
              <input
                type="checkbox"
                checked={activeLayers.range}
                onChange={() => toggleLayer('range')}
                className="rounded"
              />
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded mr-1 bg-blue-500"></span>
                IUCN Range
              </span>
            </label>
          )}
          {iNatObservations.length > 0 && (
            <label className="flex items-center space-x-2 pt-2 border-t border-gray-200 mt-2">
              <input
                type="checkbox"
                checked={activeLayers.sightings}
                onChange={() => toggleLayer('sightings')}
                className="rounded"
              />
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded-full mr-1 bg-red-500"></span>
                Sightings ({iNatObservations.length})
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Back to Origin Button - positioned bottom-left on mobile, below layer controls on desktop */}
      {hasMovedFromOrigin && originBounds && (
        <button
          onClick={handleBackToOrigin}
          className="absolute left-3 md:left-4 z-[5] bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
          style={isMobile ? { bottom: '0.75rem', top: 'auto' } : { top: 'calc(1rem + 220px)', bottom: 'auto' }}
        >
          <Icon name="origin" style="line" size="sm" className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Back to Origin</span>
        </button>
      )}

      <Map
        ref={mapRef}
        {...viewState}
        projection="mercator"
        onMove={evt => {
          setViewState(evt.viewState);
          setCurrentZoom(evt.viewState.zoom);
          // Detect user movement after initial zoom
          if (!isInitialZoomRef.current && originBounds) {
            setHasMovedFromOrigin(true);
          }
        }}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/light-v11'}
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5
        }}
        interactiveLayerIds={[
          ...speciesData.map(species => `species-${species.speciesId}-fill`),
          ...rangeMapData.map(range => `range-${range.speciesId}-fill`)
        ]}
        onMouseMove={(e: MapMouseEvent) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const map = mapRef.current?.getMap();
            if (map && feature.id != null && typeof feature.source === 'string') {
              // Clear previous feature-state
              if (lastHoverRef.current) {
                try {
                  map.setFeatureState(
                    { source: lastHoverRef.current.source, id: lastHoverRef.current.id },
                    { hover: false }
                  );
                } catch {}
              }
              // Set current hover state
              try {
                map.setFeatureState(
                  { source: feature.source as string, id: feature.id as string | number },
                  { hover: true }
                );
                lastHoverRef.current = { source: feature.source as string, id: feature.id as string | number };
              } catch {}
            }
            // Change cursor to pointer
            if (e.target.getCanvas()) {
              e.target.getCanvas().style.cursor = 'pointer';
            }
          }
        }}
        onMouseLeave={() => {
          // Reset cursor
          if (mapRef.current) {
            const canvas = mapRef.current.getCanvas();
            if (canvas) {
              canvas.style.cursor = '';
            }
            const map = mapRef.current.getMap();
            if (lastHoverRef.current) {
              try {
                map.setFeatureState(
                  { source: lastHoverRef.current.source, id: lastHoverRef.current.id },
                  { hover: false }
                );
              } catch {}
              lastHoverRef.current = null;
            }
          }
        }}
      >
        <NavigationControl position="top-right" />
        
        {/* Render each species distribution */}
        {speciesData.map((species) => {
          const colorScale = getColorScale();
          
          // rendering layers
          
          if (!species.geojson || !species.geojson.features) {
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
              
              // feature filter
              
              if (!isActiveLayer) return false;
              
              // Add zoom-based filtering for country/state levels
              const shouldShowAtCurrentZoom = 
                (regionLevel === 'country' && currentZoom < ZOOM_BREAKPOINT) ||
                (regionLevel === 'state' && currentZoom >= ZOOM_BREAKPOINT) ||
                (regionLevel !== 'country' && regionLevel !== 'state'); // Show other levels always
              
              return shouldShowAtCurrentZoom;
            })
          };
          
          // filtered geojson
          
          // Only render if there are features to show
          if (filteredGeoJSON.features.length === 0) {
            return null;
          }
          
          // render source and layer
          
          return (
            <Source 
              key={`species-${species.speciesId}`}
              id={`species-${species.speciesId}`} 
              type="geojson" 
              generateId
              data={transformCoordinates(filteredGeoJSON)}
            >
              <Layer
                id={`species-${species.speciesId}-fill`}
                type="fill"
                paint={{
                  'fill-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    [
                      'case',
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Native']], darkenColor(colorScale.native.fillColor, 0.15),
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Introduced']], darkenColor(colorScale.introduced.fillColor, 0.15),
                      ['all', ['has', 'origin'], ['!=', ['get', 'origin'], null], ['==', ['get', 'origin'], 'Extinct']], darkenColor(colorScale.extinct.fillColor, 0.15),
                      darkenColor(colorScale.native.fillColor, 0.15) // fallback color
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

        {/* Render IUCN Range Maps - always render but control visibility via layout */}
        {rangeMapData.map((rangeData) => {
          if (!rangeData.geojson || !rangeData.geojson.features) {
            return null;
          }

          const visibility = activeLayers.range ? 'visible' : 'none';

          return (
            <Source
              key={`range-${rangeData.speciesId}`}
              id={`range-${rangeData.speciesId}`}
              type="geojson"
              generateId
              data={rangeData.geojson}
            >
              {/* Fill layer for range polygons */}
              <Layer
                id={`range-${rangeData.speciesId}-fill`}
                type="fill"
                layout={{ visibility }}
                paint={{
                  'fill-color': '#3b82f6', // blue-500
                  'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.4,
                    0.25
                  ]
                }}
                filter={['any',
                  ['==', ['geometry-type'], 'Polygon'],
                  ['==', ['geometry-type'], 'MultiPolygon']
                ]}
              />
              {/* Outline layer for range polygons */}
              <Layer
                id={`range-${rangeData.speciesId}-line`}
                type="line"
                layout={{ visibility }}
                paint={{
                  'line-color': '#1d4ed8', // blue-700
                  'line-width': 2,
                  'line-dasharray': [2, 2]
                }}
                filter={['any',
                  ['==', ['geometry-type'], 'Polygon'],
                  ['==', ['geometry-type'], 'MultiPolygon']
                ]}
              />
              {/* Line layer for any LineString geometries */}
              <Layer
                id={`range-${rangeData.speciesId}-linestring`}
                type="line"
                layout={{ visibility }}
                paint={{
                  'line-color': '#3b82f6', // blue-500
                  'line-width': 2
                }}
                filter={['any',
                  ['==', ['geometry-type'], 'LineString'],
                  ['==', ['geometry-type'], 'MultiLineString']
                ]}
              />
            </Source>
          );
        })}

        {/* Render iNaturalist Sightings as red dots */}
        {iNatObservations.length > 0 && (
          <Source
            id="inat-sightings"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: iNatObservations.map(obs => ({
                type: 'Feature' as const,
                properties: { id: obs.id },
                geometry: {
                  type: 'Point' as const,
                  coordinates: [obs.longitude, obs.latitude]
                }
              }))
            }}
          >
            <Layer
              id="inat-sightings"
              type="circle"
              layout={{ visibility: activeLayers.sightings ? 'visible' : 'none' }}
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1, 3,
                  5, 5,
                  10, 8
                ],
                'circle-color': '#ef4444', // red-500
                'circle-stroke-color': '#b91c1c', // red-700
                'circle-stroke-width': 1,
                'circle-opacity': 0.8
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default TurtleDistributionMap;