import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db/supabaseClient';
import { CareGuideHero } from '@/components/care-guide/care-guide-hero';
import { CareGuideSectionNav, type NavSection } from '@/components/care-guide/care-guide-section-nav';
import { CareGuideAtAGlance } from '@/components/care-guide/care-guide-at-a-glance';
import { CareGuideSection } from '@/components/care-guide/care-guide-section';
import { CareGuideSidebar } from '@/components/care-guide/care-guide-sidebar';
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

  // 2. Fetch species info
  const { data: species } = await supabase
    .from('turtle_species')
    .select('id, species_common_name, species_scientific_name, avatar_image_full_url, avatar_image_circle_url, tax_parent_genus')
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

  // 5. Build stat cards from available data
  const stats: { icon: IconNameMap['line']; label: string; value: string; description?: string | null }[] = [];

  const sizeRange = formatRange(row.adult_size_min_inches, row.adult_size_max_inches, '"');
  if (sizeRange) {
    stats.push({
      icon: 'ruler',
      label: 'Adult Size',
      value: sizeRange.replace(' "', '"'),
      description: str(row, 'adult_size_description'),
    });
  }

  const lifespanRange = formatRange(row.lifespan_min_years, row.lifespan_max_years, 'years');
  if (lifespanRange) {
    stats.push({
      icon: 'clock',
      label: 'Lifespan',
      value: lifespanRange,
      description: str(row, 'lifespan_description') ?? 'With proper care',
    });
  }

  const enclosure = str(row, 'enclosure_size');
  if (enclosure) {
    stats.push({
      icon: 'scale',
      label: 'Enclosure',
      value: enclosure,
      description: str(row, 'enclosure_description'),
    });
  }

  const baskingTemp = str(row, 'basking_temp');
  if (baskingTemp) {
    stats.push({
      icon: 'split',
      label: 'Basking Temp',
      value: baskingTemp,
      description: str(row, 'basking_temp_description'),
    });
  }

  const waterTemp = str(row, 'water_temp');
  if (waterTemp) {
    stats.push({
      icon: 'water-droplet',
      label: 'Water Temp',
      value: waterTemp,
      description: str(row, 'water_temp_description'),
    });
  }

  const uvb = str(row, 'uvb_requirements');
  if (uvb) {
    stats.push({
      icon: 'split-2',
      label: 'UVB Required',
      value: uvb,
      description: str(row, 'uvb_description'),
    });
  }

  const dietType = str(row, 'diet_type');
  if (dietType) {
    stats.push({
      icon: 'tree',
      label: 'Diet Type',
      value: dietType,
      description: str(row, 'diet_description'),
    });
  }

  const experience = str(row, 'experience_level') ?? str(row, 'difficulty');
  if (experience) {
    stats.push({
      icon: 'category',
      label: 'Experience',
      value: experience,
      description: str(row, 'experience_description'),
    });
  }

  // 6. Build section content
  const sectionContent = {
    housing: str(row, 'housing_content'),
    lighting: str(row, 'lighting_content'),
    temperature: str(row, 'temperature_content'),
    water: str(row, 'water_content'),
    diet: str(row, 'diet_content'),
    handling: str(row, 'handling_content'),
    health: str(row, 'health_content'),
  };

  return {
    commonName: species?.species_common_name ?? 'Unknown Species',
    scientificName: species?.species_scientific_name ?? '',
    bannerImageUrl: row.banner_image_url || species?.avatar_image_full_url || PLACEHOLDER_IMAGE,
    category: familyCommon,
    difficulty: str(row, 'difficulty') ?? str(row, 'experience_level'),
    lifespan: lifespanRange,
    introText: str(row, 'intro_text') ?? str(row, 'description') ?? str(row, 'at_a_glance_text'),
    stats,
    commitWarning: str(row, 'before_you_commit') ?? str(row, 'commit_warning'),
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
    description: guide.introText
      ? guide.introText.slice(0, 160)
      : `Complete care guide for ${guide.commonName}. Housing, diet, temperature, and health tips.`,
  };
}

/* ------------------------------------------------------------------
   Section definitions
   ------------------------------------------------------------------ */

const SECTIONS: NavSection[] = [
  { id: 'at-a-glance', label: 'At a Glance', icon: 'turtle' },
  { id: 'housing', label: 'Housing', icon: 'outdoors-tree-valley' },
  { id: 'lighting', label: 'Lighting & UVB', icon: 'split' },
  { id: 'temperature', label: 'Temperature', icon: 'scale' },
  { id: 'water', label: 'Water', icon: 'water-droplet' },
  { id: 'diet', label: 'Diet', icon: 'split-2' },
  { id: 'handling', label: 'Handling', icon: 'hand-shake-heart' },
  { id: 'health', label: 'Health', icon: 'information-circle' },
];

const SECTION_TITLES: Record<string, string> = {
  housing: 'Housing',
  lighting: 'Lighting & UVB',
  temperature: 'Temperature',
  water: 'Water',
  diet: 'Diet',
  handling: 'Handling',
  health: 'Health',
};

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
        bannerImageUrl={guide.bannerImageUrl}
        difficulty={guide.difficulty}
        lifespan={guide.lifespan}
      />

      {/* Section navigation */}
      <CareGuideSectionNav sections={SECTIONS} />

      {/* Main content area */}
      <div className="max-w-8xl mx-auto px-4 lg:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main content — 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-12 md:gap-16">
            {/* At a Glance */}
            <CareGuideAtAGlance
              introText={guide.introText}
              stats={guide.stats}
              commitWarning={guide.commitWarning}
            />

            {/* Remaining content sections */}
            {Object.entries(guide.sectionContent).map(([key, content]) => (
              <CareGuideSection
                key={key}
                id={key}
                title={SECTION_TITLES[key] ?? key}
                content={content}
              />
            ))}

            {/* Placeholder for sections without content */}
            {Object.values(guide.sectionContent).every(v => !v) && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">
                  Detailed care sections are coming soon for this species.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar — 4 cols */}
          <div className="lg:col-span-4">
            <CareGuideSidebar
              sections={SECTIONS}
              relatedGuides={guide.relatedGuides}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
