-- ============================================================================
-- TURTERRA CARE GUIDES - SUPABASE SCHEMA
-- ============================================================================
-- This schema supports species-specific care guides with sections for
-- housing, lighting, temperature, water quality, diet, handling, and health.
--
-- Design principles:
--   - Separate table per section for clean Supabase dashboard editing
--   - Shared reference tables for foods and health issues (reusable across guides)
--   - JSONB arrays for simple string lists (tips, do's/don'ts, etc.)
--   - Dedicated detail tables for multi-row structured data (temp zones, feeding schedules, etc.)
--   - Manual + auto-fallback approach for related guides
--
-- Assumes `turtle_species` table already exists with at minimum:
--   id (uuid), common_name, scientific_name, family, and category/group fields.
-- ============================================================================


-- ============================================================================
-- SCHEMA
-- ============================================================================
-- All objects will be created in the care_guides schema.
-- Public schema is included in the path so we can reference turtle_species.

SET search_path TO care_guides, public;


-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE care_guide_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE care_guide_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE health_issue_severity AS ENUM ('monitor', 'moderate', 'urgent');
CREATE TYPE food_category AS ENUM ('protein', 'vegetable', 'fruit', 'commercial', 'supplement');


-- ============================================================================
-- 1. CARE GUIDES (main entry point)
-- ============================================================================
-- One row per species care guide. Holds the "At a Glance" stats and metadata.
-- Links to turtle_species for taxonomy, images, and non-care info.

