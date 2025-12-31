-- Migration: Create turtle_species_range_maps table
-- Run this in your Supabase SQL Editor

-- Create the table for storing species range map GeoJSON data
CREATE TABLE IF NOT EXISTS turtle_species_range_maps (
  id SERIAL PRIMARY KEY,
  species_id INTEGER NOT NULL REFERENCES turtle_species(id) ON DELETE CASCADE,
  geojson JSONB NOT NULL,
  source VARCHAR(255) DEFAULT 'IUCN',
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one range map per species (can be updated to allow multiple if needed)
  CONSTRAINT unique_species_range_map UNIQUE (species_id)
);

-- Create index for faster species lookups
CREATE INDEX IF NOT EXISTS idx_turtle_species_range_maps_species_id
  ON turtle_species_range_maps(species_id);

-- Add comment for documentation
COMMENT ON TABLE turtle_species_range_maps IS 'Stores GeoJSON range map data for turtle species, typically from IUCN';
COMMENT ON COLUMN turtle_species_range_maps.geojson IS 'GeoJSON FeatureCollection containing the species range polygons';
COMMENT ON COLUMN turtle_species_range_maps.source IS 'Data source (e.g., IUCN, iNaturalist)';

-- Create a function to get species range GeoJSON (similar to get_species_geojson)
CREATE OR REPLACE FUNCTION get_species_range_geojson(p_species_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT geojson INTO result
  FROM turtle_species_range_maps
  WHERE species_id = p_species_id;

  RETURN result;
END;
$$;

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT ON turtle_species_range_maps TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_species_range_geojson(INTEGER) TO anon, authenticated;
