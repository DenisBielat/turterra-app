import { supabase } from "@/lib/db/supabaseClient";
import { NextResponse } from "next/server";

export interface RandomTurtleResponse {
  commonName: string;
  scientificName: string;
  slug: string;
  imageUrl: string | null;
  fact: string | null;
}

/**
 * API Route: Get a random turtle for onboarding showcase
 *
 * Returns a random turtle species with an image and fun fact
 * to display during the onboarding process.
 */
export async function GET() {
  try {
    // Fetch all turtles with images and descriptions
    const { data: turtles, error } = await supabase
      .from("turtle_species")
      .select(
        `
        id,
        species_common_name,
        species_scientific_name,
        slug,
        avatar_image_full_url,
        avatar_image_circle_url,
        turtle_species_section_descriptions(
          at_a_glance
        )
      `
      )
      .not("avatar_image_full_url", "is", null);

    if (error) {
      console.error("Error fetching turtles:", error);
      return NextResponse.json(
        { error: "Failed to fetch turtle data" },
        { status: 500 }
      );
    }

    if (!turtles || turtles.length === 0) {
      return NextResponse.json(
        { error: "No turtles found" },
        { status: 404 }
      );
    }

    // Pick a random turtle
    const randomIndex = Math.floor(Math.random() * turtles.length);
    const turtle = turtles[randomIndex];

    // Extract the at_a_glance description
    const sectionDesc = turtle.turtle_species_section_descriptions as Array<{
      at_a_glance: string | null;
    }> | null;
    const fact = sectionDesc?.[0]?.at_a_glance || null;

    const response: RandomTurtleResponse = {
      commonName: turtle.species_common_name,
      scientificName: turtle.species_scientific_name,
      slug: turtle.slug,
      imageUrl: turtle.avatar_image_full_url || turtle.avatar_image_circle_url,
      fact,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in random turtle API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
