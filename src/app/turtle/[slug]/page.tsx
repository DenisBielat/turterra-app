import { getTurtleData, debugAvailableSlugs } from '@/lib/db/queries/turtle-profile'
import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";
import TurtleSearchNav from "@/components/turtle-profile/hero-search/SearchNav";
import TurtleAtAGlance from "@/components/turtle-profile/content-sections/AtAGlance";
import { ProfileNavigation } from "@/components/turtle-profile/navigation/ProfileNavigation";
import MobileProfileMenuWrapper from "@/components/turtle-profile/navigation/MobileProfileMenuWrapper";
import Identification from "@/components/turtle-profile/content-sections/Identification";
import DistributionSection from "@/components/turtle-profile/distribution/DistributionSection";
import Habitat from "@/components/turtle-profile/content-sections/Habitat";
import Behavior from "@/components/turtle-profile/content-sections/Behavior";
import Conservation from "@/components/turtle-profile/content-sections/Conservation";

export default async function TurtlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  
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
            {(availableSlugs as { slug: string; species_common_name: string }[]).map((turtle) => (
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

      {/* Mobile Profile Menu */}
      <MobileProfileMenuWrapper
        name={data.commonName}
        species={data.scientificName}
        imageUrl={data.profileImage || "/images/image-placeholder.png"}
        taxonomy={data.taxonomy}
      />

      <div className="bg-warm">
        <div className="px-4 py-8 lg:px-10 lg:py-12">
          <div className="max-w-[90rem] mx-auto">
            <div className="grid grid-cols-12 gap-4 relative">
              {/* Left sidebar - Hidden on mobile, visible on large screens */}
              <div className="hidden lg:flex flex-col col-span-3 justify-start w-full overflow-visible">
                <ProfileNavigation
                  name={data.commonName}
                  species={data.scientificName}
                  imageUrl={data.profileImage || "/images/image-placeholder.png"}
                  taxonomy={data.taxonomy}
                />
              </div>

              {/* Right content area - Full width on mobile, 9 columns on large screens */}
              <div className="col-span-12 lg:col-span-9 flex flex-col">
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
                  speciesId={data.id}
                  description={data.identification.description}
                  measurements={data.identification.measurements}
                  featureCategories={data.identification.featureCategories}
                  speciesCard={data.identification.speciesCard}
                  relatedSpecies={data.identification.relatedSpecies}
                />

                {/* Divider */}
                <div className="w-full mt-12 mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                
                <DistributionSection 
                  currentSpeciesId={data.id}
                  currentSpeciesName={data.commonName}
                  description={data.distributionText}
                />

                {/* Divider */}
                <div className="w-full mt-12 mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                
                <Habitat
                  habitatDescription={data.habitat.description}
                  habitatSystems={data.habitat.ecologies}
                  habitatTypes={data.habitat.habitatTypes}
                  predators={data.habitat.predators ?? undefined}
                />

                {/* Divider */}
                <div className="w-full mt-12 mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>

                <Behavior
                  hibernation={data.behavior.hibernation ?? undefined}
                  diet={data.behavior.diet ?? undefined}
                  nesting={data.behavior.nesting ?? undefined}
                  uniqueTraits={data.behavior.uniqueTraits ?? undefined}
                />

                {/* Divider */}
                <div className="w-full mt-12 mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>

                <Conservation
                  description={data.conservation.description}
                  statuses={data.conservation.statuses}
                  currentStatus={data.conservation.currentStatus}
                  threats={data.conservation.threats ?? undefined}
                  threatTags={data.conservation.threatTags}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}