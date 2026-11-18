import { notFound } from 'next/navigation'
import { getTurtleData } from '@/lib/db/queries/turtle-profile'
import { createClient } from "@/lib/supabase/server";
import TurtleProfileHero from "@/components/turtle-profile/hero-slider/turtle-profile-hero";
import TurtleSearchNav from "@/components/turtle-profile/hero-search/SearchNav";
import TurtleAtAGlance from "@/components/turtle-profile/content-sections/AtAGlance";
import { ProfileNavigation } from "@/components/turtle-profile/navigation/ProfileNavigation";
import Identification from "@/components/turtle-profile/content-sections/Identification";
import DistributionSection from "@/components/turtle-profile/distribution/DistributionSection";
import Habitat from "@/components/turtle-profile/content-sections/Habitat";
import Behavior from "@/components/turtle-profile/content-sections/Behavior";
import Conservation from "@/components/turtle-profile/content-sections/Conservation";
import References from "@/components/turtle-profile/content-sections/References";
import { ParentSpeciesLink, SubspeciesList } from "@/components/turtle-profile/SubspeciesLinks";

export default async function TurtlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  // Query as the signed-in user so admins can preview draft species.
  // Everyone else only ever receives published species from the database.
  const supabase = await createClient();
  const data = await getTurtleData(params.slug, supabase);

  if (!data) {
    notFound();
  }

  // Only comes back as 'draft' for an admin looking at an unpublished species.
  const { data: statusRow } = await supabase
    .from('turtle_species')
    .select('status')
    .eq('slug', params.slug)
    .maybeSingle();
  const isDraft = statusRow?.status === 'draft';

  return (
    <main>
      {isDraft && (
        <div className="bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-sm text-orange-900">
          Draft preview. This species is not published, so only admins can see this page.
        </div>
      )}
      <TurtleSearchNav
        turtleName={data.commonName}
        turtleSpecies={data.scientificName}
        turtleImageUrl={data.profileImage || "/images/image-placeholder.png"}
        taxonomy={data.taxonomy}
      />
      <TurtleProfileHero slug={params.slug} name={data.commonName} />
      <div className="w-full h-8 lg:h-16 bg-green-900"></div>
      <div className="w-full h-6 lg:h-12 bg-green-800"></div>
      <div className="w-full h-4 lg:h-8 bg-orange-500"></div>
      
      <div className="bg-warm">
        <div className="px-4 lg:px-10 py-12">
          <div className="max-w-[90rem] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative">
              {/* Left sidebar - hidden on mobile */}
              <div className="hidden lg:flex flex-col col-span-3 justify-start w-full overflow-visible">
                <ProfileNavigation
                  name={data.commonName}
                  species={data.scientificName}
                  imageUrl={data.profileImage || "/images/image-placeholder.png"}
                  taxonomy={data.taxonomy}
                />
              </div>

              {/* Right content area */}
              <div className="col-span-1 lg:col-span-9 flex flex-col">
                {data.isSubspecies && data.parentScientificName && (
                  <ParentSpeciesLink
                    parentSpecies={data.parentSpecies}
                    parentScientificName={data.parentScientificName}
                  />
                )}

                <TurtleAtAGlance 
                  description={data.description}
                  limitedInformation={data.limitedInformation}
                  conservationStatus={data.conservationStatus}
                  stats={data.stats}
                  commonNames={data.commonNames}
                />

                <SubspeciesList
                  speciesCommonName={data.commonName}
                  subspecies={data.subspecies}
                />
                
                {/* Divider - hidden on mobile */}
                <div className="hidden md:block w-full mt-12 mb-20">
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
                <div className="w-full mt-8 mb-12 md:mt-12 md:mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>

                <DistributionSection 
                  currentSpeciesId={data.id}
                  currentSpeciesName={data.commonName}
                  description={data.distributionText}
                />

                {/* Divider */}
                <div className="w-full mt-8 mb-12 md:mt-12 md:mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                
                <Habitat
                  habitatDescription={data.habitat.description}
                  habitatSystems={data.habitat.ecologies}
                  habitatTypes={data.habitat.habitatTypes}
                  predators={data.habitat.predators ?? undefined}
                />

                {/* Divider */}
                <div className="w-full mt-8 mb-12 md:mt-12 md:mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>

                <Behavior
                  hibernation={data.behavior.hibernation ?? undefined}
                  diet={data.behavior.diet ?? undefined}
                  nesting={data.behavior.nesting ?? undefined}
                  uniqueTraits={data.behavior.uniqueTraits ?? undefined}
                />

                {/* Divider */}
                <div className="w-full mt-8 mb-12 md:mt-12 md:mb-20">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>

                <Conservation
                  description={data.conservation.description}
                  statuses={data.conservation.statuses}
                  currentStatus={data.conservation.currentStatus}
                  threats={data.conservation.threats ?? undefined}
                  threatTags={data.conservation.threatTags}
                />

                {/* Divider - only show if there are references */}
                {data.references && data.references.length > 0 && (
                  <div className="w-full mt-8 mb-12 md:mt-12 md:mb-20">
                    <div className="w-full h-px bg-gray-200"></div>
                  </div>
                )}

                <References references={data.references || []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
