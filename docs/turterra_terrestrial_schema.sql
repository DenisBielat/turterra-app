-- ============================================================================
-- TURTERRA CARE GUIDES - TERRESTRIAL SUPPORT
-- ============================================================================
-- Adds terrestrial-specific section tables and extends shared tables
-- with optional fields used by terrestrial guides.
--
-- New tables:
--   - care_guide_housing_terrestrial (replaces care_guide_housing for terrestrial)
--   - care_guide_enclosure_sizes_terrestrial (dimensions/sq ft instead of gallons)
--   - care_guide_substrate (entirely new section)
--   - care_guide_substrate_depths (multi-row: indoor min, indoor ideal, outdoor)
--   - care_guide_substrate_options (multi-row: substrate mixes with pros/cons)
--   - care_guide_substrate_maintenance (multi-row: daily/periodic tasks)
--   - care_guide_humidity (entirely new section)
--   - care_guide_humidity_zones (multi-row: like temp zones but for humidity %)
--   - care_guide_humidity_targets (multi-row: time-of-day target ranges)
--
-- Extended tables:
--   - care_guide_temperature: added indoor/outdoor/hibernation callout fields
--   - care_guide_diet: added foods_to_avoid, commercial_diets, drinking_water
--
-- Run in Supabase SQL editor.
-- ============================================================================

SET search_path TO care_guides, public;


-- ============================================================================
-- 1. HOUSING - TERRESTRIAL
-- ============================================================================
-- Parallel to care_guide_housing but with terrestrial-specific fields:
-- outdoor vs indoor enclosure descriptions, dimension-based sizing.

