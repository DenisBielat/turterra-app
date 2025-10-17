import { getTurtleData, debugAvailableSlugs } from '@/lib/db/queries/turtle-profile'
import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";
import TurtleSearchNav from "@/components/turtle-profile/hero-search/SearchNav";
import TurtleAtAGlance from "@/components/turtle-profile/content-sections/AtAGlance";
import { ProfileNavigation } from "@/components/turtle-profile/navigation/ProfileNavigation";
import Identification from "@/components/turtle-profile/content-sections/Identification";
import DistributionSection from "@/components/turtle-profile/distribution/DistributionSection";

export default async function TurtlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  console.log(`🐢 Attempting to load turtle with slug: "${params.slug}"`);
  
  // Debug: Show available slugs if there's an issue
  const availableSlugs = await debugAvailableSlugs();
  
  const data = await getTurtleData(params.slug);

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Turtle Not Found</h1>
        <p className="mb-4">No turtle data found for slug: <code className="bg-gray-100 px-2 py-1 rounded">{params.slug}</code></p>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Available slugs:</h2>
          <ul className="list-disc list-inside">
            {availableSlugs.map((turtle: any) => (
              <li key={turtle.slug}>
                <a href={`/turtle/${turtle.slug}`} className="text-blue-600 hover:underline">
                  {turtle.species_common_name} ({turtle.slug})
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <main>
      <TurtleSearchNav />
      <TurtleProfileHero slug={params.slug} />
      <div className="w-full h-16 bg-green-900"></div>
      <div className="w-full h-12 bg-green-800"></div>
      <div className="w-full h-8 bg-orange-500"></div>
      
      <div className="bg-warm">
        <div className="px-10 py-12">
          <div className="max-w-[90rem] mx-auto">
            <div className="grid grid-cols-12 gap-4 relative">
              {/* Left sidebar */}
              <div className="flex flex-col col-span-3 justify-start w-full overflow-visible">
                <ProfileNavigation 
                  name={data.commonName}
                  species={data.scientificName}
                  imageUrl={data.profileImage || "/images/image-placeholder.png"}
                />
              </div>

              {/* Right content area */}
              <div className="col-span-9 flex flex-col">
                <TurtleAtAGlance 
                  description={data.description}
                  conservationStatus={data.conservationStatus}
                  stats={data.stats}
                  commonNames={data.commonNames}
                />
                
                {/* Divider */}
                <div className="w-full mt-12 mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                
                <Identification
                  description={data.identification.description}
                  measurements={data.identification.measurements}
                  featureCategories={data.identification.featureCategories}
                  speciesCard={data.identification.speciesCard}
                  relatedSpecies={data.identification.relatedSpecies}
                />

                <div className="w-full mt-12 mb-20">
                  <DistributionSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}