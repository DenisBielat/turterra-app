import { supabase } from "@/lib/db/supabaseClient";
import Image from "next/image";
import TurtleGuideClient from "@/components/turtle-guide/TurtleGuideClient";
import type { TurtleGuideSpecies, TurtleGuideFilters } from "@/app/api/turtle-guide/route";

async function getTurtleGuideData(): Promise<{
  turtles: TurtleGuideSpecies[];
  filters: TurtleGuideFilters;
}> {
  // Fetch all turtles with their related data
  const { data: turtles, error: turtlesError } = await supabase
    .from('turtle_species')
    .select(`
      id,
      species_common_name,
      species_scientific_name,
      slug,
      avatar_image_circle_url,
      avatar_image_full_url,
      tax_parent_genus,
      turtle_species_section_descriptions(
        at_a_glance
      ),
      turtle_species_conservation_history(
        year_status_assigned,
        out_of_date,
        conservation_statuses!turtle_species_conservation_conservation_status_fkey(
          status,
          abbreviation
        ),
        self_assigned_status:conservation_statuses!turtle_species_conservation_h_self_assigned_conservation_s_fkey(
          status,
          abbreviation
        )
      ),
      turtle_species_habitats(
        habitats(habitat)
      ),
      turtle_species_regions_general(
        regions_general(region_name)
      )
    `)
    .order('species_common_name', { ascending: true });

  if (turtlesError) {
    console.error('Error fetching turtles:', turtlesError);
    return { turtles: [], filters: { families: [], habitats: [], regions: [] } };
  }

  // Fetch genus -> family mappings
  const genusIds = [...new Set(turtles?.map(t => t.tax_parent_genus).filter(Boolean))];

  const { data: genusData } = await supabase
    .from('turtle_taxonomy_genuses')
    .select(`
      id,
      tax_parent_family,
      turtle_taxonomy_families!turtle_taxonomy_genuses_tax_parent_family_fkey(
        family_common_name,
        family_scientific_name
      )
    `)
    .in('id', genusIds);

  // Create genus to family mapping
  const genusToFamily = new Map<number, { common: string; scientific: string }>();
  genusData?.forEach(g => {
    // Supabase returns an array for the joined relation, but we expect a single object
    const familyData = g.turtle_taxonomy_families as unknown;
    const family = Array.isArray(familyData) ? familyData[0] : familyData;
    if (family && typeof family === 'object' && 'family_common_name' in family) {
      const typedFamily = family as { family_common_name: string | null; family_scientific_name: string | null };
      genusToFamily.set(g.id, {
        common: typedFamily.family_common_name || 'Unknown',
        scientific: typedFamily.family_scientific_name || 'Unknown'
      });
    }
  });

  // Fetch all families for filter
  const { data: familiesData } = await supabase
    .from('turtle_taxonomy_families')
    .select('family_common_name, family_scientific_name')
    .order('family_common_name', { ascending: true });

  // Fetch all habitats for filter
  const { data: habitatsData } = await supabase
    .from('habitats')
    .select('habitat')
    .order('habitat', { ascending: true });

  // Fetch all regions for filter
  const { data: regionsData } = await supabase
    .from('regions_general')
    .select('region_name')
    .order('region_name', { ascending: true });

  // Transform turtle data
  const transformedTurtles: TurtleGuideSpecies[] = (turtles || []).map(turtle => {
    // Get conservation status (most recent)
    const conservationHistoryRaw = turtle.turtle_species_conservation_history as unknown as Array<{
      year_status_assigned: string;
      out_of_date?: boolean | null;
      conservation_statuses: Array<{ status: string; abbreviation: string }> | { status: string; abbreviation: string } | null;
      self_assigned_status?: Array<{ status: string; abbreviation: string }> | { status: string; abbreviation: string } | null;
    }> | null;

    const latestConservation = conservationHistoryRaw
      ?.sort((a, b) => parseInt(b.year_status_assigned) - parseInt(a.year_status_assigned))[0];

    // Handle both array and object cases for conservation_statuses (Supabase can return either)
    const conservationStatusObj = latestConservation?.conservation_statuses
      ? (Array.isArray(latestConservation.conservation_statuses)
          ? latestConservation.conservation_statuses[0]
          : latestConservation.conservation_statuses)
      : null;

    const selfAssignedStatusObj = latestConservation?.self_assigned_status
      ? (Array.isArray(latestConservation.self_assigned_status)
          ? latestConservation.self_assigned_status[0]
          : latestConservation.self_assigned_status)
      : null;

    // If out_of_date is true and self_assigned_status exists, use that instead
    const isOutOfDate = latestConservation?.out_of_date === true;
    const effectiveStatus = isOutOfDate && selfAssignedStatusObj
      ? selfAssignedStatusObj
      : conservationStatusObj;

    const conservationStatusData = effectiveStatus;

    // Get family info
    const family = genusToFamily.get(turtle.tax_parent_genus);

    // Get habitats - handle nested array structure
    const habitatsRaw = turtle.turtle_species_habitats as unknown as Array<{ habitats: Array<{ habitat: string }> | { habitat: string } | null }> | null;
    const habitats = (habitatsRaw || [])
      .map(h => {
        if (!h.habitats) return null;
        const hab = Array.isArray(h.habitats) ? h.habitats[0] : h.habitats;
        return hab?.habitat;
      })
      .filter((h): h is string => !!h);

    // Get regions - handle nested array structure
    const regionsRaw = turtle.turtle_species_regions_general as unknown as Array<{ regions_general: Array<{ region_name: string | null }> | { region_name: string | null } | null }> | null;
    const regions = (regionsRaw || [])
      .map(r => {
        if (!r.regions_general) return null;
        const reg = Array.isArray(r.regions_general) ? r.regions_general[0] : r.regions_general;
        return reg?.region_name;
      })
      .filter((r): r is string => !!r);

    // Get at_a_glance description
    const sectionDescRaw = turtle.turtle_species_section_descriptions as unknown as Array<{ at_a_glance: string | null }> | null;
    const description = sectionDescRaw?.[0]?.at_a_glance || null;

    return {
      id: turtle.id,
      commonName: turtle.species_common_name,
      scientificName: turtle.species_scientific_name,
      slug: turtle.slug,
      avatarUrl: turtle.avatar_image_circle_url,
      // Use full image URL, fallback to circle avatar URL
      imageUrl: turtle.avatar_image_full_url || turtle.avatar_image_circle_url,
      familyCommon: family?.common || null,
      familyScientific: family?.scientific || null,
      description,
      conservationStatus: conservationStatusData ? {
        code: conservationStatusData.abbreviation,
        status: conservationStatusData.status
      } : null,
      habitats,
      regions
    };
  });

  // Build filter options
  const filters: TurtleGuideFilters = {
    families: (familiesData || [])
      .filter(f => f.family_common_name && f.family_scientific_name)
      .map(f => ({
        common: f.family_common_name!,
        scientific: f.family_scientific_name!
      })),
    habitats: (habitatsData || [])
      .map(h => h.habitat)
      .filter((h): h is string => !!h),
    regions: (regionsData || [])
      .map(r => r.region_name)
      .filter((r): r is string => !!r)
  };

  return { turtles: transformedTurtles, filters };
}

export default async function TurtleGuidePage() {
  const { turtles, filters } = await getTurtleGuideData();

  return (
    <main className="min-h-screen bg-green-950 overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-green-950 pt-12 md:pt-20 pb-8 md:pb-12 px-4 lg:px-10">
        <div className="max-w-8xl mx-auto text-center">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative h-12 md:h-20 lg:h-24 w-12 md:w-20 lg:w-24">
              <Image
                src="/images/nav-menu-icons/turtle-guide-light.png"
                alt="Turtle Guide Icon"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
            Guide to World Turtle Species
          </h1>
          <p className="text-gray-300 text-sm md:text-lg max-w-3xl mx-auto">
            Explore turtle species from around the world, learn about their lives and habitats,
            and how conservation efforts are helping protect these ancient creatures.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 lg:px-10 pb-16">
        <div className="max-w-8xl mx-auto">
          <TurtleGuideClient
            initialTurtles={turtles}
            filters={filters}
          />
        </div>
      </section>
    </main>
  );
}