CREATE TABLE care_guide_housing_terrestrial (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- Outdoor Enclosure card
    outdoor_title       text DEFAULT 'Outdoor Enclosure (Preferred)',
    outdoor_description text,                   -- Intro paragraph for outdoor card
    outdoor_tips        jsonb DEFAULT '[]',     -- String array: ["Walls at least 2'' tall...", ...]

    -- Indoor Enclosure card
    indoor_title        text DEFAULT 'Indoor Enclosure',
    indoor_description  text,                   -- Intro paragraph for indoor card
    indoor_tips         jsonb DEFAULT '[]',     -- String array: ["Custom-built wood or PVC...", ...]

    -- Shared with aquatic housing pattern
    essentials          jsonb DEFAULT '[]',     -- Enclosure Essentials list
    common_mistakes     jsonb DEFAULT '[]',     -- Common Mistakes list
    cohabitation_notes  text,                   -- "A Note on Cohabitation" callout

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 2. ENCLOSURE SIZES - TERRESTRIAL
-- ============================================================================
-- Dimensions (L x W x H) and square footage instead of gallons.

CREATE TABLE care_guide_enclosure_sizes_terrestrial (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    scenario        text NOT NULL,          -- e.g. "Single Adult", "Pair", "Outdoor Pen"
    size_range      text,                   -- e.g. "Up to 8\"", "Two adults", "Any"
    dimensions      text,                   -- e.g. "6.5' x 3.5' x 2'", "As large as possible"
    min_sq_ft       int,                    -- e.g. 23, 50
    notes           text,                   -- e.g. "Minimum for one turtle", "Preferred housing method"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_enclosure_sizes_terr_guide ON care_guide_enclosure_sizes_terrestrial(care_guide_id);


-- ============================================================================
-- 3. SUBSTRATE SECTION (terrestrial only)
-- ============================================================================

CREATE TABLE care_guide_substrate (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- Leaf Litter Layer callout
    leaf_litter_text    text,

    -- Quarantine Note callout
    quarantine_note     text,

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Substrate depth recommendations (indoor minimum, indoor ideal, outdoor)
CREATE TABLE care_guide_substrate_depths (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    label           text NOT NULL,          -- e.g. "Indoor Minimum", "Indoor Ideal", "Outdoor"
    depth           text NOT NULL,          -- e.g. "4\"", "6-8\"", "12\"+"
    description     text,                   -- e.g. "Allows basic burrowing"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_substrate_depths_guide ON care_guide_substrate_depths(care_guide_id);

-- Substrate options with pros/cons (like commercial products but substrate-specific)
CREATE TABLE care_guide_substrate_options (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    name            text NOT NULL,          -- e.g. "DIY Temperate Mix", "Zoo Med Eco Earth"
    description     text,                   -- e.g. "40% organic topsoil, 40% Reptisoil, 20% play sand"
    is_recommended  boolean NOT NULL DEFAULT false,  -- Shows "Recommended" badge
    pros            jsonb DEFAULT '[]',     -- String array
    cons            jsonb DEFAULT '[]',     -- String array
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_substrate_options_guide ON care_guide_substrate_options(care_guide_id);

-- Cleaning & maintenance schedules (Daily tasks, Every 3-6 Months tasks, etc.)
CREATE TABLE care_guide_substrate_maintenance (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    frequency       text NOT NULL,          -- e.g. "Daily", "Every 3-6 Months"
    tasks           jsonb DEFAULT '[]',     -- String array: ["Spot-clean feces and urates", ...]
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_substrate_maintenance_guide ON care_guide_substrate_maintenance(care_guide_id);


-- ============================================================================
-- 4. HUMIDITY SECTION (terrestrial only)
-- ============================================================================

CREATE TABLE care_guide_humidity (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL UNIQUE REFERENCES care_guides(id) ON DELETE CASCADE,
    intro_text      text,

    -- Method cards (humid hide, daily misting, substrate choice)
    humid_hide_tips     jsonb DEFAULT '[]',     -- String array
    daily_misting_tips  jsonb DEFAULT '[]',     -- String array
    substrate_tips      jsonb DEFAULT '[]',     -- String array

    -- Monitoring section
    monitoring_text     text,                   -- Monitoring intro paragraph

    -- Warning callouts
    inadequate_humidity_warning text,           -- "Signs of Inadequate Humidity"
    outdoor_note        text,                   -- "Outdoor Enclosures" info callout

    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Humidity zones (like temp zones but percentages)
CREATE TABLE care_guide_humidity_zones (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    zone_name       text NOT NULL,          -- e.g. "Humid Hide", "Substrate (moist)", "Ambient Average"
    humidity_min_pct int NOT NULL,           -- e.g. 80
    humidity_max_pct int,                    -- e.g. 90 (nullable for open-ended like "51%+")
    notes           text,                   -- e.g. "Lined with moist sphagnum moss"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_humidity_zones_guide ON care_guide_humidity_zones(care_guide_id);

-- Time-of-day humidity targets (Morning, Afternoon, Night)
CREATE TABLE care_guide_humidity_targets (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    time_label      text NOT NULL,          -- e.g. "Morning", "Afternoon", "Night"
    target          text NOT NULL,          -- e.g. "70-80% after misting", "60-70% acceptable dip"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_humidity_targets_guide ON care_guide_humidity_targets(care_guide_id);


-- ============================================================================
-- 5. EXTEND TEMPERATURE TABLE
-- ============================================================================
-- Add optional callout fields used by terrestrial guides.
-- These are nullable so existing aquatic guides are unaffected.

ALTER TABLE care_guide_temperature
ADD COLUMN IF NOT EXISTS indoor_heating_note text,      -- "Indoor Heating" callout
ADD COLUMN IF NOT EXISTS outdoor_heating_note text,     -- "Outdoor Pens" callout
ADD COLUMN IF NOT EXISTS hibernation_note text,         -- "Hibernation (Brumation)" callout
ADD COLUMN IF NOT EXISTS light_cycle_tips jsonb DEFAULT NULL;  -- String array for "Light Cycle" card tips


-- ============================================================================
-- 6. EXTEND DIET TABLE
-- ============================================================================
-- Add optional fields for terrestrial diet features.
-- These are nullable so existing aquatic guides are unaffected.

ALTER TABLE care_guide_diet
ADD COLUMN IF NOT EXISTS foods_to_avoid jsonb DEFAULT NULL,      -- String array: ["Iceberg lettuce (no nutrition)", ...]
ADD COLUMN IF NOT EXISTS commercial_diets jsonb DEFAULT NULL,    -- String array: ["Reptilinks", "Mazuri Tortoise Diet", ...]
ADD COLUMN IF NOT EXISTS commercial_diets_note text,             -- Intro text: "Quality commercial diets can supplement..."
ADD COLUMN IF NOT EXISTS drinking_water text;                    -- "Drinking Water" callout text


-- ============================================================================
-- 7. EXTEND CARE GUIDES (At a Glance for terrestrial)
-- ============================================================================
-- Terrestrial guides use sq ft instead of gallons for enclosure size.

ALTER TABLE care_guides
ADD COLUMN IF NOT EXISTS enclosure_min_sq_ft int,               -- e.g. 23 (for terrestrial)
ADD COLUMN IF NOT EXISTS humidity_min_pct int,                  -- e.g. 60 (for At a Glance display)
ADD COLUMN IF NOT EXISTS humidity_max_pct int;                  -- e.g. 80


-- ============================================================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_housing_terrestrial
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_substrate
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_humidity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE care_guide_housing_terrestrial ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_enclosure_sizes_terrestrial ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_substrate ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_substrate_depths ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_substrate_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_substrate_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_humidity ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_humidity_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_humidity_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read terrestrial housing for published guides"
    ON care_guide_housing_terrestrial FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read terrestrial enclosure sizes for published guides"
    ON care_guide_enclosure_sizes_terrestrial FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read substrate for published guides"
    ON care_guide_substrate FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read substrate depths for published guides"
    ON care_guide_substrate_depths FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read substrate options for published guides"
    ON care_guide_substrate_options FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read substrate maintenance for published guides"
    ON care_guide_substrate_maintenance FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read humidity for published guides"
    ON care_guide_humidity FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read humidity zones for published guides"
    ON care_guide_humidity_zones FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));

CREATE POLICY "Public can read humidity targets for published guides"
    ON care_guide_humidity_targets FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));


-- ============================================================================
-- 10. GRANTS
-- ============================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA care_guides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA care_guides TO authenticated;


-- ============================================================================
-- 11. NEW PRODUCT CATEGORIES FOR TERRESTRIAL
-- ============================================================================
-- Terrestrial guides need Substrate and Humidity product categories.

INSERT INTO product_categories (name, slug, sort_order) VALUES
    ('Substrate',   'substrate',    6),
    ('Humidity',    'humidity',     7)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- New setup types for terrestrial
INSERT INTO setup_types (name, slug, is_active, sort_order) VALUES
    ('Indoor Setup',    'indoor',   true,   4),
    ('Outdoor Pen',     'outdoor',  true,   5)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;
