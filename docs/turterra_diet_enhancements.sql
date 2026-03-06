-- ============================================================================
-- TURTERRA - DIET SECTION ENHANCEMENTS
-- ============================================================================
-- Adds fields to support both the aquatic table-style feeding schedule
-- and the terrestrial card-style feeding schedule.
-- ============================================================================

SET search_path TO care_guides, public;

-- Add description field to feeding schedules for terrestrial card-style display
-- Aquatic guides can leave this null and use the structured columns instead.
ALTER TABLE care_guide_feeding_schedules
ADD COLUMN IF NOT EXISTS description text;

-- Add diet composition fields to care_guide_diet
-- Powers the "50% Animal Protein | 50% Plant Matter" bar and its note text.
-- For aquatic guides, this is already implicit in the feeding schedule rows
-- (where ratios change by age), so these fields are optional.
ALTER TABLE care_guide_diet
ADD COLUMN IF NOT EXISTS composition_protein_pct int,       -- e.g. 50
ADD COLUMN IF NOT EXISTS composition_plant_pct int,         -- e.g. 50
ADD COLUMN IF NOT EXISTS composition_note text;             -- e.g. "Offer both protein and plant matter at each feeding..."
