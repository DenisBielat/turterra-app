import { Metadata } from 'next';
import { supabase } from '@/lib/db/supabaseClient';
import { LearnHeader } from '@/components/learn/learn-header';
import { BrowseGuides, type CareGuide } from '@/components/learn/browse-guides';

export const metadata: Metadata = {
  title: 'Learn | Turterra',
  description:
    'Turtle care guides, habitat tips, diet advice, and everything you need to know about keeping turtles happy and healthy.',
};

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

async function getCareGuides(): Promise<CareGuide[]> {
  // 1. Fetch published care guides from the care_guides schema
  const { data: guides, error: guidesError } = await supabase
    .schema('care_guides')
    .from('care_guides')
    .select('id, species_id, slug, banner_image_url, adult_size_min_inches, adult_size_max_inches, lifespan_min_years, lifespan_max_years')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (guidesError || !guides?.length) {
    if (guidesError) console.error('Error fetching care guides:', guidesError);
    return [];
  }

  // 2. Fetch matching turtle species for names + images + genus
  const speciesIds = guides.map(g => g.species_id);

  const { data: species } = await supabase
    .from('turtle_species')
    .select('id, species_common_name, species_scientific_name, avatar_image_full_url, avatar_image_circle_url, tax_parent_genus')
    .in('id', speciesIds);

  // 3. Resolve genus → family for the category eyebrow
  const genusIds = [...new Set((species || []).map(s => s.tax_parent_genus).filter(Boolean))];

  const { data: genusData } = await supabase
    .from('turtle_taxonomy_genuses')
    .select(`
      id,
      turtle_taxonomy_families!turtle_taxonomy_genuses_tax_parent_family_fkey(
        family_common_name
      )
    `)
    .in('id', genusIds);

  const genusToFamily = new Map<number, string>();
  genusData?.forEach(g => {
    const familyData = g.turtle_taxonomy_families as unknown;
    const family = Array.isArray(familyData) ? familyData[0] : familyData;
    if (family && typeof family === 'object' && 'family_common_name' in family) {
      genusToFamily.set(g.id, (family as { family_common_name: string | null }).family_common_name || 'Unknown');
    }
  });

  // 4. Build a lookup of species by id
  const speciesMap = new Map(
    (species || []).map(s => [s.id, s])
  );

  // 5. Transform into the shape the component expects
  return guides.map(guide => {
    const sp = speciesMap.get(guide.species_id);

    // Format size range
    let sizeRange: string | null = null;
    if (guide.adult_size_min_inches != null && guide.adult_size_max_inches != null) {
      sizeRange = `${guide.adult_size_min_inches}-${guide.adult_size_max_inches}"`;
    } else if (guide.adult_size_max_inches != null) {
      sizeRange = `Up to ${guide.adult_size_max_inches}"`;
    }

    // Format lifespan
    let lifespan: string | null = null;
    if (guide.lifespan_min_years != null && guide.lifespan_max_years != null) {
      lifespan = `${guide.lifespan_min_years}-${guide.lifespan_max_years} years`;
    } else if (guide.lifespan_max_years != null) {
      lifespan = `Up to ${guide.lifespan_max_years} years`;
    }

    const familyCommon = sp?.tax_parent_genus
      ? genusToFamily.get(sp.tax_parent_genus) ?? null
      : null;

    return {
      id: guide.id,
      slug: guide.slug,
      commonName: sp?.species_common_name ?? 'Unknown Species',
      scientificName: sp?.species_scientific_name ?? '',
      imageUrl: guide.banner_image_url || sp?.avatar_image_full_url || sp?.avatar_image_circle_url || PLACEHOLDER_IMAGE,
      category: familyCommon,
      sizeRange,
      lifespan,
    };
  });
}

/**
 * Learn Page
 *
 * Educational hub with care guides and general turtle-keeping resources.
 */
export default async function LearnPage() {
  const guides = await getCareGuides();

  return (
    <div className="min-h-screen bg-warm">
      {/* Full-width hero section */}
      <div className="w-full">
        <LearnHeader />
      </div>

      {/* Content area — max-w-8xl + px-10 matches navbar logo alignment */}
      <div className="max-w-8xl mx-auto px-4 lg:px-10 py-12">
        <BrowseGuides guides={guides} />
      </div>
    </div>
  );
}
