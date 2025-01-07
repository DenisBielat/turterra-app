import { Icon } from '@/components/Icon';
import PhysicalFeatures from './PhysicalFeatures';

interface IdentificationProps {
  description: string;
  physicalFeatures: string;
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
}

export default function Identification({
  description,
  physicalFeatures,
  measurements,
  featureCategories,
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
            <div className="mt-4">
              <p className="text-base">{description}</p>
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
          <p className="mt-2 text-base">{physicalFeatures}</p>
        </div>

        {/* Physical Features */}
        <div className="mt-8">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_minmax(16px,24px)_1fr_1fr_1fr_1fr_1fr] gap-4">
            {/* Turtle Physical Features Accordion */}
            <div className="col-span-5">
              <PhysicalFeatures categories={featureCategories} />
            </div>

            {/* Empty column for spacing - now with custom width */}
            <div className="col-span-1" />

            {/* Right content area - Future complex component */}
            <div className="col-span-5">
              {/* Accordion Comparison Component */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 