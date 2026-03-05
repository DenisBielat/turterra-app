import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db/supabaseClient';
import { CareGuideHero } from '@/components/care-guide/care-guide-hero';
import { CareGuideAtAGlance } from '@/components/care-guide/care-guide-at-a-glance';
import { CareGuideHousing } from '@/components/care-guide/care-guide-housing';
import { CareGuideLighting } from '@/components/care-guide/care-guide-lighting';
import { CareGuideTemperature } from '@/components/care-guide/care-guide-temperature';
import { CareGuideWater } from '@/components/care-guide/care-guide-water';
import { CareGuideDiet } from '@/components/care-guide/care-guide-diet';
import { CareGuideHandling } from '@/components/care-guide/care-guide-handling';
import { CareGuideHealth } from '@/components/care-guide/care-guide-health';
import { CareGuideProducts } from '@/components/care-guide/care-guide-products';
import type { SetupType, ProductCategory, ProductItem } from '@/components/care-guide/care-guide-products';
import { CareGuideReferences } from '@/components/care-guide/care-guide-references';
import type { CareGuideReference } from '@/components/care-guide/care-guide-references';
import { CareGuideSection } from '@/components/care-guide/care-guide-section';
import { CareGuideSidebar } from '@/components/care-guide/care-guide-sidebar';
import { CareGuideActiveSectionProvider } from '@/components/care-guide/care-guide-active-section-context';
import type { NavSection } from '@/components/care-guide/care-guide-section-nav';
import type { IconNameMap } from '@/types/icons';

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

/* ------------------------------------------------------------------
   Data helpers
   ------------------------------------------------------------------ */

interface CareGuideRow {
  [key: string]: unknown;
  id: string;
  species_id: number;
  slug: string;
  banner_image_url: string | null;
  status: string;
  adult_size_min_inches: number | null;
  adult_size_max_inches: number | null;
  lifespan_min_years: number | null;
  lifespan_max_years: number | null;
  /* Fields that may or may not exist — accessed via optional helpers */
}

