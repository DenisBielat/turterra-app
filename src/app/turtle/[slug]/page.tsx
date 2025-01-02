import { getTurtleData } from '@/lib/db/queries/turtle-profile'
import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";
import TurtleSearchNav from "@/components/turtle-profile/hero-search/SearchNav";
import TurtleAtAGlance from "@/components/turtle-profile/content-sections/AtAGlance";

export default async function Page({ params }: { params: { slug: string } }) {
  const turtleData = await getTurtleData(params.slug)

  if (!turtleData) {
    // Handle the case where no turtle is found
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
            <div className="grid grid-cols-12 gap-4">
              {/* Left sidebar */}
              <div className="col-span-3 flex flex-col">
                Left Navigation Content
              </div>

              {/* Right content area */}
              <div className="col-span-9 flex flex-col">
                <TurtleAtAGlance 
                  description={turtleData.description}
                  conservationStatus={turtleData.conservationStatus}
                  stats={turtleData.stats}
                  commonNames={turtleData.commonNames}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}