import SpeciesComparison from '../physical-features/SpeciesComparison';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from '@/components/Icon';

interface IdentificationProps {
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
                <h3 className="font-bold text-base mb-3">Adult Weight</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold leading-none">
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
                <h3 className="font-bold text-base mb-3">Length (Max SCL)</h3>
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 mb-2">
                  {/* Female Column */}
                  <div>
                    <div className="text-sm mb-1 flex items-center gap-1">
                      <Icon name="female" style="line" size="sm" />
                      <span>Female</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold leading-none">
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

                  {/* Comparison Symbol - Center column */}
                  <div className="flex items-center justify-center pb-1">
                    <span className="text-3xl font-bold leading-none">
                      {measurements.length.generallyLarger === 'female' ? '>' :
                       measurements.length.generallyLarger === 'male' ? '<' :
                       measurements.length.generallyLarger === 'equal' ? '=' : '>'}
                    </span>
                  </div>

                  {/* Male Column */}
                  <div>
                    <div className="text-sm mb-1 flex items-center gap-1">
                      <Icon name="male" style="line" size="sm" />
                      <span>Male</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold leading-none">
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
                    ? 'Males and females are generally similar in size.'
                    : 'The female is generally larger than the male.'}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-300 mb-6" />

              {/* Lifespan */}
              <div className="pt-6">
                <h3 className="font-bold text-base mb-3">Lifespan</h3>
                <div className="flex items-start gap-8 mb-2">
                  <div className="flex-1">
                    <div className="text-sm mb-1">In the Wild</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold leading-none">
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
                      <span className="text-5xl font-bold leading-none">
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
          This section highlights each physical feature of the turtle as observed in the “reference” variant (Adult Male). If you see a variant icon next to a feature, it means there are known differences in that feature for other sexes or life stages (e.g., juvenile, hatchling). Clicking the icon will display a quick comparison, so you can see exactly how that feature varies across the same turtle species. 
          </p>
        </div>

        {/* Physical Features Accordions/Tables Row */}
        <div className="mt-8">
          <SpeciesComparison 
            primarySpecies={{
              speciesCard,
              featureCategories
            }}
            relatedSpecies={relatedSpecies}
          />
        </div>
      </div>
    </section>
  );
} 