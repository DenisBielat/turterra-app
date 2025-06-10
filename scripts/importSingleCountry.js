// importSingleCountry.js
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing.');
  console.error('Make sure you have a .env file in your project root with this variable.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
  console.error('Make sure you have a .env file in your project root with this variable.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Configuration
const COUNTRIES_DIR = path.join(process.cwd(), 'data', 'countries');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to convert Polygon to MultiPolygon
function convertPolygonToMultiPolygon(geometry) {
  if (!geometry || geometry.type !== 'Polygon') {
    return geometry;
  }
  
  return {
    type: 'MultiPolygon',
    coordinates: [geometry.coordinates]
  };
}

// Helper function to ensure all geometries in a GeoJSON are MultiPolygon
function ensureMultiPolygonGeometries(geojson) {
  if (!geojson || !geojson.features || !Array.isArray(geojson.features)) {
    return geojson;
  }
  
  const updatedFeatures = geojson.features.map(feature => {
    if (feature.geometry && feature.geometry.type === 'Polygon') {
      return {
        ...feature,
        geometry: convertPolygonToMultiPolygon(feature.geometry)
      };
    }
    return feature;
  });
  
  return {
    ...geojson,
    features: updatedFeatures
  };
}

// Convert snake_case to Title Case
function toTitleCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Function to import a single country from a GeoJSON file
async function importCountryFromFile(filePath, displayName) {
  try {
    console.log(`Processing file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    // Read and parse the GeoJSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let geojson;
    
    try {
      geojson = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error parsing GeoJSON file: ${error.message}`);
      return false;
    }
    
    if (geojson.type !== 'FeatureCollection' || !geojson.features || geojson.features.length === 0) {
      console.error(`Invalid GeoJSON structure in file: ${filePath}`);
      return false;
    }
    
    // Convert Polygon geometries to MultiPolygon
    const updatedGeojson = ensureMultiPolygonGeometries(geojson);
    
    // Get the feature (usually just one for a country)
    const feature = updatedGeojson.features[0];
    const properties = feature.properties || {};
    
    // Extract country information
    let name = displayName;
    if (!name) {
      // If no display name provided, try to extract from properties or filename
      name = properties.NAME || properties.name;
      if (!name) {
        // Extract from filename
        name = path.basename(filePath, '.geojson');
        name = toTitleCase(name);
      }
    }
    
    // Extract ISO code if available
    const isoCode = properties.ISO_A2 || properties.ISO_A2_EH || properties.iso_a2 || null;
    
    // Check if country already exists
    console.log(`Checking if country "${name}" already exists...`);
    const { data: existingCountry, error: checkError } = await supabase
      .from('geographic_regions')
      .select('id, name, region_code')
      .eq('level', 'country')
      .ilike('name', name)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking if country exists: ${checkError.message}`);
      return false;
    }
    
    if (existingCountry) {
      console.log(`Country "${name}" already exists as "${existingCountry.name}".`);
      
      const updateAnswer = await new Promise(resolve => {
        rl.question(`Do you want to update the existing country? (y/n): `, resolve);
      });
      
      if (updateAnswer.toLowerCase() !== 'y') {
        console.log('Import canceled by user.');
        return false;
      }
      
      console.log(`Updating country: ${existingCountry.name}`);
      
      // Update the existing record
      const { error: updateError } = await supabase
        .from('geographic_regions')
        .update({
          level: 'country',
          parent_id: null,
          region_code: isoCode,
          geojson: updatedGeojson,
          geometry: null, // Will be set by trigger function
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCountry.id);
      
      if (updateError) {
        console.error(`Error updating country: ${updateError.message}`);
        return false;
      }
      
      console.log(`Country "${existingCountry.name}" updated successfully!`);
      return true;
    } else {
      console.log(`Importing new country: "${name}"`);
      
      // Insert new country
      const { data: newCountry, error: insertError } = await supabase
        .from('geographic_regions')
        .insert({
          name: name,
          level: 'country',
          parent_id: null,
          region_code: isoCode,
          geojson: updatedGeojson,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error inserting country: ${insertError.message}`);
        return false;
      }
      
      console.log(`Country "${name}" imported successfully with ID: ${newCountry.id}`);
      return true;
    }
  } catch (error) {
    console.error(`Error importing country: ${error.message}`);
    return false;
  }
}

// Main function to run the script
async function main() {
  console.log('=== Import Single Country ===');
  
  // Ask for the GeoJSON file path
  const fileName = await new Promise(resolve => {
    rl.question('Enter the filename (e.g., "caribbean_netherlands_bonaire.geojson"): ', resolve);
  });
  
  // Build the full path
  let filePath;
  if (fileName.includes('/') || fileName.includes('\\')) {
    // User provided a relative or absolute path
    filePath = path.resolve(fileName);
  } else {
    // User provided just a filename, assume it's in the countries directory
    filePath = path.join(COUNTRIES_DIR, fileName);
    
    // If the file doesn't exist in the countries directory, check if it's in the states directory
    if (!fs.existsSync(filePath)) {
      const statesPath = path.join(process.cwd(), 'data', 'states', fileName);
      if (fs.existsSync(statesPath)) {
        filePath = statesPath;
      }
    }
  }
  
  // If file doesn't have .geojson extension, add it
  if (!filePath.endsWith('.geojson')) {
    filePath += '.geojson';
  }
  
  // Ask for the display name
  const displayName = await new Promise(resolve => {
    rl.question('Enter the display name for the country (leave blank to use filename): ', resolve);
  });
  
  // Import the country
  const result = await importCountryFromFile(filePath, displayName.trim() || null);
  
  if (result) {
    console.log('\nImport completed successfully!');
  } else {
    console.log('\nImport failed. Please check the errors above.');
  }
  
  rl.close();
}

// Run the script
main();
