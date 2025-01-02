import { supabase } from "@/lib/db/supabaseClient";
import Link from "next/link";

const SpeciesGuide = async () => {
  // Fetch turtle data along with primary images
  const { data: turtles, error } = await supabase
    .from("turtle_species")
    .select(`
      id, 
      species_common_name, 
      slug,
      turtle_species_images(url)
    `)
    .eq("turtle_species_images.is_primary", true);

  if (error) {
    console.error("Error fetching turtles:", error.message);
    return <p>Failed to load turtle species.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Species Guide</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {turtles.map((turtle) => (
          <div key={turtle.id} className="border rounded-lg p-4">
            {/* Display thumbnail image if available */}
            {turtle.turtle_species_images?.[0]?.url && (
              <img
                src={turtle.turtle_species_images[0].url}
                alt={`${turtle.species_common_name} thumbnail`}
                className="w-full h-32 object-cover mb-2"
              />
            )}
            <h2 className="text-xl font-semibold">{turtle.species_common_name}</h2>
            <Link
              href={`/turtle/${turtle.slug}`}
              className="text-blue-600 hover:underline"
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeciesGuide;