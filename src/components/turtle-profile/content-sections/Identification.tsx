import SpeciesComparison from '../physical-features/SpeciesComparison';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from '@/components/Icon';

interface IdentificationProps {
  speciesId?: number;
  description: string;
  measurements: {
    adultWeight: string;
    length: {
      female: string;
      male: string;
      generallyLarger: 'female' | 'male' | 'equal' | null;
    };
    lifespan: {
      wild: string;
      captivity: string;
    };
  };
  featureCategories: {
    name: string;
    features: {
      name: string;
      value: string;
      subFeatures: {
        name: string;
        value: string;
      }[];
    }[];
  }[];
  speciesCard: {
    commonName: string;
    scientificName: string;
    avatarUrl: string;
    backgroundImageUrl?: string;
    variant: {
      sex: string;
      lifeStage: string;
    };
  };
  relatedSpecies: {
    commonName: string;
    scientificName: string;
    avatarUrl: string;
  }[];
}

export default function Identification({
  speciesId,
  description,
  measurements,
  featureCategories,
  speciesCard,
  relatedSpecies = [],
}: IdentificationProps) {
  return (
    <section className="pb-12">
      <h2 id="identification" className="scroll-m-20 text-5xl">
        Identification
      </h2>
      
      <div className="mt-12">
        <div className="grid grid-cols-9 gap-4">
          {/* Left content area - Description */}
          <div className="col-span-5">
            <div className="font-heading text-xl font-semibold">Description</div>
            <div className="mt-4 text-lg whitespace-pre-line">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Empty column for spacing */}
          <div className="col-span-1" />

          {/* Right content area - Measurements */}
          <div className="col-span-3">
            <div className="space-y-0">
              {/* Adult Weight */}
              <div className="pb-6">
                <div className="text-sm uppercase mb-3 text-green-900 ">Adult Weight</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold leading-none">
                    {measurements.adultWeight === 'Unknown' 
                      ? 'Unknown' 
                      : measurements.adultWeight.split(' ')[0]}
                  </span>
                  {measurements.adultWeight !== 'Unknown' && (
                    <span className="text-base font-normal">
                      {measurements.adultWeight.split(' ').slice(1).join(' ')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  Best estimate of natural adult weight based on turtles caught in the wild.
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-300 mb-6" />

              {/* Length */}
              <div className="pt-6 pb-6">
                <div className="text-sm uppercase mb-3 text-green-900 ">Length (Max SCL)</div>
                <div className="flex gap-8 mb-2">
                  {/* Female Column */}
                  <div className="flex-1">
                    <div className="text-sm mb-1 flex items-center gap-1">
                      <Icon name="female" style="line" size="sm" />
                      <span>Female</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold leading-none">
                        {measurements.length.female === 'Unknown' 
                          ? 'Unknown' 
                          : measurements.length.female.split(' ')[0]}
                      </span>
                      {measurements.length.female !== 'Unknown' && (
                        <span className="text-base font-normal">
                          {measurements.length.female.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Male Column */}
                  <div className="flex-1">
                    <div className="text-sm mb-1 flex items-center gap-1">
                      <Icon name="male" style="line" size="sm" />
                      <span>Male</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold leading-none">
                        {measurements.length.male === 'Unknown' 
                          ? 'Unknown' 
                          : measurements.length.male.split(' ')[0]}
                      </span>
                      {measurements.length.male !== 'Unknown' && (
                        <span className="text-base font-normal">
                          {measurements.length.male.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  {measurements.length.generallyLarger === 'female' 
                    ? 'The female is generally larger than the male.'
                    : measurements.length.generallyLarger === 'male'
                    ? 'The male is generally larger than the female.'
                    : measurements.length.generallyLarger === 'equal'
                    ? 'Both sexes are about the same in length.'
                    : 'The female is generally larger than the male.'}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-300 mb-6" />

              {/* Lifespan */}
              <div className="pt-6">
                <div className="text-sm uppercase mb-3 text-green-900 ">Lifespan</div>
                <div className="flex items-start gap-8 mb-2">
                  <div className="flex-1">
                    <div className="text-sm mb-1">In the Wild</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold leading-none">
                        {measurements.lifespan.wild === 'Unknown' 
                          ? 'Unknown' 
                          : measurements.lifespan.wild.split(' ')[0]}
                      </span>
                      {measurements.lifespan.wild !== 'Unknown' && (
                        <span className="text-base font-normal">
                          {measurements.lifespan.wild.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">In Captivity</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold leading-none">
                        {measurements.lifespan.captivity === 'Unknown' 
                          ? 'Unknown' 
                          : measurements.lifespan.captivity.split(' ')[0]}
                      </span>
                      {measurements.lifespan.captivity !== 'Unknown' && (
                        <span className="text-base font-normal">
                          {measurements.lifespan.captivity.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  These are best estimates based on what has been observed and recorded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Features Header*/}
        <div className="mt-12 max-w-lg">
          <h3 className="text-3xl font-bold">Physical Features</h3>
          <p className="mt-2 text-base">
          Features shown are for Adult Males (reference). Look for the variant icon{' '}
          <span className="inline-flex items-center justify-center rounded bg-gray-200/60 px-1.5 py-0.5 align-baseline">
            <Icon
              name="split-3"
              size="sm"
              style="line"
              className="text-violet-800"
            />
          </span>{' '}
          to see how a feature differs by sex or life stage.
          </p>
        </div>

        {/* Physical Features Accordions/Tables Row */}
        <div className="mt-8">
          <SpeciesComparison
            primarySpecies={{
              speciesCard,
              featureCategories
            }}
            primarySpeciesId={speciesId}
            relatedSpecies={relatedSpecies}
          />
        </div>
      </div>
    </section>
  );
} 