CREATE TABLE care_guides (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id      bigint NOT NULL REFERENCES public.turtle_species(id) ON DELETE CASCADE,
    slug            text NOT NULL UNIQUE,  -- URL-friendly identifier, e.g. "painted-turtle"
    status          care_guide_status NOT NULL DEFAULT 'draft',
    difficulty      care_guide_difficulty NOT NULL,

    -- At a Glance stats
    adult_size_min_inches   numeric(4,1),          -- e.g. 5.0
    adult_size_max_inches   numeric(4,1),          -- e.g. 10.0
    adult_size_notes        text,                   -- e.g. "Females larger than males"
    lifespan_min_years      int,                    -- e.g. 25
    lifespan_max_years      int,                    -- e.g. 40
    lifespan_notes          text,                   -- e.g. "With proper care"
    enclosure_min_gallons   int,                    -- e.g. 100
    enclosure_notes         text,                   -- e.g. "10 gal per inch of shell"
    basking_temp_min_f      int,                    -- e.g. 95
    basking_temp_max_f      int,                    -- e.g. 104
    water_temp_min_f        int,                    -- e.g. 70
    water_temp_max_f        int,                    -- e.g. 80
    water_temp_notes        text,                   -- e.g. "Warmer for juveniles"
    uvb_index_min           numeric(3,1),           -- e.g. 3.0
    uvb_index_max           numeric(3,1),           -- e.g. 4.0
    uvb_type                text,                   -- e.g. "Full-spectrum T5 HO"
    diet_type               text,                   -- e.g. "Omnivore"
    diet_notes              text,                   -- e.g. "More plants as adults"

    -- "Before You Commit" callout
    before_you_commit       text,

    -- Banner image (public URL from Supabase storage bucket)
    banner_image_url        text,

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Each species gets at most one care guide
CREATE UNIQUE INDEX idx_care_guides_species ON care_guides(species_id);
CREATE INDEX idx_care_guides_status ON care_guides(status);


-- ============================================================================
-- 2. HOUSING & ENCLOSURE SECTION
-- ============================================================================

CREATE TABLE care_guide_housing (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,                   -- Section intro paragraph
    essentials      jsonb DEFAULT '[]',     -- String array, e.g. ["Leak-proof tank, tub, or pond", ...]
    common_mistakes jsonb DEFAULT '[]',     -- String array, e.g. ["Using small gravel (ingestion risk)", ...]
    cohabitation_notes text,                -- "A Note on Cohabitation" callout
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Enclosure sizing by life stage (multiple rows per guide)
CREATE TABLE care_guide_enclosure_sizes (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    life_stage      text NOT NULL,          -- e.g. "Hatchling", "Juvenile", "Adult Male", "Adult Female"
    size_range      text,                   -- e.g. "Under 2\"", "2-5\"", "6-10\""
    min_gallons     int NOT NULL,
    max_gallons     int,                    -- nullable if single value (e.g. just "20 gallons")
    notes           text,                   -- e.g. "Maintain warmer water temps", "Females grow significantly larger"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_enclosure_sizes_guide ON care_guide_enclosure_sizes(care_guide_id);


-- ============================================================================
-- 3. LIGHTING & UVB SECTION
-- ============================================================================

CREATE TABLE care_guide_lighting (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- UVB Lighting card
    uvb_bulb_type       text,               -- e.g. "T5 HO fluorescent (Arcadia 6% or Zoo Med ReptiSun 5.0)"
    uvb_target_uvi_min  numeric(3,1),       -- e.g. 3.0
    uvb_target_uvi_max  numeric(3,1),       -- e.g. 4.0
    uvb_target_notes    text,               -- e.g. "at basking spot"
    uvb_distance        text,               -- e.g. "13-14 inches from basking area"
    uvb_replacement     text,               -- e.g. "Every 6-12 months (output decays)"

    -- Daylight Lighting card
    daylight_type       text,               -- e.g. "6500K T5 fluorescent or LED bar"
    daylight_coverage   text,               -- e.g. "3/4 to full length of enclosure"
    daylight_purpose    text,               -- e.g. "Simulates natural daylight, supports plants"
    daylight_note       text,               -- e.g. "UVB alone is not bright enough"

    -- Photoperiod
    summer_light_hours  int,                -- e.g. 14
    winter_light_hours  int,                -- e.g. 10

    -- Outdoor housing callout
    outdoor_housing_note text,

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 4. TEMPERATURE & HEATING SECTION
-- ============================================================================

CREATE TABLE care_guide_temperature (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- Equipment tips stored as JSONB string arrays
    heat_lamp_tips      jsonb DEFAULT '[]',     -- e.g. ["Two 75w halogen bulbs over basking area", ...]
    water_heater_tips   jsonb DEFAULT '[]',
    thermometer_tips    jsonb DEFAULT '[]',

    -- Safety warning callout
    safety_warning      text,

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Temperature zones (multiple rows per guide)
CREATE TABLE care_guide_temp_zones (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    zone_name       text NOT NULL,          -- e.g. "Basking Surface", "Air Temperature", "Water (Adults)"
    temp_min_f      int NOT NULL,
    temp_max_f      int NOT NULL,
    temp_min_c      int,                    -- auto-calculable, but nice for display
    temp_max_c      int,
    notes           text,                   -- e.g. "from daytime" for nighttime drop
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_temp_zones_guide ON care_guide_temp_zones(care_guide_id);


-- ============================================================================
-- 5. WATER QUALITY & MAINTENANCE SECTION
-- ============================================================================

CREATE TABLE care_guide_water (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- Filtration card
    filtration_text     text,               -- Main filtration paragraph
    filtration_example  text,               -- e.g. "120 gal water = filter rated for 240-360 gal"
    filtration_tips     jsonb DEFAULT '[]', -- e.g. ["Canister filters (e.g., Fluval FX6)", ...]

    -- Water changes card
    water_changes_text  text,               -- Main water changes paragraph

    -- Pro tips / callouts
    feeding_tip         text,               -- "Feed in a Separate Container" callout
    conditioner_tip     text,               -- "Water Conditioner" callout

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Water change schedule (multiple rows per guide)
CREATE TABLE care_guide_water_schedules (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    tank_size       text NOT NULL,          -- e.g. "10 gallon", "50 gallon", "100+ gallon"
    frequency       text NOT NULL,          -- e.g. "2-3x per week", "1x per week", "30% every 1-2 weeks"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_water_schedules_guide ON care_guide_water_schedules(care_guide_id);


-- ============================================================================
-- 6. DIET & NUTRITION SECTION
-- ============================================================================

CREATE TABLE care_guide_diet (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- Portion size descriptions
    portion_protein     text,               -- e.g. "What they eat in 5-10 min"
    portion_vegetables  text,               -- e.g. "Same size as the shell"
    portion_pellets     text,               -- e.g. "Same size as the head"

    -- Calcium & supplements callout
    calcium_supplements text,

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Feeding schedule by life stage (multiple rows per guide)
CREATE TABLE care_guide_feeding_schedules (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    life_stage      text NOT NULL,          -- e.g. "Under 6 months", "6-12 months", "Over 1 year"
    protein_pct     int,                    -- e.g. 50, 25
    vegetable_pct   int,                    -- e.g. 50, 75
    protein_frequency   text,               -- e.g. "Daily", "Every other day", "2-3x per week"
    vegetable_frequency text,               -- e.g. "Daily"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_feeding_schedules_guide ON care_guide_feeding_schedules(care_guide_id);


-- ============================================================================
-- 7. HANDLING & INTERACTION SECTION
-- ============================================================================

CREATE TABLE care_guide_handling (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,
    dos             jsonb DEFAULT '[]',     -- String array of handling do's
    donts           jsonb DEFAULT '[]',     -- String array of handling don'ts
    salmonella_warning text,                -- Salmonella warning callout
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 8. HEALTH & COMMON ISSUES SECTION
-- ============================================================================

CREATE TABLE care_guide_health (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,
    when_to_see_vet     text,               -- "When to See a Vet" callout
    preventive_care     jsonb DEFAULT '[]', -- String array for preventive care checklist
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 9. SHARED REFERENCE: FOODS
-- ============================================================================
-- Master list of foods that can be linked to any care guide.
-- Avoids duplicating "crickets", "collard greens", etc. across every guide.

CREATE TABLE foods (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL UNIQUE,       -- e.g. "Crickets", "Collard greens"
    category    food_category NOT NULL,     -- protein, vegetable, fruit, commercial, supplement
    notes       text,                       -- Optional general notes about this food
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_foods_category ON foods(category);

-- Junction: which foods are appropriate for which care guide
CREATE TABLE care_guide_foods (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    food_id         uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    notes           text,                   -- Guide-specific notes, e.g. "raw, grated" for carrots
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),

    UNIQUE(care_guide_id, food_id)
);

CREATE INDEX idx_care_guide_foods_guide ON care_guide_foods(care_guide_id);


-- ============================================================================
-- 10. SHARED REFERENCE: HEALTH ISSUES
-- ============================================================================
-- Master list of common health issues. Severity and specific notes
-- can vary per care guide via the junction table.

CREATE TABLE health_issues (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL UNIQUE,   -- e.g. "Metabolic Bone Disease (MBD)"
    description     text,                   -- General description of the condition
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Junction: health issues per care guide, with guide-specific details
CREATE TABLE care_guide_health_issues (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    health_issue_id uuid NOT NULL REFERENCES health_issues(id) ON DELETE CASCADE,
    severity        health_issue_severity NOT NULL,  -- urgent, moderate, monitor
    common_cause    text,                   -- Guide-specific cause, e.g. "Insufficient UVB or calcium"
    signs           text,                   -- Guide-specific signs, e.g. "Soft shell, deformed limbs, lethargy"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),

    UNIQUE(care_guide_id, health_issue_id)
);

CREATE INDEX idx_care_guide_health_issues_guide ON care_guide_health_issues(care_guide_id);


-- ============================================================================
-- 11. RELATED CARE GUIDES (manual override)
-- ============================================================================
-- For manually associating related guides. If no manual entries exist
-- for a guide, the frontend falls back to auto-suggesting species from
-- the same family/category that also have published care guides.

CREATE TABLE care_guide_related (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id       uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    related_guide_id    uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    sort_order          int NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now(),

    UNIQUE(care_guide_id, related_guide_id),
    CHECK (care_guide_id != related_guide_id)  -- Can't relate to itself
);

CREATE INDEX idx_related_guides ON care_guide_related(care_guide_id);


-- ============================================================================
-- 12. REFERENCES
-- ============================================================================
-- Mirrors public.turtle_species_references structure, scoped to care guides.
-- Reuses the existing public.reference_type enum.

CREATE TABLE care_guide_references (
    id              bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    reference_type  public.reference_type,
    citation_full   text,
    citation_short  text,
    authors         text,
    year            text,
    title           text,
    source_name     text,
    url             text,
    doi             text,
    access_date     date,
    notes           text,
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_guide_references_guide ON care_guide_references(care_guide_id);


-- ============================================================================
-- 12. UPDATED_AT TRIGGER
-- ============================================================================
-- Auto-updates the updated_at timestamp on any row change.

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables that have updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_housing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_lighting
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_temperature
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_water
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_diet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_handling
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_health
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Public read access for published guides, authenticated write for admin.
-- Adjust the admin check to match your auth setup (e.g. role-based, user ID, etc.)

ALTER TABLE care_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_housing ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_lighting ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_temperature ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_water ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_diet ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_handling ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_enclosure_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_temp_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_water_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_feeding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_health_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_related ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_references ENABLE ROW LEVEL SECURITY;

-- Public read for published care guides
-- (Section tables join through care_guides, so we check status there)
CREATE POLICY "Public can read published care guides"
    ON care_guides FOR SELECT
    USING (status = 'published');

-- For section/detail tables: allow public read if the parent guide is published
-- Repeat this pattern for each table. Here's the template for all:

CREATE POLICY "Public can read housing for published guides"
    ON care_guide_housing FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read lighting for published guides"
    ON care_guide_lighting FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read temperature for published guides"
    ON care_guide_temperature FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read water for published guides"
    ON care_guide_water FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read diet for published guides"
    ON care_guide_diet FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read handling for published guides"
    ON care_guide_handling FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read health for published guides"
    ON care_guide_health FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read enclosure sizes for published guides"
    ON care_guide_enclosure_sizes FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read temp zones for published guides"
    ON care_guide_temp_zones FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read water schedules for published guides"
    ON care_guide_water_schedules FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read feeding schedules for published guides"
    ON care_guide_feeding_schedules FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read foods"
    ON foods FOR SELECT
    USING (true);

CREATE POLICY "Public can read care guide foods for published guides"
    ON care_guide_foods FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read health issues"
    ON health_issues FOR SELECT
    USING (true);

CREATE POLICY "Public can read care guide health issues for published guides"
    ON care_guide_health_issues FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read related guides for published guides"
    ON care_guide_related FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read references for published guides"
    ON care_guide_references FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));


-- ============================================================================
-- ADMIN POLICIES
-- ============================================================================
-- TODO: Replace this with your actual admin check.
-- Options:
--   1. Check auth.uid() against a specific admin user ID
--   2. Check a role in a profiles/users table
--   3. Use Supabase service_role key for admin operations (bypasses RLS)
--
-- Example using a specific admin user ID:
--
-- CREATE POLICY "Admin full access to care guides"
--     ON care_guides FOR ALL
--     USING (auth.uid() = 'YOUR_ADMIN_UUID')
--     WITH CHECK (auth.uid() = 'YOUR_ADMIN_UUID');
--
-- For now, if you manage content via the Supabase dashboard,
-- the dashboard uses the service_role key which bypasses RLS entirely.
-- So these admin policies are only needed if you build a custom admin UI.


-- ============================================================================
-- HELPFUL VIEWS (optional)
-- ============================================================================

-- Full care guide overview for listing pages
CREATE OR REPLACE VIEW care_guide_overview AS
SELECT
    cg.id,
    cg.slug,
    cg.status,
    cg.difficulty,
    ts.species_common_name,
    ts.species_scientific_name,
    cg.adult_size_min_inches,
    cg.adult_size_max_inches,
    cg.lifespan_min_years,
    cg.lifespan_max_years,
    cg.enclosure_min_gallons,
    cg.diet_type,
    cg.created_at,
    cg.updated_at
FROM care_guides cg
JOIN public.turtle_species ts ON ts.id = cg.species_id;


-- Related guides with fallback to same-family species
-- Use this in your frontend: it returns manual associations if they exist,
-- otherwise falls back to species in the same family with published guides.
CREATE OR REPLACE VIEW care_guide_related_with_fallback AS
WITH manual_related AS (
    -- Manual associations
    SELECT
        cgr.care_guide_id,
        related.id AS related_guide_id,
        related.slug AS related_slug,
        ts.species_common_name AS related_name,
        cgr.sort_order,
        true AS is_manual
    FROM care_guide_related cgr
    JOIN care_guides related ON related.id = cgr.related_guide_id
    JOIN public.turtle_species ts ON ts.id = related.species_id
    WHERE related.status = 'published'
),
has_manual AS (
    -- Which guides have manual associations?
    SELECT DISTINCT care_guide_id FROM manual_related
),
auto_related AS (
    -- Auto-suggested: same genus, different species, published guide
    SELECT
        cg.id AS care_guide_id,
        other.id AS related_guide_id,
        other.slug AS related_slug,
        ts_other.species_common_name AS related_name,
        0 AS sort_order,
        false AS is_manual
    FROM care_guides cg
    JOIN public.turtle_species ts ON ts.id = cg.species_id
    JOIN public.turtle_species ts_other ON ts_other.tax_parent_genus = ts.tax_parent_genus AND ts_other.id != ts.id
    JOIN care_guides other ON other.species_id = ts_other.id AND other.status = 'published'
    WHERE cg.id NOT IN (SELECT care_guide_id FROM has_manual)
)
SELECT * FROM manual_related
UNION ALL
SELECT * FROM auto_related;
