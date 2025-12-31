// scripts/importRangeMaps.js
// Imports KML range maps from Supabase storage and converts them to GeoJSON
// Usage: node scripts/importRangeMaps.js [species-slug]
// If no species slug is provided, imports all available range maps

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const STORAGE_BUCKET = 'turtle_species_range_maps';

// Track import results
const results = {
  successful: [],
  failed: [],
  skipped: []
};

/**
 * Parse KML coordinates string into an array of [lng, lat] pairs
 * KML format: "lng,lat,alt lng,lat,alt ..." (altitude is optional and ignored)
 */
function parseKMLCoordinates(coordString) {
  if (!coordString || typeof coordString !== 'string') {
    return [];
  }

  return coordString
    .trim()
    .split(/\s+/)
    .filter(coord => coord.length > 0)
    .map(coord => {
      const parts = coord.split(',');
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      // Return [lng, lat] - GeoJSON format
      return [lng, lat];
    })
    .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));
}

/**
 * Extract text content between XML tags using regex
 * This is a simple parser that doesn't require external XML libraries
 */
function extractTagContent(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

/**
 * Parse a single KML Polygon element into a GeoJSON Polygon
 * Handles outer boundary and inner boundaries (holes)
 */
function parseKMLPolygon(polygonXml) {
  const coordinates = [];

  // Extract outer boundary
  const outerBoundaries = extractTagContent(polygonXml, 'outerBoundaryIs');
  if (outerBoundaries.length > 0) {
    const outerCoords = extractTagContent(outerBoundaries[0], 'coordinates');
    if (outerCoords.length > 0) {
      const ring = parseKMLCoordinates(outerCoords[0]);
      if (ring.length >= 4) {
        coordinates.push(ring);
      }
    }
  }

  // Extract inner boundaries (holes)
  const innerBoundaries = extractTagContent(polygonXml, 'innerBoundaryIs');
  for (const innerBoundary of innerBoundaries) {
    const innerCoords = extractTagContent(innerBoundary, 'coordinates');
    if (innerCoords.length > 0) {
      const ring = parseKMLCoordinates(innerCoords[0]);
      if (ring.length >= 4) {
        coordinates.push(ring);
      }
    }
  }

  if (coordinates.length === 0) {
    return null;
  }

  return {
    type: 'Polygon',
    coordinates: coordinates
  };
}

/**
 * Parse a KML LineString element into a GeoJSON LineString
 */
function parseKMLLineString(lineStringXml) {
  const coordsContent = extractTagContent(lineStringXml, 'coordinates');
  if (coordsContent.length === 0) {
    return null;
  }

  const coordinates = parseKMLCoordinates(coordsContent[0]);
  if (coordinates.length < 2) {
    return null;
  }

  return {
    type: 'LineString',
    coordinates: coordinates
  };
}

/**
 * Parse a KML Point element into a GeoJSON Point
 */
function parseKMLPoint(pointXml) {
  const coordsContent = extractTagContent(pointXml, 'coordinates');
  if (coordsContent.length === 0) {
    return null;
  }

  const coordinates = parseKMLCoordinates(coordsContent[0]);
  if (coordinates.length === 0) {
    return null;
  }

  return {
    type: 'Point',
    coordinates: coordinates[0]
  };
}

/**
 * Convert a KML string to GeoJSON FeatureCollection
 */
function kmlToGeoJSON(kmlString) {
  const features = [];

  // Extract all Placemarks
  const placemarks = extractTagContent(kmlString, 'Placemark');

  for (const placemark of placemarks) {
    // Extract name and description for properties
    const names = extractTagContent(placemark, 'name');
    const descriptions = extractTagContent(placemark, 'description');

    const properties = {
      name: names[0]?.trim() || null,
      description: descriptions[0]?.trim() || null,
      source: 'IUCN'
    };

    // Check for MultiGeometry first
    const multiGeometries = extractTagContent(placemark, 'MultiGeometry');

    if (multiGeometries.length > 0) {
      // Process MultiGeometry - combine all polygons into a MultiPolygon
      const polygons = [];
      const lineStrings = [];
      const points = [];

      for (const multiGeom of multiGeometries) {
        // Extract all Polygons
        const polygonXmls = extractTagContent(multiGeom, 'Polygon');
        for (const polygonXml of polygonXmls) {
          const polygon = parseKMLPolygon(polygonXml);
          if (polygon) {
            polygons.push(polygon.coordinates);
          }
        }

        // Extract all LineStrings
        const lineStringXmls = extractTagContent(multiGeom, 'LineString');
        for (const lineStringXml of lineStringXmls) {
          const lineString = parseKMLLineString(lineStringXml);
          if (lineString) {
            lineStrings.push(lineString.coordinates);
          }
        }

        // Extract all Points
        const pointXmls = extractTagContent(multiGeom, 'Point');
        for (const pointXml of pointXmls) {
          const point = parseKMLPoint(pointXml);
          if (point) {
            points.push(point.coordinates);
          }
        }
      }

      // Create features from collected geometries
      if (polygons.length > 0) {
        features.push({
          type: 'Feature',
          properties: { ...properties, geometryType: 'range' },
          geometry: {
            type: 'MultiPolygon',
            coordinates: polygons
          }
        });
      }

      if (lineStrings.length > 0) {
        features.push({
          type: 'Feature',
          properties: { ...properties, geometryType: 'line' },
          geometry: {
            type: 'MultiLineString',
            coordinates: lineStrings
          }
        });
      }

      if (points.length > 0) {
        features.push({
          type: 'Feature',
          properties: { ...properties, geometryType: 'point' },
          geometry: {
            type: 'MultiPoint',
            coordinates: points
          }
        });
      }
    } else {
      // Process individual geometries
      const polygonXmls = extractTagContent(placemark, 'Polygon');
      for (const polygonXml of polygonXmls) {
        const polygon = parseKMLPolygon(polygonXml);
        if (polygon) {
          // Convert single polygon to MultiPolygon for consistency
          features.push({
            type: 'Feature',
            properties: { ...properties, geometryType: 'range' },
            geometry: {
              type: 'MultiPolygon',
              coordinates: [polygon.coordinates]
            }
          });
        }
      }

      const lineStringXmls = extractTagContent(placemark, 'LineString');
      for (const lineStringXml of lineStringXmls) {
        const lineString = parseKMLLineString(lineStringXml);
        if (lineString) {
          features.push({
            type: 'Feature',
            properties: { ...properties, geometryType: 'line' },
            geometry: lineString
          });
        }
      }

      const pointXmls = extractTagContent(placemark, 'Point');
      for (const pointXml of pointXmls) {
        const point = parseKMLPoint(pointXml);
        if (point) {
          features.push({
            type: 'Feature',
            properties: { ...properties, geometryType: 'point' },
            geometry: point
          });
        }
      }
    }
  }

  // Calculate bounding box
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  for (const feature of features) {
    const coords = getAllCoordinates(feature.geometry);
    for (const [lng, lat] of coords) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }

  const bbox = minLng !== Infinity
    ? [minLng, minLat, maxLng, maxLat]
    : undefined;

  return {
    type: 'FeatureCollection',
    features,
    ...(bbox && { bbox })
  };
}

/**
 * Recursively extract all coordinates from a geometry
 */
function getAllCoordinates(geometry) {
  const coords = [];

  function extract(item) {
    if (Array.isArray(item)) {
      if (item.length === 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
        coords.push(item);
      } else {
        for (const subItem of item) {
          extract(subItem);
        }
      }
    }
  }

  if (geometry && geometry.coordinates) {
    extract(geometry.coordinates);
  }

  return coords;
}

/**
 * Find species by slug
 */
async function findSpeciesBySlug(slug) {
  const { data, error } = await supabase
    .from('turtle_species')
    .select('id, species_common_name, species_scientific_name, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`Error finding species with slug "${slug}":`, error);
    return null;
  }

  return data;
}

/**
 * List all folders in the storage bucket
 */
async function listStorageFolders() {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    console.error('Error listing storage folders:', error);
    return [];
  }

  // Filter to only include folders (items without file extensions that have no metadata.mimetype)
  // In Supabase storage, folders are represented differently
  return data.filter(item => !item.metadata?.mimetype).map(item => item.name);
}

