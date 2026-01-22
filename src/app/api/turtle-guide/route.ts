import { supabase } from '@/lib/db/supabaseClient';
import { NextResponse } from 'next/server';

export interface TurtleGuideSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  slug: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  familyCommon: string | null;
  familyScientific: string | null;
  description: string | null;
  conservationStatus: {
    code: string;
    status: string;
  } | null;
  habitats: string[];
  regions: string[];
}

export interface TurtleGuideFilters {
  families: Array<{ common: string; scientific: string }>;
  habitats: string[];
  regions: string[];
}

export interface TurtleGuideResponse {
  turtles: TurtleGuideSpecies[];
  filters: TurtleGuideFilters;
}

export async function GET() {
  console.log('=== TURTLE GUIDE API ROUTE CALLED ===');
  try {
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
      return NextResponse.json({ error: 'Failed to fetch turtles' }, { status: 500 });
    }

    // Fetch genus -> family mappings
    const genusIds = [...new Set(turtles?.map(t => t.tax_parent_genus).filter(Boolean))];

    const { data: genusData, error: genusError } = await supabase
      .from('taxonomy_genus')
      .select(`
        id,
        tax_parent_family,
        taxonomy_family!taxonomy_genus_tax_parent_family_fkey(
          family_common_name,
          family_scientific_name
        )
      `)
      .in('id', genusIds);

    if (genusError) {
      console.error('Error fetching genus data:', genusError);
    }

    // Create genus to family mapping
    const genusToFamily = new Map<number, { common: string; scientific: string }>();
    genusData?.forEach(g => {
      // Supabase returns an array for the joined relation, but we expect a single object
      const familyData = g.taxonomy_family as unknown;
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
      .from('taxonomy_family')
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

      // Handle self_assigned_status - check if it exists in the raw data first
      let selfAssignedStatusObj = null;
      if (latestConservation?.self_assigned_status) {
        if (Array.isArray(latestConservation.self_assigned_status)) {
          selfAssignedStatusObj = latestConservation.self_assigned_status[0];
        } else {
          selfAssignedStatusObj = latestConservation.self_assigned_status;
        }
      }

      // Debug logging for any turtle with self_assigned_status or out_of_date
      const hasSelfAssigned = !!selfAssignedStatusObj;
      const isOutOfDate = latestConservation?.out_of_date === true;
      
      if (hasSelfAssigned || isOutOfDate) {
        console.log(`\n=== DEBUG: ${turtle.species_common_name} ===`);
        console.log('out_of_date:', isOutOfDate);
        console.log('has self_assigned_status:', hasSelfAssigned);
        console.log('conservationStatusObj:', JSON.stringify(conservationStatusObj, null, 2));
        console.log('selfAssignedStatusObj:', JSON.stringify(selfAssignedStatusObj, null, 2));
        console.log('raw latestConservation:', JSON.stringify(latestConservation, null, 2));
      }

      // If out_of_date is true and self_assigned_status exists, use that instead
      const effectiveStatus = isOutOfDate && selfAssignedStatusObj
        ? selfAssignedStatusObj
        : conservationStatusObj;

      if (hasSelfAssigned || isOutOfDate) {
        console.log('effectiveStatus:', JSON.stringify(effectiveStatus, null, 2));
        console.log('=== END DEBUG ===\n');
      }

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

    return NextResponse.json({
      turtles: transformedTurtles,
      filters
    } as TurtleGuideResponse);
  } catch (error) {
    console.error('Error in turtle guide API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
