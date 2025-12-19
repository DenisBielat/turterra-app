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
          conservation_statuses(
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
      speciesQuery = speciesQuery.neq('id', excludeId);
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
    let results: SpeciesSearchResult[] = (species || []).map((s) => {
      // Get the most recent conservation status
      const conservationHistory = s.turtle_species_conservation_history || [];
      const sortedHistory = [...conservationHistory].sort(
        (a, b) => parseInt(b.year_status_assigned) - parseInt(a.year_status_assigned)
      );
      const currentStatus = sortedHistory[0]?.conservation_statuses?.abbreviation || null;

      return {
        id: s.id,
        commonName: s.species_common_name,
        scientificName: s.species_scientific_name,
        avatarUrl: s.avatar_image_circle_url,
        conservationStatus: currentStatus,
        // Keep habitat types for filtering (will be removed from final response)
        _habitatTypes: (s.turtle_species_habitat_types || []).map(
          (ht: { habitat_types: HabitatType | null }) => ht.habitat_types?.habitat_type
        ).filter(Boolean)
      };
    });

    // Apply habitat type filter if provided (client-side filtering since Supabase
    // doesn't easily support filtering by nested many-to-many relationships)
    if (habitatType) {
      results = results.filter((r) =>
        (r as SpeciesSearchResult & { _habitatTypes: string[] })._habitatTypes.includes(habitatType)
      );
    }

    // Remove the temporary _habitatTypes field
    const cleanResults: SpeciesSearchResult[] = results.map((result) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _habitatTypes, ...rest } = result;
      return rest as SpeciesSearchResult;
    });

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
    return NextResponse.json({ error: 'Failed to search species' }, { status: 500 });
  }
}
