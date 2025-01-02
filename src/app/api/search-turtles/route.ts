import { supabase } from '@/lib/db/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('turtle_species')
      .select('species_common_name, species_scientific_name, slug, avatar_image_url')
      .or(`species_common_name.ilike.%${query}%,species_scientific_name.ilike.%${query}%`)
      .limit(5);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching turtles:', error);
    return NextResponse.json({ error: 'Failed to search turtles' }, { status: 500 });
  }
}