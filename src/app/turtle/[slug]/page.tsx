import { getTurtleData } from '@/lib/db/queries/turtle-profile'
import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";
import TurtleSearchNav from "@/components/turtle-profile/hero-search/SearchNav";
import TurtleAtAGlance from "@/components/turtle-profile/content-sections/AtAGlance";
import { ProfileNavigation } from "@/components/turtle-profile/navigation/ProfileNavigation";
import Identification from "@/components/turtle-profile/content-sections/Identification";
import ExtendedWrapper from "@/components/ui/extended-wrapper";
import { supabase } from '@/lib/db/supabaseClient';
import DistributionWrapper from '@/components/turtle-profile/distribution/DistributionWrapper';

export default async function TurtlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getTurtleData(params.slug);

  if (!data) {
    return <div>No turtle data found</div>
  }

  // Get the species ID from the database
  const { data: speciesData } = await supabase
    .from('turtle_species')
    .select('id')
    .eq('slug', params.slug)
    .single();

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
            {/* Regular grid layout for first sections */}
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
                
                <div className="pb-12">
                  <Identification
                    description={data.identification.description}
                    measurements={data.identification.measurements}
                    featureCategories={data.identification.featureCategories}
                    speciesCard={data.identification.speciesCard}
                    relatedSpecies={data.identification.relatedSpecies}
                  />
                </div>

                {/* Extended background section using dynamic calculation */}
                <div>
                <ExtendedWrapper backgroundColor="bg-green-950">
                  <div className="w-full max-w-[90rem] mx-auto overflow-hidden">
                    <div className="py-12">
                      <DistributionWrapper currentSpeciesId={speciesData?.id} />
                    </div>
                  </div>
                </ExtendedWrapper>
                </div>

                {/* Continue with more content sections if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}