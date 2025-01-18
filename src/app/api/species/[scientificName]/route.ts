import { getTurtleDataByScientificName } from '@/lib/db/queries/turtle-profile';
import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ scientificName: string }> }) {
  const params = await props.params;
  try {
    const decodedName = decodeURIComponent(params.scientificName);
    const data = await getTurtleDataByScientificName(decodedName);

    if (!data) {
      return NextResponse.json(
        { error: 'Species not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      speciesCard: data.identification.speciesCard,
      featureCategories: data.identification.featureCategories
    });

  } catch (error) {
    console.error('Error fetching species data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch species data' },
      { status: 500 }
    );
  }
} 