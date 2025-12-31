import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface HabitatProps {
  habitatDescription: string;
  habitatSystems?: string[];
  habitatTypes?: string[];
  predators?: string;
}

export default function Habitat({
  habitatDescription,
  habitatSystems = [],
  habitatTypes = [],
  predators,
}: HabitatProps) {
  return (
    <section id="habitat" className="scroll-m-20">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Habitat</h2>

      <div className="mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 lg:gap-4">
          {/* Left content area - All subsections */}
          <div className="col-span-1 lg:col-span-5 space-y-8 lg:space-y-12">
            {/* Habitat Description */}
            {habitatDescription && (
              <div className="text-base lg:text-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {habitatDescription}
                </ReactMarkdown>
              </div>
            )}

            {/* Predators Subsection */}
            {predators && (
              <div>
                <div className="w-full mb-6 lg:mb-8">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-3">Predators</h3>
                <div className="text-base lg:text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {predators}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Empty column for spacing - hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Right content area - Habitat Systems and Types */}
          <div className="col-span-1 lg:col-span-3">
            {(habitatSystems.length > 0 || habitatTypes.length > 0) && (
              <div className="space-y-4">
                {habitatSystems.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Habitat Systems</p>
                    <p className="text-base text-black">
                      {habitatSystems.join(', ')}
                    </p>
                  </div>
                )}
                {habitatTypes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Habitat Types</p>
                    <p className="text-base text-black">
                      {habitatTypes.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