/**
 * Find KML file in a species folder
 */
async function findKMLFile(speciesSlug) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(speciesSlug, {
      limit: 100
    });

  if (error) {
    console.error(`Error listing files for ${speciesSlug}:`, error);
    return null;
  }

  // Find .kml file
  const kmlFile = data.find(file =>
    file.name.toLowerCase().endsWith('.kml')
  );

  return kmlFile ? `${speciesSlug}/${kmlFile.name}` : null;
}

/**
 * Download and parse a KML file from storage
 */
async function downloadAndParseKML(filePath) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(filePath);

  if (error) {
    console.error(`Error downloading ${filePath}:`, error);
    return null;
  }

  const kmlContent = await data.text();
  return kmlToGeoJSON(kmlContent);
}

/**
 * Import range map for a single species
 */
async function importSpeciesRangeMap(speciesSlug) {
  console.log(`\nProcessing: ${speciesSlug}`);

  // Find species in database
  const species = await findSpeciesBySlug(speciesSlug);
  if (!species) {
    console.log(`  ⚠️ Species not found in database: ${speciesSlug}`);
    results.skipped.push({ slug: speciesSlug, reason: 'Species not found in database' });
    return false;
  }

  console.log(`  Found species: ${species.species_common_name} (ID: ${species.id})`);

  // Find KML file in storage
  const kmlPath = await findKMLFile(speciesSlug);
  if (!kmlPath) {
    console.log(`  ⚠️ No KML file found in storage for: ${speciesSlug}`);
    results.skipped.push({ slug: speciesSlug, reason: 'No KML file in storage' });
    return false;
  }

  console.log(`  Found KML file: ${kmlPath}`);

  // Download and parse KML
  const geojson = await downloadAndParseKML(kmlPath);
  if (!geojson || geojson.features.length === 0) {
    console.log(`  ⚠️ Failed to parse KML or no features found: ${kmlPath}`);
    results.failed.push({ slug: speciesSlug, reason: 'Failed to parse KML' });
    return false;
  }

  console.log(`  Parsed ${geojson.features.length} feature(s)`);

  // Check if range map already exists
  const { data: existing } = await supabase
    .from('turtle_species_range_maps')
    .select('id')
    .eq('species_id', species.id)
    .maybeSingle();

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from('turtle_species_range_maps')
      .update({
        geojson,
        source: 'IUCN',
        updated_at: new Date().toISOString()
      })
      .eq('species_id', species.id);
    console.log(`  ✅ Updated existing range map`);
  } else {
    // Insert new
    result = await supabase
      .from('turtle_species_range_maps')
      .insert({
        species_id: species.id,
        geojson,
        source: 'IUCN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    console.log(`  ✅ Created new range map`);
  }

  if (result.error) {
    console.error(`  ❌ Database error:`, result.error);
    results.failed.push({ slug: speciesSlug, reason: result.error.message });
    return false;
  }

  results.successful.push({
    slug: speciesSlug,
    speciesName: species.species_common_name,
    featuresCount: geojson.features.length,
    action: existing ? 'updated' : 'created'
  });

  return true;
}

/**
 * Import all range maps from storage
 */
async function importAllRangeMaps() {
  console.log('Listing all folders in storage bucket...');
  const folders = await listStorageFolders();

  if (folders.length === 0) {
    console.log('No folders found in storage bucket.');
    return;
  }

  console.log(`Found ${folders.length} folder(s) in storage.`);

  for (const folder of folders) {
    await importSpeciesRangeMap(folder);
  }
}

/**
 * Print summary of import results
 */
function printSummary() {
  console.log('\n========== IMPORT SUMMARY ==========');

  if (results.successful.length > 0) {
    console.log(`\n✅ Successfully imported: ${results.successful.length}`);
    for (const item of results.successful) {
      console.log(`   - ${item.slug}: ${item.speciesName} (${item.featuresCount} features, ${item.action})`);
    }
  }

  if (results.skipped.length > 0) {
    console.log(`\n⚠️ Skipped: ${results.skipped.length}`);
    for (const item of results.skipped) {
      console.log(`   - ${item.slug}: ${item.reason}`);
    }
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    for (const item of results.failed) {
      console.log(`   - ${item.slug}: ${item.reason}`);
    }
  }

  console.log('\n=====================================');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  console.log('=== Turtle Species Range Map Importer ===');
  console.log(`Storage bucket: ${STORAGE_BUCKET}`);

  if (args.length > 0) {
    // Import specific species
    const speciesSlug = args[0];
    console.log(`\nImporting range map for: ${speciesSlug}`);
    await importSpeciesRangeMap(speciesSlug);
  } else {
    // Import all
    console.log('\nImporting all range maps from storage...');
    await importAllRangeMaps();
  }

  printSummary();
}

main().catch(console.error);