function str(row: CareGuideRow, key: string): string | null {
  const v = row[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function num(row: CareGuideRow, key: string): number | null {
  const v = row[key];
  return typeof v === 'number' ? v : null;
}

function formatRange(min: number | null, max: number | null, unit: string): string | null {
  if (min != null && max != null) return `${min}-${max} ${unit}`;
  if (max != null) return `Up to ${max} ${unit}`;
  if (min != null) return `${min}+ ${unit}`;
  return null;
}

async function getCareGuide(slug: string) {
  // 1. Fetch the care guide
  const { data: guide, error } = await supabase
    .schema('care_guides')
    .from('care_guides')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !guide) return null;

  const row = guide as CareGuideRow;

  // 2. Fetch species info (include slug for Species Guide link)
  const { data: species } = await supabase
    .from('turtle_species')
    .select('id, slug, species_common_name, species_scientific_name, avatar_image_full_url, avatar_image_circle_url, tax_parent_genus')
    .eq('id', row.species_id)
    .single();

  // 3. Resolve genus → family for category
  let familyCommon: string | null = null;
  if (species?.tax_parent_genus) {
    const { data: genusData } = await supabase
      .from('turtle_taxonomy_genuses')
      .select(`
        id,
        turtle_taxonomy_families!turtle_taxonomy_genuses_tax_parent_family_fkey(
          family_common_name
        )
      `)
      .eq('id', species.tax_parent_genus)
      .single();

    if (genusData) {
      const familyData = genusData.turtle_taxonomy_families as unknown;
      const family = Array.isArray(familyData) ? familyData[0] : familyData;
      if (family && typeof family === 'object' && 'family_common_name' in family) {
        familyCommon = (family as { family_common_name: string | null }).family_common_name;
      }
    }
  }

  // 4. Fetch related guides (same family, different species)
  const { data: allGuides } = await supabase
    .schema('care_guides')
    .from('care_guides')
    .select('slug, species_id')
    .eq('status', 'published')
    .neq('slug', slug)
    .limit(4);

  const relatedSpeciesIds = (allGuides || []).map(g => g.species_id);
  const { data: relatedSpecies } = relatedSpeciesIds.length > 0
    ? await supabase
        .from('turtle_species')
        .select('id, species_common_name')
        .in('id', relatedSpeciesIds)
    : { data: [] };

  const relatedSpeciesMap = new Map(
    (relatedSpecies || []).map(s => [s.id, s.species_common_name])
  );

  const relatedGuides = (allGuides || [])
    .map(g => ({
      slug: g.slug,
      commonName: relatedSpeciesMap.get(g.species_id) || 'Unknown',
    }))
    .filter(g => g.commonName !== 'Unknown');

  // 5. Build stat cards — always 8 cards matching the schema
  const stats: { icon: IconNameMap['line']; label: string; value: string; description?: string | null }[] = [
    {
      icon: 'ruler',
      label: 'Adult Size',
      value: formatRange(row.adult_size_min_inches, row.adult_size_max_inches, '"')?.replace(' "', '"') ?? '—',
      description: str(row, 'adult_size_notes'),
    },
    {
      icon: 'clock',
      label: 'Lifespan',
      value: formatRange(row.lifespan_min_years, row.lifespan_max_years, 'years') ?? '—',
      description: str(row, 'lifespan_notes'),
    },
    {
      icon: 'enclosure',
      label: 'Enclosure',
      value: num(row, 'enclosure_min_gallons') != null ? `${num(row, 'enclosure_min_gallons')}+ gallons` : '—',
      description: str(row, 'enclosure_notes'),
    },
    {
      icon: 'temperature',
      label: 'Basking Temp',
      value: formatRange(num(row, 'basking_temp_min_f'), num(row, 'basking_temp_max_f'), '°F')?.replace(' °F', '°F') ?? '—',
    },
    {
      icon: 'water',
      label: 'Water Temp',
      value: formatRange(num(row, 'water_temp_min_f'), num(row, 'water_temp_max_f'), '°F')?.replace(' °F', '°F') ?? '—',
      description: str(row, 'water_temp_notes'),
    },
    {
      icon: 'lighting',
      label: 'UVB',
      value: (num(row, 'uvb_index_min') != null && num(row, 'uvb_index_max') != null)
        ? `UVI ${num(row, 'uvb_index_min')}-${num(row, 'uvb_index_max')}`
        : '—',
      description: str(row, 'uvb_type'),
    },
    {
      icon: 'diet',
      label: 'Diet Type',
      value: str(row, 'diet_type') ?? '—',
      description: str(row, 'diet_notes'),
    },
    {
      icon: 'category',
      label: 'Experience',
      value: str(row, 'difficulty') ?? '—',
    },
  ];

  // 6. Fetch housing data
  const { data: housingRow } = await supabase
    .schema('care_guides')
    .from('care_guide_housing')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const { data: enclosureSizesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_enclosure_sizes')
    .select('*')
    .eq('care_guide_id', row.id)
    .order('sort_order', { ascending: true });

  const housingData = {
    introText: housingRow ? (housingRow.intro_text as string | null) : null,
    essentials: Array.isArray(housingRow?.essentials) ? housingRow.essentials as string[] : [],
    commonMistakes: Array.isArray(housingRow?.common_mistakes) ? housingRow.common_mistakes as string[] : [],
    cohabitationNotes: housingRow ? (housingRow.cohabitation_notes as string | null) : null,
    enclosureSizes: (enclosureSizesRaw || []).map(s => ({
      life_stage: s.life_stage as string,
      size_range: s.size_range as string | null,
      min_gallons: s.min_gallons as number,
      max_gallons: s.max_gallons as number | null,
      notes: s.notes as string | null,
    })),
  };

  // 7. Fetch lighting data
  const { data: lightingRow } = await supabase
    .schema('care_guides')
    .from('care_guide_lighting')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const lightingData = {
    introText: lightingRow ? (lightingRow.intro_text as string | null) : null,
    uvbBulbType: lightingRow ? (lightingRow.uvb_bulb_type as string | null) : null,
    uvbTargetUviMin: lightingRow?.uvb_target_uvi_min != null ? Number(lightingRow.uvb_target_uvi_min) : null,
    uvbTargetUviMax: lightingRow?.uvb_target_uvi_max != null ? Number(lightingRow.uvb_target_uvi_max) : null,
    uvbTargetNotes: lightingRow ? (lightingRow.uvb_target_notes as string | null) : null,
    uvbDistance: lightingRow ? (lightingRow.uvb_distance as string | null) : null,
    uvbReplacement: lightingRow ? (lightingRow.uvb_replacement as string | null) : null,
    daylightType: lightingRow ? (lightingRow.daylight_type as string | null) : null,
    daylightCoverage: lightingRow ? (lightingRow.daylight_coverage as string | null) : null,
    daylightPurpose: lightingRow ? (lightingRow.daylight_purpose as string | null) : null,
    daylightNote: lightingRow ? (lightingRow.daylight_note as string | null) : null,
    summerLightHours: lightingRow?.summer_light_hours != null ? Number(lightingRow.summer_light_hours) : null,
    winterLightHours: lightingRow?.winter_light_hours != null ? Number(lightingRow.winter_light_hours) : null,
    outdoorHousingNote: lightingRow ? (lightingRow.outdoor_housing_note as string | null) : null,
  };

  // 8. Fetch temperature data
  const { data: temperatureRow } = await supabase
    .schema('care_guides')
    .from('care_guide_temperature')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const { data: tempZonesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_temp_zones')
    .select('*')
    .eq('care_guide_id', row.id)
    .order('sort_order', { ascending: true });

  const temperatureData = {
    introText: temperatureRow ? (temperatureRow.intro_text as string | null) : null,
    tempZones: (tempZonesRaw || []).map(z => ({
      zone_name: z.zone_name as string,
      temp_min_f: z.temp_min_f as number,
      temp_max_f: z.temp_max_f as number,
      temp_min_c: z.temp_min_c as number | null,
      temp_max_c: z.temp_max_c as number | null,
      notes: z.notes as string | null,
    })),
    heatLampTips: Array.isArray(temperatureRow?.heat_lamp_tips) ? temperatureRow.heat_lamp_tips as string[] : [],
    waterHeaterTips: Array.isArray(temperatureRow?.water_heater_tips) ? temperatureRow.water_heater_tips as string[] : [],
    thermometerTips: Array.isArray(temperatureRow?.thermometer_tips) ? temperatureRow.thermometer_tips as string[] : [],
    safetyWarning: temperatureRow ? (temperatureRow.safety_warning as string | null) : null,
  };

  // 9. Fetch water quality data
  const { data: waterRow } = await supabase
    .schema('care_guides')
    .from('care_guide_water')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const { data: waterSchedulesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_water_schedules')
    .select('*')
    .eq('care_guide_id', row.id)
    .order('sort_order', { ascending: true });

  const waterData = {
    introText: waterRow ? (waterRow.intro_text as string | null) : null,
    filtrationText: waterRow ? (waterRow.filtration_text as string | null) : null,
    filtrationExample: waterRow ? (waterRow.filtration_example as string | null) : null,
    filtrationTips: Array.isArray(waterRow?.filtration_tips) ? waterRow.filtration_tips as string[] : [],
    waterChangesText: waterRow ? (waterRow.water_changes_text as string | null) : null,
    waterSchedules: (waterSchedulesRaw || []).map(s => ({
      tank_size: s.tank_size as string,
      frequency: s.frequency as string,
    })),
    feedingTip: waterRow ? (waterRow.feeding_tip as string | null) : null,
    conditionerTip: waterRow ? (waterRow.conditioner_tip as string | null) : null,
  };

  // 10. Fetch diet data
  const { data: dietRow } = await supabase
    .schema('care_guides')
    .from('care_guide_diet')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const { data: feedingSchedulesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_feeding_schedules')
    .select('*')
    .eq('care_guide_id', row.id)
    .order('sort_order', { ascending: true });

  const { data: guideFoodsRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_foods')
    .select('notes, sort_order, foods(name, category)')
    .eq('care_guide_id', row.id);

  type GuideFoodRow = { notes?: string | null; sort_order?: number; foods?: { name: string; category: string } | { name: string; category: string }[] | null };
  const rawRows = (guideFoodsRaw || []) as GuideFoodRow[];
  const guideFoods = rawRows.map((r) => {
    const food = Array.isArray(r.foods) ? r.foods[0] : r.foods;
    return { notes: r.notes ?? null, food };
  }).filter((r): r is { notes: string | null; food: { name: string; category: string } } => r.food != null);

  const proteinFoods = guideFoods
    .filter((r) => r.food.category === 'protein')
    .map((r) => (r.notes ? `${r.food.name} (${r.notes})` : r.food.name))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const vegetableFoods = guideFoods
    .filter((r) => r.food.category === 'vegetable')
    .map((r) => (r.notes ? `${r.food.name} (${r.notes})` : r.food.name))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const dietData = {
    introText: dietRow ? (dietRow.intro_text as string | null) : null,
    subtitleText: dietRow ? (dietRow.subtitle_text as string | null) : null,
    feedingSchedules: (feedingSchedulesRaw || []).map(s => ({
      life_stage: s.life_stage as string,
      protein_pct: s.protein_pct as number | null,
      vegetable_pct: s.vegetable_pct as number | null,
      protein_frequency: s.protein_frequency as string | null,
      vegetable_frequency: s.vegetable_frequency as string | null,
    })),
    portionProtein: dietRow ? (dietRow.portion_protein as string | null) : null,
    portionVegetables: dietRow ? (dietRow.portion_vegetables as string | null) : null,
    portionPellets: dietRow ? (dietRow.portion_pellets as string | null) : null,
    proteinFoods,
    vegetableFoods,
    calciumSupplements: dietRow ? (dietRow.calcium_supplements as string | null) : null,
  };

  // 11. Fetch handling data
  const { data: handlingRow } = await supabase
    .schema('care_guides')
    .from('care_guide_handling')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const handlingData = {
    introText: handlingRow ? (handlingRow.intro_text as string | null) : null,
    dos: Array.isArray(handlingRow?.dos) ? handlingRow.dos as string[] : [],
    donts: Array.isArray(handlingRow?.donts) ? handlingRow.donts as string[] : [],
    salmonellaWarning: handlingRow ? (handlingRow.salmonella_warning as string | null) : null,
  };

  // 12. Fetch health data
  const { data: healthRow } = await supabase
    .schema('care_guides')
    .from('care_guide_health')
    .select('*')
    .eq('care_guide_id', row.id)
    .single();

  const { data: healthIssuesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_health_issues')
    .select('notes, health_issues(name, severity, common_cause, signs)')
    .eq('care_guide_id', row.id);

  type HealthIssueRow = {
    notes?: string | null;
    health_issues?: { name: string; severity: string; common_cause?: string | null; signs?: string | null } | { name: string; severity: string; common_cause?: string | null; signs?: string | null }[] | null;
  };
  const severityOrder: Record<string, number> = { urgent: 0, moderate: 1, monitor: 2 };
  const healthIssueRows = (healthIssuesRaw || []) as HealthIssueRow[];
  const healthIssues = healthIssueRows
    .map((r) => {
      const issue = Array.isArray(r.health_issues) ? r.health_issues[0] : r.health_issues;
      return issue
        ? {
            name: issue.name,
            severity: issue.severity as 'monitor' | 'moderate' | 'urgent',
            common_cause: issue.common_cause ?? null,
            signs: issue.signs ?? null,
          }
        : null;
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  const healthData = {
    introText: healthRow ? (healthRow.intro_text as string | null) : null,
    subtitleText: healthRow ? (healthRow.subtitle_text as string | null ?? null) : null,
    healthIssues,
    whenToSeeVet: healthRow ? (healthRow.when_to_see_vet as string | null) : null,
    preventiveCare: Array.isArray(healthRow?.preventive_care) ? healthRow.preventive_care as string[] : [],
  };

  // 13. Fetch recommended products
  const { data: setupTypesRaw } = await supabase
    .schema('care_guides')
    .from('setup_types')
    .select('*')
    .order('sort_order', { ascending: true });

  const setupTypes: SetupType[] = (setupTypesRaw || []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
    slug: s.slug as string,
    isActive: s.is_active as boolean,
  }));

  // Fetch care_guide_product_items with nested product_items → product_categories
  const { data: guideProductItemsRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_product_items')
    .select(`
      id,
      setup_type_id,
      priority,
      has_diy,
      notes,
      sort_order,
      product_items(
        id,
        name,
        product_categories(
          id,
          name,
          slug,
          icon,
          sort_order
        )
      )
    `)
    .eq('care_guide_id', row.id)
    .order('sort_order', { ascending: true });

  // Fetch category notes for this guide
  const { data: categoryNotesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_category_notes')
    .select('category_id, notes')
    .eq('care_guide_id', row.id);

  const categoryNotesMap = new Map(
    (categoryNotesRaw || []).map((n) => [n.category_id as string, n.notes as string])
  );

  // Build categoriesBySetup: Record<setupTypeId, ProductCategory[]>
  type GuideProductItemRow = {
    id: string;
    setup_type_id: string;
    priority: string;
    has_diy: boolean;
    notes: string | null;
    sort_order: number;
    product_items?: {
      id: string;
      name: string;
      product_categories?: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        sort_order: number;
      } | {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        sort_order: number;
      }[] | null;
    } | {
      id: string;
      name: string;
      product_categories?: unknown;
    }[] | null;
  };

  const categoriesBySetup: Record<string, ProductCategory[]> = {};
  const guideItems = (guideProductItemsRaw || []) as GuideProductItemRow[];

  for (const gpi of guideItems) {
    const setupId = gpi.setup_type_id;
    const productItem = Array.isArray(gpi.product_items) ? gpi.product_items[0] : gpi.product_items;
    if (!productItem) continue;

    const catRaw = Array.isArray((productItem as { product_categories?: unknown }).product_categories)
      ? ((productItem as { product_categories: { id: string; name: string; slug: string; icon: string | null; sort_order: number }[] }).product_categories)[0]
      : (productItem as { product_categories?: { id: string; name: string; slug: string; icon: string | null; sort_order: number } | null }).product_categories;
    if (!catRaw) continue;

    if (!categoriesBySetup[setupId]) categoriesBySetup[setupId] = [];

    const item: ProductItem = {
      id: gpi.id,
      name: productItem.name,
      priority: gpi.priority as ProductItem['priority'],
      hasDiy: gpi.has_diy,
      notes: gpi.notes,
    };

    // Find or create category in the list for this setup type
    let category = categoriesBySetup[setupId].find((c) => c.id === catRaw.id);
    if (!category) {
      category = {
        id: catRaw.id,
        name: catRaw.name,
        slug: catRaw.slug,
        icon: catRaw.icon,
        items: [],
        categoryNote: categoryNotesMap.get(catRaw.id) ?? null,
      };
      categoriesBySetup[setupId].push(category);
    }
    category.items.push(item);
  }

  // Sort categories by their sort_order (from the original category data)
  const categoryOrderMap = new Map<string, number>();
  for (const gpi of guideItems) {
    const productItem = Array.isArray(gpi.product_items) ? gpi.product_items[0] : gpi.product_items;
    if (!productItem) continue;
    const catRaw = Array.isArray((productItem as { product_categories?: unknown }).product_categories)
      ? ((productItem as { product_categories: { id: string; sort_order: number }[] }).product_categories)[0]
      : (productItem as { product_categories?: { id: string; sort_order: number } | null }).product_categories;
    if (catRaw) categoryOrderMap.set(catRaw.id, catRaw.sort_order);
  }
  for (const setupId of Object.keys(categoriesBySetup)) {
    categoriesBySetup[setupId].sort(
      (a, b) => (categoryOrderMap.get(a.id) ?? 0) - (categoryOrderMap.get(b.id) ?? 0)
    );
  }

  // 14. Fetch references
  const { data: referencesRaw } = await supabase
    .schema('care_guides')
    .from('care_guide_references')
    .select('*')
    .eq('care_guide_id', row.id)
    .order('sort_order', { ascending: true });

  const references: CareGuideReference[] = (referencesRaw || []).map((r) => ({
    id: r.id as number,
    referenceType: r.reference_type as string | null,
    citationFull: r.citation_full as string | null,
    citationShort: r.citation_short as string | null,
    authors: r.authors as string | null,
    year: r.year as string | null,
    title: r.title as string | null,
    sourceName: r.source_name as string | null,
    url: r.url as string | null,
    doi: r.doi as string | null,
    accessDate: r.access_date as string | null,
    notes: r.notes as string | null,
  }));

  // 14. Build section content (all major sections now handled separately above)
  const sectionContent: Record<string, string | null> = {};

  return {
    commonName: species?.species_common_name ?? 'Unknown Species',
    scientificName: species?.species_scientific_name ?? '',
    speciesSlug: species?.slug ?? null,
    avatarImageUrl: species?.avatar_image_full_url || species?.avatar_image_circle_url || row.banner_image_url || PLACEHOLDER_IMAGE,
    avatarCircleUrl: species?.avatar_image_circle_url || species?.avatar_image_full_url || PLACEHOLDER_IMAGE,
    category: familyCommon,
    heroText: str(row, 'hero_text'),
    atAGlanceText: str(row, 'at_a_glance_section_text'),
    stats,
    commitWarning: str(row, 'before_you_commit') ?? str(row, 'commit_warning'),
    housingData,
    lightingData,
    temperatureData,
    waterData,
    dietData,
    handlingData,
    healthData,
    setupTypes,
    categoriesBySetup,
    references,
    sectionContent,
    relatedGuides,
  };
}

/* ------------------------------------------------------------------
   Metadata
   ------------------------------------------------------------------ */

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const guide = await getCareGuide(params.slug);
  if (!guide) return { title: 'Care Guide Not Found | Turterra' };

  return {
    title: `${guide.commonName} Care Guide | Turterra`,
    description: guide.heroText
      ? guide.heroText.slice(0, 160)
      : `Complete care guide for ${guide.commonName}. Housing, diet, temperature, and health tips.`,
  };
}

/* ------------------------------------------------------------------
   Section definitions
   ------------------------------------------------------------------ */

const SECTIONS: NavSection[] = [
  { id: 'at-a-glance', label: 'At a Glance', icon: 'at-a-glance' },
  { id: 'housing', label: 'Housing & Enclosure', icon: 'enclosure' },
  { id: 'lighting', label: 'Lighting & UVB', icon: 'lighting' },
  { id: 'temperature', label: 'Temps & Heating', icon: 'temperature' },
  { id: 'water', label: 'Water Quality', icon: 'water' },
  { id: 'diet', label: 'Diet & Nutrition', icon: 'diet' },
  { id: 'handling', label: 'Handling', icon: 'handling' },
  { id: 'health', label: 'Health & Issues', icon: 'health' },
  { id: 'shopping-checklist', label: 'Product Guide', icon: 'shop' },
  { id: 'references', label: 'References', icon: 'book-open' },
];

const SECTION_TITLES: Record<string, string> = {};

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */

export default async function CareGuidePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const guide = await getCareGuide(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-warm">
      {/* Hero */}
      <CareGuideHero
        commonName={guide.commonName}
        scientificName={guide.scientificName}
        category={guide.category}
        imageUrl={guide.avatarImageUrl}
        introText={guide.heroText}
        speciesSlug={guide.speciesSlug}
      />

      {/* Main content area */}
      <div className="max-w-8xl mx-auto px-4 lg:px-10 py-10 md:py-14">
        <CareGuideActiveSectionProvider sections={SECTIONS}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main content — 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-12 md:gap-16">
            {/* At a Glance */}
            <CareGuideAtAGlance
              introText={guide.atAGlanceText}
              stats={guide.stats}
              commitWarning={guide.commitWarning}
            />

            {/* Housing & Enclosure */}
            <CareGuideHousing
              introText={guide.housingData.introText}
              essentials={guide.housingData.essentials}
              commonMistakes={guide.housingData.commonMistakes}
              cohabitationNotes={guide.housingData.cohabitationNotes}
              enclosureSizes={guide.housingData.enclosureSizes}
            />

            {/* Lighting & UVB */}
            <CareGuideLighting
              introText={guide.lightingData.introText}
              uvbBulbType={guide.lightingData.uvbBulbType}
              uvbTargetUviMin={guide.lightingData.uvbTargetUviMin}
              uvbTargetUviMax={guide.lightingData.uvbTargetUviMax}
              uvbTargetNotes={guide.lightingData.uvbTargetNotes}
              uvbDistance={guide.lightingData.uvbDistance}
              uvbReplacement={guide.lightingData.uvbReplacement}
              daylightType={guide.lightingData.daylightType}
              daylightCoverage={guide.lightingData.daylightCoverage}
              daylightPurpose={guide.lightingData.daylightPurpose}
              daylightNote={guide.lightingData.daylightNote}
              summerLightHours={guide.lightingData.summerLightHours}
              winterLightHours={guide.lightingData.winterLightHours}
              outdoorHousingNote={guide.lightingData.outdoorHousingNote}
            />

            {/* Temperature & Heating */}
            <CareGuideTemperature
              introText={guide.temperatureData.introText}
              tempZones={guide.temperatureData.tempZones}
              heatLampTips={guide.temperatureData.heatLampTips}
              waterHeaterTips={guide.temperatureData.waterHeaterTips}
              thermometerTips={guide.temperatureData.thermometerTips}
              safetyWarning={guide.temperatureData.safetyWarning}
            />

            {/* Water Quality & Maintenance */}
            <CareGuideWater
              introText={guide.waterData.introText}
              filtrationText={guide.waterData.filtrationText}
              filtrationExample={guide.waterData.filtrationExample}
              filtrationTips={guide.waterData.filtrationTips}
              waterChangesText={guide.waterData.waterChangesText}
              waterSchedules={guide.waterData.waterSchedules}
              feedingTip={guide.waterData.feedingTip}
              conditionerTip={guide.waterData.conditionerTip}
            />

            {/* Diet & Nutrition */}
            <CareGuideDiet
              introText={guide.dietData.introText}
              subtitleText={guide.dietData.subtitleText}
              feedingSchedules={guide.dietData.feedingSchedules}
              portionProtein={guide.dietData.portionProtein}
              portionVegetables={guide.dietData.portionVegetables}
              portionPellets={guide.dietData.portionPellets}
              proteinFoods={guide.dietData.proteinFoods}
              vegetableFoods={guide.dietData.vegetableFoods}
              calciumSupplements={guide.dietData.calciumSupplements}
            />

            {/* Handling & Interaction */}
            <CareGuideHandling
              introText={guide.handlingData.introText}
              dos={guide.handlingData.dos}
              donts={guide.handlingData.donts}
              salmonellaWarning={guide.handlingData.salmonellaWarning}
            />

            {/* Health & Common Issues */}
            <CareGuideHealth
              introText={guide.healthData.introText}
              subtitleText={guide.healthData.subtitleText}
              healthIssues={guide.healthData.healthIssues}
              whenToSeeVet={guide.healthData.whenToSeeVet}
              preventiveCare={guide.healthData.preventiveCare}
            />

            {/* Recommended Products / Shopping Checklist */}
            <CareGuideProducts
              setupTypes={guide.setupTypes}
              categoriesBySetup={guide.categoriesBySetup}
            />

            {/* References */}
            <CareGuideReferences references={guide.references} />

            {/* Remaining content sections */}
            {Object.entries(guide.sectionContent).map(([key, content]) => (
              <CareGuideSection
                key={key}
                id={key}
                title={SECTION_TITLES[key] ?? key}
                content={content}
              />
            ))}
          </div>

          {/* Sidebar — 4 cols */}
          <div className="lg:col-span-4">
            <CareGuideSidebar
              sections={SECTIONS}
              relatedGuides={guide.relatedGuides}
              commonName={guide.commonName}
              imageUrl={guide.avatarCircleUrl}
              speciesSlug={guide.speciesSlug}
            />
          </div>
        </div>
        </CareGuideActiveSectionProvider>
      </div>
    </div>
  );
}
