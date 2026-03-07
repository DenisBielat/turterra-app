-- ============================================================================
-- TURTERRA CARE GUIDES - RECOMMENDED PRODUCTS SCHEMA (COMPLETE)
-- ============================================================================
-- All product-related tables for the care guides system.
-- Products and DIY options are shared across guides; per-guide junctions
-- control which products appear for each species and with what priority.
--
-- Assumes the care_guides schema and core care_guides table already exist.
-- ============================================================================

SET search_path TO care_guides, public;


-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE product_priority AS ENUM ('essential', 'recommended', 'optional');
CREATE TYPE diy_difficulty AS ENUM ('easy', 'medium', 'hard');


-- ============================================================================
-- 1. SETUP TYPES (reference table)
-- ============================================================================
-- Tank Setup, Tub Setup, Pond / Outdoor, etc.

CREATE TABLE setup_types (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL UNIQUE,       -- e.g. "Tank Setup"
    slug        text NOT NULL UNIQUE,       -- e.g. "tank"
    is_active   boolean NOT NULL DEFAULT true,  -- false = "Coming Soon"
    sort_order  int NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 2. PRODUCT CATEGORIES (reference table)
-- ============================================================================
-- Enclosure, Lighting & UVB, Heating & Temperature, etc.

CREATE TABLE product_categories (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL UNIQUE,       -- e.g. "Enclosure"
    slug        text NOT NULL UNIQUE,       -- e.g. "enclosure"
    icon        text,                       -- Icon identifier for frontend
    sort_order  int NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 3. PRODUCT ITEMS (shared master table)
-- ============================================================================
-- Generic item slots like "Basking Platform / Dock", "Glass Aquarium", etc.
-- These represent the *type* of product, not a specific brand/model.
-- Shared across care guides.

CREATE TABLE product_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     uuid NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    name            text NOT NULL,              -- e.g. "Basking Platform / Dock"
    slug            text NOT NULL UNIQUE,       -- e.g. "basking-platform-dock"
    description     text,                       -- Brief description shown on detail page
    what_to_look_for jsonb DEFAULT '[]',        -- String array: ["Must support turtle's full weight", ...]
    show_what_to_look_for boolean NOT NULL DEFAULT true,  -- Toggle display of "What to Look For" on detail page
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_items_category ON product_items(category_id);


-- ============================================================================
-- 4. COMMERCIAL PRODUCTS (shared master table)
-- ============================================================================
-- Specific products like "Penn-Plax Turtle Topper".
-- One record per product, reused across care guides.

CREATE TABLE commercial_products (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,              -- e.g. "Penn-Plax Turtle Topper"
    brand           text,                       -- e.g. "Penn-Plax"
    rating          numeric(2,1),               -- e.g. 4.2
    description     text,                       -- Product description
    pros            jsonb DEFAULT '[]',         -- String array: ["Maximizes swim space", ...]
    cons            jsonb DEFAULT '[]',         -- String array: ["Only fits standard tank sizes", ...]
    best_for        text,                       -- e.g. "Standard glass aquariums up to 55 gallons"
    affiliate_url   text,                       -- "Check Price" link
    image_url       text,                       -- Product image
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 5. DIY OPTIONS (shared master table)
-- ============================================================================
-- DIY alternatives like "Egg Crate Light Diffuser Platform".
-- One record per DIY option, reused across care guides.

CREATE TABLE diy_options (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,              -- e.g. "Egg Crate Light Diffuser Platform"
    difficulty      diy_difficulty NOT NULL,     -- easy, medium, hard
    est_cost_min    numeric(8,2),               -- e.g. 10.00
    est_cost_max    numeric(8,2),               -- e.g. 20.00
    est_time        text,                       -- e.g. "1-2 hours"
    description     text,                       -- Build description
    materials       jsonb DEFAULT '[]',         -- String array: ["Egg crate light diffuser", "Zip ties", ...]
    tutorials       jsonb DEFAULT '[]',         -- Array of objects: [{"title": "...", "url": "...", "source": "...", "type": "video|guide"}]
    image_url       text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================================
-- 6. CARE GUIDE PRODUCT ITEMS (per-guide junction)
-- ============================================================================
-- Links a care guide to product items for a specific setup type.
-- Controls priority (essential/recommended/optional) and whether
-- DIY options are shown for this item in this guide.

CREATE TABLE care_guide_product_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    setup_type_id   uuid NOT NULL REFERENCES setup_types(id) ON DELETE CASCADE,
    product_item_id uuid NOT NULL REFERENCES product_items(id) ON DELETE CASCADE,
    priority        product_priority NOT NULL DEFAULT 'recommended',
    has_diy         boolean NOT NULL DEFAULT false,  -- Show DIY badge
    notes           text,                       -- Guide-specific subtitle, e.g. "75-125+ gallon"
    sort_order      int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),

    -- Each item appears once per guide + setup type combo
    UNIQUE(care_guide_id, setup_type_id, product_item_id)
);

CREATE INDEX idx_cgpi_guide ON care_guide_product_items(care_guide_id);
CREATE INDEX idx_cgpi_setup ON care_guide_product_items(setup_type_id);


-- ============================================================================
-- 7. CARE GUIDE PRODUCT ITEM → COMMERCIAL PRODUCTS (per-guide junction)
-- ============================================================================
-- Which commercial products to show for a given item in a given guide.
-- This allows different species guides to recommend different specific
-- products for the same product item slot.

CREATE TABLE care_guide_item_commercial (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_product_item_id uuid NOT NULL REFERENCES care_guide_product_items(id) ON DELETE CASCADE,
    commercial_product_id   uuid NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
    sort_order              int NOT NULL DEFAULT 0,
    created_at              timestamptz NOT NULL DEFAULT now(),

    UNIQUE(care_guide_product_item_id, commercial_product_id)
);

CREATE INDEX idx_cgic_item ON care_guide_item_commercial(care_guide_product_item_id);


-- ============================================================================
-- 8. CARE GUIDE PRODUCT ITEM → DIY OPTIONS (per-guide junction)
-- ============================================================================
-- Which DIY options to show for a given item in a given guide.

CREATE TABLE care_guide_item_diy (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_product_item_id uuid NOT NULL REFERENCES care_guide_product_items(id) ON DELETE CASCADE,
    diy_option_id           uuid NOT NULL REFERENCES diy_options(id) ON DELETE CASCADE,
    sort_order              int NOT NULL DEFAULT 0,
    created_at              timestamptz NOT NULL DEFAULT now(),

    UNIQUE(care_guide_product_item_id, diy_option_id)
);

CREATE INDEX idx_cgid_item ON care_guide_item_diy(care_guide_product_item_id);


-- ============================================================================
-- 9. CARE GUIDE CATEGORY NOTES (per-guide, per-category)
-- ============================================================================
-- Optional notes displayed at the bottom of a product category accordion
-- for a specific care guide. Example: "For fresh foods like leafy greens,
-- feeder fish, and insects, see our detailed feeding recommendations in
-- the Diet & Nutrition section."

CREATE TABLE care_guide_product_category_notes (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    care_guide_id   uuid NOT NULL REFERENCES care_guides(id) ON DELETE CASCADE,
    category_id     uuid NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    notes           text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),

    UNIQUE(care_guide_id, category_id)
);

CREATE INDEX idx_category_notes_guide ON care_guide_product_category_notes(care_guide_id);


-- ============================================================================
-- 10. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON product_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON commercial_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON diy_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_guide_product_category_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE setup_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE diy_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_product_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_item_commercial ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_item_diy ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_guide_product_category_notes ENABLE ROW LEVEL SECURITY;

-- Reference tables: public read
CREATE POLICY "Public can read setup types"
    ON setup_types FOR SELECT USING (true);
CREATE POLICY "Public can read product categories"
    ON product_categories FOR SELECT USING (true);
CREATE POLICY "Public can read product items"
    ON product_items FOR SELECT USING (true);
CREATE POLICY "Public can read commercial products"
    ON commercial_products FOR SELECT USING (true);
CREATE POLICY "Public can read diy options"
    ON diy_options FOR SELECT USING (true);

-- Per-guide junctions: public read only for published guides
CREATE POLICY "Public can read product items for published guides"
    ON care_guide_product_items FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));
