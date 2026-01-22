import { supabase } from '@/lib/db/supabaseClient';
import { NextResponse } from 'next/server';

export interface SpeciesSearchResult {
  id: number;
  commonName: string;
  scientificName: string;
  avatarUrl: string | null;
  conservationStatus: string | null;
}

export interface HabitatType {
  habitat_type: string;
}

interface ConservationStatus {
  abbreviation: string;
}

interface ConservationHistory {
  year_status_assigned: string;
  conservation_statuses: ConservationStatus[];
}

interface HabitatTypeRelation {
  habitat_types: HabitatType[];
}

interface SpeciesRow {
  id: number;
  species_common_name: string;
  species_scientific_name: string;
  avatar_image_circle_url: string | null;
  turtle_species_conservation_history: ConservationHistory[];
  turtle_species_habitat_types: HabitatTypeRelation[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const habitatType = searchParams.get('habitatType');
  const sort = searchParams.get('sort') || 'alphabetical';
  const excludeId = searchParams.get('excludeId'); // Exclude the primary species

  try {
    // Build the base query
    let speciesQuery = supabase
      .from('turtle_species')
      .select(`
        id,
        species_common_name,
        species_scientific_name,
        avatar_image_circle_url,
        turtle_species_conservation_history(
          year_status_assigned,
          conservation_statuses!turtle_species_conservation_conservation_status_fkey(
            abbreviation
          )
        ),
        turtle_species_habitat_types(
          habitat_types(
            habitat_type
          )
        )
      `);

    // Apply search filter if query provided
    if (query.trim()) {
      speciesQuery = speciesQuery.or(
        `species_common_name.ilike.%${query}%,species_scientific_name.ilike.%${query}%`
      );
    }

    // Exclude the primary species from results
    if (excludeId) {
      const excludeIdNum = parseInt(excludeId, 10);
      if (!Number.isNaN(excludeIdNum)) {
        speciesQuery = speciesQuery.neq('id', excludeIdNum);
      }
    }

    // Apply sorting
    if (sort === 'alphabetical') {
      speciesQuery = speciesQuery.order('species_common_name', { ascending: true });
    } else if (sort === 'scientific') {
      speciesQuery = speciesQuery.order('species_scientific_name', { ascending: true });
    }

    const { data: species, error } = await speciesQuery;

    if (error) throw error;

    // Transform and filter results
    let results = ((species || []) as SpeciesRow[]).map((s) => {
      // Get the most recent conservation status
      const conservationHistory = s.turtle_species_conservation_history || [];
      const sortedHistory = [...conservationHistory].sort(
        (a, b) => parseInt(b.year_status_assigned) - parseInt(a.year_status_assigned)
      );
      const latest = sortedHistory[0];
      const cs = latest?.conservation_statuses;
      const currentStatus = cs
        ? (Array.isArray(cs) ? cs[0]?.abbreviation : (cs as { abbreviation?: string }).abbreviation) ?? null
        : null;

      return {
        id: s.id,
        commonName: s.species_common_name,
        scientificName: s.species_scientific_name,
        avatarUrl: s.avatar_image_circle_url,
        conservationStatus: currentStatus,
        // Keep habitat types for filtering (will be removed from final response)
        _habitatTypes: (s.turtle_species_habitat_types || []).map((ht) => {
          const h = ht.habitat_types;
          return Array.isArray(h) ? h[0]?.habitat_type : (h as { habitat_type?: string })?.habitat_type;
        }).filter(Boolean) as string[]
      };
    });

    // Apply habitat type filter if provided (client-side filtering since Supabase
    // doesn't easily support filtering by nested many-to-many relationships)
    if (habitatType) {
      results = results.filter((r) => r._habitatTypes.includes(habitatType));
    }

    // Remove the temporary _habitatTypes field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleanResults = results.map(({ _habitatTypes: _, ...rest }) => rest) as SpeciesSearchResult[];

    // Also fetch available habitat types for the filter dropdown
    const { data: habitatTypes, error: habitatError } = await supabase
      .from('habitat_types')
      .select('habitat_type')
      .order('habitat_type', { ascending: true });

    if (habitatError) {
      console.error('Error fetching habitat types:', habitatError);
    }

    return NextResponse.json({
      species: cleanResults,
      habitatTypes: (habitatTypes || []).map((ht) => ht.habitat_type)
    });
  } catch (error) {
    console.error('Error searching species:', error);
    const message = error instanceof Error ? error.message : 'Failed to search species';
    return NextResponse.json({ error: 'Failed to search species', details: message }, { status: 500 });
  }
}
