-- Add subspecies support columns to turtle_species table
-- is_subspecies: boolean flag to indicate if this record represents a subspecies
-- parent_species_id: self-referencing foreign key to the parent species
-- subspecies_name: the subspecies designation (e.g., "elegans" in Trachemys scripta elegans)

ALTER TABLE turtle_species
  ADD COLUMN is_subspecies BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN parent_species_id INTEGER REFERENCES turtle_species(id) ON DELETE SET NULL,
  ADD COLUMN subspecies_name TEXT;

-- Index for efficient lookups of subspecies by parent
CREATE INDEX idx_turtle_species_parent_species_id ON turtle_species(parent_species_id)
  WHERE parent_species_id IS NOT NULL;

-- Index for filtering subspecies vs regular species
CREATE INDEX idx_turtle_species_is_subspecies ON turtle_species(is_subspecies);