CREATE POLICY "Public can read item commercial for published guides"
    ON care_guide_item_commercial FOR SELECT
    USING (care_guide_product_item_id IN (
        SELECT id FROM care_guide_product_items
        WHERE care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published')
    ));
CREATE POLICY "Public can read item diy for published guides"
    ON care_guide_item_diy FOR SELECT
    USING (care_guide_product_item_id IN (
        SELECT id FROM care_guide_product_items
        WHERE care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published')
    ));
CREATE POLICY "Public can read category notes for published guides"
    ON care_guide_product_category_notes FOR SELECT
    USING (care_guide_id IN (SELECT id FROM care_guides WHERE status = 'published'));


-- ============================================================================
-- 12. GRANTS
-- ============================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA care_guides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA care_guides TO authenticated;


-- ============================================================================
-- 13. SEED: SETUP TYPES & PRODUCT CATEGORIES
-- ============================================================================

INSERT INTO setup_types (name, slug, is_active, sort_order) VALUES
    ('Tank Setup',      'tank',     true,   1),
    ('Tub Setup',       'tub',      true,   2),
    ('Pond / Outdoor',  'pond',     false,  3)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

INSERT INTO product_categories (name, slug, sort_order) VALUES
    ('Enclosure',               'enclosure',    1),
    ('Lighting & UVB',          'lighting-uvb', 2),
    ('Heating & Temperature',   'heating-temp', 3),
    ('Filtration & Water',      'filtration',   4),
    ('Food & Supplements',      'food',         5)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;


