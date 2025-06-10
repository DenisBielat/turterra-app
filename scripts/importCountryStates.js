// scripts/importCountryStates.js
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
const STATES_DIR = path.join(process.cwd(), 'data', 'states');
const BATCH_SIZE = 5; // Process in batches to avoid overwhelming the database

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Track import results
const successfulImports = [];
const failedImports = [];

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

// Function to normalize text by removing accents for comparison
function normalizeText(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Function to search for a country by name, handling accents
async function findCountryByName(countryName) {
  // First, try exact match
  const { data: exactMatch, error: exactError } = await supabase
    .from('geographic_regions')
    .select('id, name, region_code')
    .eq('level', 'country')
    .eq('name', countryName)
    .maybeSingle();
    
  if (exactMatch) return exactMatch;
  
  // If no exact match, try case-insensitive match
  const { data: caseInsensitiveMatch, error: caseError } = await supabase
    .from('geographic_regions')
    .select('id, name, region_code')
    .eq('level', 'country')
    .ilike('name', countryName)
    .maybeSingle();
    
  if (caseInsensitiveMatch) return caseInsensitiveMatch;
  
  // If still no match, get all countries and do a normalized comparison (removing accents)
  const { data: allCountries, error: allError } = await supabase
    .from('geographic_regions')
    .select('id, name, region_code')
    .eq('level', 'country');
    
  if (allError) {
    console.error('Error fetching countries:', allError);
    return null;
  }
  
  const normalizedSearchName = normalizeText(countryName);
  
  // Find a match by normalizing both strings (removing accents)
  const match = allCountries.find(country => 
    normalizeText(country.name) === normalizedSearchName
  );
  
  return match || null;
}

// Find state files for a specific country
function findStateFilesForCountry(countryName) {
  // Get all state files
  const allStateFiles = fs.readdirSync(STATES_DIR)
    .filter(file => file.endsWith('.geojson'));
  
  // Normalize the country name for comparison
  const normalizedCountryName = normalizeText(countryName);
  
  // Get variations of the country name for matching
  const countryVariations = [
    normalizedCountryName,
    normalizedCountryName.replace(/\s+/g, '_'), // Replace spaces with underscores
    normalizedCountryName.replace(/\s+/g, '') // Remove spaces entirely
  ];
  
  // Find files that start with any of the country name variations
  const matchingFiles = allStateFiles.filter(file => {
    const normalizedFilename = normalizeText(file);
    
    // Check if the filename starts with any country variation followed by underscore
    return countryVariations.some(variation => 
      normalizedFilename.startsWith(variation + '_')
    );
  });
  
  return matchingFiles;
}

// Process a state file
async function processStateFile(filePath, parentCountryId, countryName) {
  const filename = path.basename(filePath);
  
  try {
    // Read and parse the GeoJSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const geojson = JSON.parse(fileContent);
    
    if (geojson.type !== 'FeatureCollection' || !geojson.features || geojson.features.length === 0) {
      console.warn(`Skipping invalid GeoJSON file: ${filePath}`);
      failedImports.push({ file: filename, reason: 'Invalid GeoJSON structure' });
      return;
    }
    
    // Convert Polygon geometries to MultiPolygon
    const updatedGeojson = ensureMultiPolygonGeometries(geojson);
    
    // Extract state name from filename
    // Remove country prefix and .geojson extension
    const countryPrefix = normalizeText(countryName).replace(/\s+/g, '_');
    const stateNameFromFile = filename
      .replace(new RegExp(`^${countryPrefix}_`, 'i'), '')
      .replace(/\.geojson$/, '');
    
    // Format state name properly
    const formattedStateName = toTitleCase(stateNameFromFile);
    
    // Process each feature (might be multiple states in one file)
    for (const feature of updatedGeojson.features) {
      const properties = feature.properties || {};
      
      // Use property name if available, otherwise use name from filename
      const stateName = properties.NAME || properties.name || 
                        properties.NAME_1 || formattedStateName;
      
      // Format state name if it wasn't from properties
      const finalStateName = typeof stateName === 'string' && 
                            (stateName === formattedStateName) ? 
                            formattedStateName : stateName;
      
      const stateCode = properties.ISO_3166_2 || properties.code || properties.postal || null;
      
      // Create state-specific GeoJSON for this feature
      const stateGeoJSON = {
        type: 'FeatureCollection',
        features: [feature]
      };
      
      // Check if state already exists
      const { data: existingState, error: checkError } = await supabase
        .from('geographic_regions')
        .select('id, name')
        .eq('level', 'state')
        .eq('parent_id', parentCountryId)
        .ilike('name', finalStateName) // Case-insensitive matching
        .maybeSingle();
      
      if (checkError) {
        console.error(`Error checking if state ${finalStateName} exists:`, checkError);
        failedImports.push({ 
          file: filename, 
          reason: `State check error: ${finalStateName}` 
        });
        continue;
      }
      
      let stateId;
      
      if (existingState) {
        console.log(`State "${finalStateName}" already exists, updating...`);
        stateId = existingState.id;
        
        // Update the existing record
        const { error: updateError } = await supabase
          .from('geographic_regions')
          .update({
            name: finalStateName,
            level: 'state',
            parent_id: parentCountryId,
            region_code: stateCode,
            geojson: stateGeoJSON,
            geometry: null, // Will be set by trigger function
            updated_at: new Date().toISOString()
          })
          .eq('id', stateId);
        
        if (updateError) {
          console.error(`Error updating state ${finalStateName}:`, updateError);
          failedImports.push({ 
            file: filename, 
            reason: `State update error: ${finalStateName}` 
          });
          continue;
        }
        
        successfulImports.push({
          file: filename,
          state: finalStateName,
          action: 'updated'
        });
      } else {
        console.log(`Importing new state: "${finalStateName}" for ${countryName}`);
        
        // Insert new state
        const { data: newState, error: insertError } = await supabase
          .from('geographic_regions')
          .insert({
            name: finalStateName,
            level: 'state',
            parent_id: parentCountryId,
            region_code: stateCode,
            geojson: stateGeoJSON,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (insertError) {
          console.error(`Error inserting state ${finalStateName}:`, insertError);
          failedImports.push({ 
            file: filename, 
            reason: `State insert error: ${finalStateName}` 
          });
          continue;
        }
        
        stateId = newState.id;
        successfulImports.push({
          file: filename,
          state: finalStateName,
          action: 'created'
        });
      }
    }
    
    console.log(`Successfully processed state file: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error processing state file ${filePath}:`, error);
    failedImports.push({ 
      file: filename, 
      reason: `Processing error: ${error.message}` 
    });
    return false;
  }
}

// Print a summary of the import results
function printImportSummary() {
  console.log('\n==== IMPORT SUMMARY ====');
  
  if (successfulImports.length === 0 && failedImports.length === 0) {
    console.log('No files were processed.');
    return;
  }
  
  if (successfulImports.length > 0) {
    console.log(`\n✅ Successfully imported/updated ${successfulImports.length} states:`);
    successfulImports.forEach(item => {
      console.log(`- ${item.file}: ${item.state} (${item.action})`);
    });
  }
  
  if (failedImports.length > 0) {
    console.log(`\n⚠️ Failed to import ${failedImports.length} files:`);
    failedImports.forEach(item => {
      console.log(`- ${item.file}: ${item.reason}`);
    });
  }
  
  // Write results to a log file
  const logContent = JSON.stringify({
    successfulImports,
    failedImports
  }, null, 2);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(process.cwd(), `state-import-${timestamp}.json`);
  fs.writeFileSync(logPath, logContent);
  
  console.log(`\nDetailed import log written to: ${logPath}`);
}

// Main function to import states for a specific country
async function importStatesForCountry(countryName) {
  console.log(`Looking for country: "${countryName}"...`);
  
  // Find the country in the database
  const country = await findCountryByName(countryName);
  
  if (!country) {
    console.error(`Country "${countryName}" not found in the database.`);
    console.log('Available countries:');
    
    // Show some available countries to help the user
    const { data: sampleCountries } = await supabase
      .from('geographic_regions')
      .select('name')
      .eq('level', 'country')
      .order('name', { ascending: true })
      .limit(10);
    
    if (sampleCountries && sampleCountries.length > 0) {
      sampleCountries.forEach(c => console.log(`- ${c.name}`));
      console.log('... and more');
    }
    
    return;
  }
  
  console.log(`Found country: "${country.name}" (ID: ${country.id})`);
  
  // Find state files for this country
  const stateFiles = findStateFilesForCountry(country.name);
  
  if (stateFiles.length === 0) {
    console.log(`No state files found for ${country.name}.`);
    console.log('Make sure your files follow the naming convention: countryname_statename.geojson');
    return;
  }
  
  console.log(`Found ${stateFiles.length} state files for ${country.name}:`);
  stateFiles.forEach(file => console.log(`- ${file}`));
  
  // Confirm with the user
  const answer = await new Promise(resolve => {
    rl.question(`Proceed with importing ${stateFiles.length} states for ${country.name}? (y/n): `, resolve);
  });
  
  if (answer.toLowerCase() !== 'y') {
    console.log('Import canceled by user.');
    rl.close();
    return;
  }
  
  console.log(`\nImporting ${stateFiles.length} state files for ${country.name}...`);
  
  // Process in batches
  for (let i = 0; i < stateFiles.length; i += BATCH_SIZE) {
    const batch = stateFiles.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(stateFiles.length / BATCH_SIZE)}`);
    
    const promises = batch.map(async (filename) => {
      const filePath = path.join(STATES_DIR, filename);
      return processStateFile(filePath, country.id, country.name);
    });
    
    await Promise.all(promises);
  }
  
  console.log('\nImport completed!');
  printImportSummary();
  rl.close();
}

// Run the script with user input
console.log('=== Import States for a Specific Country ===');
rl.question('Enter the country name (e.g., "Åland" or "Aland"): ', async (countryName) => {
  await importStatesForCountry(countryName.trim());
});
