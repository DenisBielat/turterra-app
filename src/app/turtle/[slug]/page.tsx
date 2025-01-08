import { getTurtleData } from '@/lib/db/queries/turtle-profile'
import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";
import TurtleSearchNav from "@/components/turtle-profile/hero-search/SearchNav";
import TurtleAtAGlance from "@/components/turtle-profile/content-sections/AtAGlance";
import { ProfileNavigation } from "@/components/turtle-profile/navigation/ProfileNavigation";
import Identification from "@/components/turtle-profile/content-sections/Identification";

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const turtleData = await getTurtleData(params.slug)

  if (!turtleData) {
    return <div>No turtle data found</div>
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
                  name={turtleData.commonName}
                  species={turtleData.scientificName}
                  imageUrl={turtleData.profileImage || "/images/image-placeholder.png"}
                />
              </div>

              {/* Right content area */}
              <div className="col-span-9 flex flex-col">
                <TurtleAtAGlance 
                  description={turtleData.description}
                  conservationStatus={turtleData.conservationStatus}
                  stats={turtleData.stats}
                  commonNames={turtleData.commonNames}
                />
                
                {/* Divider */}
                <div className="w-full mt-12 mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                
                <Identification
                  description={turtleData.identification.description}
                  measurements={turtleData.identification.measurements}
                  featureCategories={turtleData.identification.featureCategories}
                  speciesCard={turtleData.identification.speciesCard}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}