-- ============================================================================
-- 14. SEED: PRODUCT ITEMS (descriptions + what to look for)
-- ============================================================================

DO $$
DECLARE
    cat_enclosure       uuid;
    cat_lighting        uuid;
    cat_heating         uuid;
    cat_filtration      uuid;
    cat_food            uuid;
BEGIN
    SELECT id INTO cat_enclosure FROM product_categories WHERE slug = 'enclosure';
    SELECT id INTO cat_lighting FROM product_categories WHERE slug = 'lighting-uvb';
    SELECT id INTO cat_heating FROM product_categories WHERE slug = 'heating-temp';
    SELECT id INTO cat_filtration FROM product_categories WHERE slug = 'filtration';
    SELECT id INTO cat_food FROM product_categories WHERE slug = 'food';

    -- ========================================================================
    -- ENCLOSURE
    -- ========================================================================

    INSERT INTO product_items (category_id, name, slug, description, what_to_look_for, show_what_to_look_for) VALUES

    (cat_enclosure,
     'Glass Aquarium (75-125+ gallon)',
     'glass-aquarium',
     'A standard glass aquarium is the most common enclosure for indoor aquatic turtles. Glass provides excellent visibility and is widely available in a range of sizes. For painted turtles, plan for at least 10 gallons of water per inch of shell length — meaning adults typically need 75–125+ gallons depending on sex and size.',
     '["Tempered glass construction for durability and safety",
       "Tank dimensions that prioritize floor space over height — turtles need swimming room, not depth",
       "A rim or frame that supports a screen lid and light fixtures",
       "Adequate width for a basking platform without blocking the full swimming area",
       "Pre-drilled overflow holes are a bonus for easier filter plumbing",
       "Consider the weight when full — a 100-gallon tank weighs over 800 lbs — and ensure your floor and stand can support it"]',
     true),

    (cat_enclosure,
     'Basking Platform / Dock',
     'basking-platform-dock',
     'An above-water platform where your turtle can fully dry off and bask under heat and UVB lights. Essential for thermoregulation and shell health. Without a proper basking area, turtles cannot regulate their body temperature or synthesize vitamin D3.',
     '["Must support your turtle''s full weight without tipping or shifting",
       "Non-abrasive surface to protect the plastron (belly shell)",
       "Large enough for the turtle to fully extend and turn around on",
       "Easy ramp access — turtles aren''t great climbers, so a gradual incline works best",
       "Positioned 6–8 inches below the heat lamp for proper basking temperatures",
       "Suction cups or mounting hardware that stays secure in water over time"]',
     true),

    (cat_enclosure,
     'Screen Lid / Light Mount',
     'screen-lid-light-mount',
     'A mesh or screen top that serves dual purposes: preventing your turtle from escaping and providing a mounting surface for UVB and heat lamps. UVB rays cannot pass through glass or solid plastic, so a mesh lid is essential for proper light exposure.',
     '["Fine enough mesh to prevent escape but open enough to allow UVB penetration",
       "Strong enough to support the weight of light fixtures resting on top",
       "Sized to fit your specific tank dimensions — measure before buying",
       "Metal mesh holds up better than plastic over time, especially near heat sources",
       "Hinged or split design makes feeding and maintenance easier without removing the whole lid",
       "Avoid very fine mesh (like window screen), which can filter out a significant amount of UVB"]',
     true),

    (cat_enclosure,
     'Substrate (Optional)',
     'substrate',
     'The material covering the bottom of your enclosure. While many turtle keepers prefer a bare bottom for easiest cleaning, substrate can provide enrichment and a more natural appearance. The key concern is avoiding anything small enough for your turtle to accidentally swallow.',
     '["Large river rocks (too big to fit in your turtle''s mouth) are the safest natural option",
       "Fine play sand is acceptable but makes cleaning more difficult",
       "Bare bottom is the easiest to maintain and perfectly fine for your turtle",
       "Avoid gravel, pebbles, and small stones — ingestion risk is serious and can require surgery",
       "If using sand, choose a thin layer (1 inch or less) to prevent waste from accumulating underneath"]',
     true)

    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        what_to_look_for = EXCLUDED.what_to_look_for,
        show_what_to_look_for = EXCLUDED.show_what_to_look_for;


    -- ========================================================================
    -- LIGHTING & UVB
    -- ========================================================================

    INSERT INTO product_items (category_id, name, slug, description, what_to_look_for, show_what_to_look_for) VALUES

    (cat_lighting,
     'T5 HO UVB Fixture + Bulb',
     't5-ho-uvb-fixture-bulb',
     'A linear T5 High Output fluorescent fixture paired with a 5.0 or 6% UVB bulb. This is the current gold standard for providing proper UVB exposure to aquatic turtles. Without adequate UVB, turtles cannot metabolize calcium, leading to Metabolic Bone Disease (MBD) — one of the most common and preventable health issues in captive turtles.',
     '["T5 HO (High Output) — not T8 or compact/coil UVB, which are weaker and decay faster",
       "5.0 or 6% UVB strength for aquatic turtles — avoid 10.0/desert bulbs which are too intense at close range",
       "Fixture must include a reflector to maximize UVB output directed downward",
       "Mount 13–14 inches above the basking spot for a target UVI of 3.0–4.0",
       "Bulb length should span at least half the enclosure for broad coverage",
       "Replace bulbs every 6–12 months — UVB output decays even if the light still appears to work",
       "Arcadia and Zoo Med ReptiSun are the most trusted brands in the hobby"]',
     true),

    (cat_lighting,
     'Daylight LED or Fluorescent',
     'daylight-led-fluorescent',
     'A bright 6500K daylight lamp that simulates natural sunlight. A UVB bulb alone is not bright enough to replicate daytime conditions. A dedicated daylight source supports your turtle''s circadian rhythm, encourages natural behavior, benefits live plants, and makes the enclosure look better.',
     '["6500K color temperature — this most closely simulates natural daylight",
       "T5 HO fluorescent or high-quality LED bar format for broad, even coverage",
       "Should span 3/4 to the full length of the enclosure",
       "Bright enough to make a visible difference — look for higher lumen output",
       "Waterproof or splash-resistant if mounted close to the water surface",
       "LED bars run cooler and last longer but T5 fluorescents are also excellent"]',
     true),

    (cat_lighting,
     'Light Timer',
     'light-timer',
     'An automatic timer that controls your lighting schedule. Turtles need a consistent day/night cycle — roughly 14 hours of light in summer and 10 hours in winter. Manually switching lights on and off is unreliable, and inconsistent lighting can stress your turtle and disrupt normal behavior patterns.',
     '["Programmable for at least two on/off cycles per day",
       "Rated for the combined wattage of your lighting fixtures",
       "Dual-outlet models let you control heat and UVB on the same timer",
       "Digital timers are more precise and reliable than mechanical dial types",
       "A power strip with a built-in timer can simplify your setup"]',
     true)

    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        what_to_look_for = EXCLUDED.what_to_look_for,
        show_what_to_look_for = EXCLUDED.show_what_to_look_for;


    -- ========================================================================
    -- HEATING & TEMPERATURE
    -- ========================================================================

    INSERT INTO product_items (category_id, name, slug, description, what_to_look_for, show_what_to_look_for) VALUES

    (cat_heating,
     'Basking Heat Lamp',
     'basking-heat-lamp',
     'A halogen flood bulb that provides focused heat over the basking area. PAR38 halogen flood bulbs are the preferred choice — they produce excellent heat output, are widely available at hardware stores, and are far more affordable than specialty reptile-branded heat bulbs that perform identically.',
     '["PAR38 halogen flood bulbs are the best value — 75–90w for most setups",
       "Flood (wide beam) rather than spot (narrow beam) for more even heat distribution",
       "Use two bulbs in a dual dome fixture for larger basking areas",
       "Higher wattage (150–250w) may be needed for large enclosures or tall setups",
       "Plug-in lamp dimmers let you fine-tune the temperature without buying different bulbs",
       "Avoid ceramic heat emitters for basking — they produce no visible light, and turtles associate warmth with light"]',
     true),

    (cat_heating,
     'Ceramic Dome Fixture',
     'ceramic-dome-fixture',
     'A heat-rated lamp fixture that safely holds halogen or incandescent basking bulbs. Standard household lamp fixtures are not designed for the sustained heat output needed in a turtle enclosure. A ceramic socket dome fixture is purpose-built to handle the wattage without melting or creating a fire hazard.',
     '["Ceramic socket — not plastic, which can melt under high-wattage bulbs",
       "Rated for the wattage you plan to use (check the max wattage label)",
       "Dual dome fixtures are ideal for covering a larger basking area with two bulbs",
       "Clamp mount or hanging hardware for secure positioning above the tank",
       "Deep dome design directs heat downward more efficiently than shallow domes",
       "A built-in on/off switch is convenient but not essential if using a timer"]',
     true),

    (cat_heating,
     'Submersible Water Heater',
     'submersible-water-heater',
     'A fully submersible aquarium heater that maintains stable water temperatures. Turtles are cold-blooded and rely on their environment for temperature regulation. Inconsistent or cold water temperatures can suppress appetite, weaken the immune system, and trigger unwanted hibernation attempts that can be fatal in captivity.',
     '["Titanium or heavy-duty plastic construction — never glass, which turtles can shatter",
       "Adjustable thermostat so you can dial in the exact temperature you need",
       "Wattage rated for your water volume (roughly 3–5 watts per gallon as a starting point)",
       "A protective heater guard or cage is essential — prevents burns from direct contact",
       "Fully submersible design gives more flexibility in placement",
       "Models with an external temperature controller are the most reliable",
       "Always use with a GFCI outlet for safety around water"]',
     true),

    (cat_heating,
     'Digital Thermometers',
     'digital-thermometers',
     'Accurate temperature monitoring tools for both the basking area and water. You need two types: an infrared temperature gun for measuring basking surface temperature, and a submersible digital probe thermometer for continuous water temperature monitoring. Guessing at temperatures is one of the most common mistakes new turtle keepers make.',
     '["Infrared (temp gun) thermometer for basking surface — instant, non-contact readings",
       "Submersible digital probe thermometer for water — provides continuous readings",
       "Place probes at both the warm and cool ends of the enclosure to verify your gradient",
       "Look for accuracy within ±1°F for water probes",
       "Monitor regularly — even reliable heaters can drift or fail over time"]',
     true)

    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        what_to_look_for = EXCLUDED.what_to_look_for,
        show_what_to_look_for = EXCLUDED.show_what_to_look_for;


    -- ========================================================================
    -- FILTRATION & WATER
    -- ========================================================================

    INSERT INTO product_items (category_id, name, slug, description, what_to_look_for, show_what_to_look_for) VALUES

    (cat_filtration,
     'Canister Filter',
     'canister-filter',
     'An external canister filter is the backbone of a healthy turtle tank. Turtles produce significantly more waste than fish, and standard aquarium filters designed for fish are not powerful enough. A canister filter sits outside the tank and pumps water through multiple stages of mechanical, biological, and chemical filtration before returning it clean.',
     '["Rated for 2–3x your actual water volume — a 100-gallon tank needs a 200–300 gallon rated filter",
       "Canister style is strongly preferred over hang-on-back or internal filters for turtle tanks",
       "Multi-stage filtration: mechanical (removes debris), biological (processes ammonia), and chemical (removes odors and discoloration)",
       "Easy-access media trays for maintenance without disconnecting the whole unit",
       "Self-priming pump saves effort during setup and after cleaning",
       "Look for models with customizable media baskets so you can optimize filtration over time",
       "Quiet operation is a real quality-of-life feature — you''ll hear a loud filter constantly"]',
     true),

    (cat_filtration,
     'Biological Filter Media',
     'biological-filter-media',
     'Porous media such as ceramic rings, bio-balls, or sponge that provides surface area for beneficial bacteria colonies. These bacteria are what actually break down toxic ammonia and nitrite produced by your turtle''s waste into less harmful nitrate. Without a healthy colony of these bacteria, even the best filter is just moving dirty water around.',
     '["High surface area materials like ceramic rings, lava rock, or sintered glass",
       "Bio-balls are good for wet/dry filtration but ceramic media is more versatile",
       "Never replace all your biological media at once — you''ll crash the nitrogen cycle",
       "Rinse in old tank water during maintenance, never tap water (chlorine kills beneficial bacteria)",
       "Quality media lasts years — you rarely need to fully replace it"]',
     true),

    (cat_filtration,
     'Water Conditioner',
     'water-conditioner',
     'A liquid treatment that neutralizes chlorine, chloramine, and heavy metals in tap water. Tap water is treated with chemicals that are safe for humans but harmful to turtles and the beneficial bacteria in your filter. Every time you add new water to the enclosure — during water changes or top-offs — it must be treated first.',
     '["Neutralizes both chlorine and chloramine — some conditioners only treat chlorine",
       "Detoxifies heavy metals commonly found in municipal water",
       "Reptile-safe formulas like Zoo Med ReptiSafe are made specifically for reptile enclosures",
       "Aquarium conditioners (like Seachem Prime) also work well and are often more cost-effective in larger volumes",
       "Dose according to the volume of new water being added, not the total tank volume"]',
     true),

    (cat_filtration,
     'Gravel Vacuum / Siphon',
     'gravel-vacuum-siphon',
     'A siphon tube used for water changes and spot-cleaning debris from the bottom of the enclosure. Regular water changes are essential even with excellent filtration — filters handle ammonia and particulates, but dissolved nitrates and other compounds build up over time and can only be removed by physically replacing water.',
     '["Python-style water changers connect to a faucet for no-bucket water changes on large tanks",
       "Standard siphon/gravel vacuum works well for smaller setups",
       "Wide-mouth vacuum head picks up debris without clogging on substrate",
       "Long enough hose to reach from your tank to a drain or bucket",
       "For 100+ gallon tanks, a submersible utility pump can make large water changes much faster"]',
     true)

    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        what_to_look_for = EXCLUDED.what_to_look_for,
        show_what_to_look_for = EXCLUDED.show_what_to_look_for;


    -- ========================================================================
    -- FOOD & SUPPLEMENTS
    -- ========================================================================

    INSERT INTO product_items (category_id, name, slug, description, what_to_look_for, show_what_to_look_for) VALUES

    (cat_food,
     'Turtle Pellets',
     'turtle-pellets',
     'High-quality commercial turtle pellets serve as a convenient dietary staple, providing a balanced baseline of protein, vitamins, and minerals. Pellets should supplement — not replace — a varied diet of fresh protein and vegetables. A good pellet covers nutritional gaps that can be hard to fill with whole foods alone.',
     '["Named whole protein (fish, shrimp) as the first ingredient, not fillers or grain",
       "Formulated specifically for aquatic turtles — not land tortoises or general reptiles",
       "Age-appropriate: juvenile pellets are higher in protein, adult formulas shift toward plant-based nutrition",
       "Floating pellets are easier for aquatic turtles to find and eat at the surface",
       "Trusted brands include Mazuri, Zoo Med, and Omega One",
       "A portion of pellets should be roughly the size of your turtle''s head"]',
     true),

    (cat_food,
     'Dried Shrimp / Krill',
     'dried-shrimp-krill',
     'Freeze-dried or sun-dried shrimp and krill are a protein-rich treat and supplement that most turtles love. They can be used as part of the protein portion of the diet or as a training treat for hand-feeding. While convenient, they should not be the sole protein source — variety is critical for balanced nutrition.',
     '["Freeze-dried retains more nutritional value than sun-dried",
       "Whole shrimp or krill with shell included provides natural calcium and fiber",
       "Use as a treat or supplement, not a primary protein source",
       "Soak in tank water briefly before feeding to aid digestion and reduce air swallowing",
       "Store in a cool, dry place — dried foods can spoil or lose nutritional value if stored improperly"]',
     true),

    (cat_food,
     'Calcium Supplement',
     'calcium-supplement',
     'A calcium source — most commonly a cuttlebone — placed directly in the enclosure for your turtle to gnaw on as needed. Since aquatic turtles eat in water, dusting food with calcium powder is impractical. A cuttlebone provides a constant, self-regulated source of calcium that also helps keep the beak naturally trimmed.',
     '["Cuttlebone is the most popular and effective option for aquatic turtles",
       "Remove the hard plastic backing before placing in the tank",
       "Replace every 1–2 months as it dissolves and breaks down",
       "Calcium blocks designed for reptiles are another option",
       "For land feeding or commercial diets, a phosphorus-free calcium dust can be used 2–3x per week",
       "Essential for preventing Metabolic Bone Disease (MBD) and maintaining strong shell growth"]',
     true)

    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        what_to_look_for = EXCLUDED.what_to_look_for,
        show_what_to_look_for = EXCLUDED.show_what_to_look_for;

END $$;
