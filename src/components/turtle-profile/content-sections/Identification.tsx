import { Icon } from '@/components/Icon';
import SpeciesComparison from '../physical-features/SpeciesComparison';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IdentificationProps {
  description: string;
  measurements: {
    adultWeight: string;
    length: {
      female: string;
      male: string;
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
            <div className="text-sm text-gray-600">Measurements</div>
            <div className="mt-2 space-y-3">
              {/* Adult Weight */}
              <div className="flex items-center gap-4 rounded-lg bg-black/5 p-4">
                <Icon name="kettlebell" size="xlg" style="line" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Adult Weight</span>
                    <Icon 
                      name="information-circle" 
                      size="sm" 
                      style="line" 
                      className="text-gray-400 cursor-pointer hover:text-gray-600" 
                    />
                  </div>
                  <div className="mt-1 text-lg font-bold">{measurements.adultWeight}</div>
                </div>
              </div>

              {/* Length */}
              <div className="flex items-center gap-4 rounded-lg bg-black/5 p-4">
                <Icon name="ruler" size="xlg" style="line" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Length (Max SCL)</span>
                    <Icon 
                      name="information-circle" 
                      size="sm" 
                      style="line" 
                      className="text-gray-400 cursor-pointer hover:text-gray-600" 
                    />
                  </div>
                  <div className="mt-1 flex gap-8">
                    <div>
                      <div className="text-lg font-bold">{measurements.length.female}</div>
                      <div className="text-xs">Female</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{measurements.length.male}</div>
                      <div className="text-xs">Male</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifespan */}
              <div className="flex items-center gap-4 rounded-lg bg-black/5 p-4">
                <Icon name="clock" size="xlg" style="line" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Lifespan</span>
                    <Icon 
                      name="information-circle" 
                      size="sm" 
                      style="line" 
                      className="text-gray-400 cursor-pointer hover:text-gray-600" 
                    />
                  </div>
                  <div className="mt-1 flex gap-8">
                    <div>
                      <div className="text-lg font-bold">{measurements.lifespan.wild}</div>
                      <div className="text-xs">In the Wild</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{measurements.lifespan.captivity}</div>
                      <div className="text-xs">In Captivity</div>
                    </div>
                  </div>
                </div>
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