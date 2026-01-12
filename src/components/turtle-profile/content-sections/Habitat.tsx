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
      <h2 className="text-3xl md:text-5xl font-bold mb-2">Habitat</h2>
      
      <div className="mt-6 md:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
          {/* Left content area - All subsections */}
          <div className="col-span-1 md:col-span-5 space-y-8 md:space-y-12">
            {/* Habitat Description */}
            {habitatDescription && (
              <div className="text-base md:text-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {habitatDescription}
                </ReactMarkdown>
              </div>
            )}

            {/* Habitat Systems and Types - Mobile only, appears after description */}
            {(habitatSystems.length > 0 || habitatTypes.length > 0) && (
              <div className="md:hidden space-y-4">
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

            {/* Predators Subsection */}
            {predators && (
              <div>
                <div className="w-full mb-6 md:mb-8">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Predators</h3>
                <div className="text-base md:text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {predators}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Empty column for spacing - hidden on mobile */}
          <div className="hidden md:block md:col-span-1" />

          {/* Right content area - Habitat Systems and Types - Desktop only */}
          <div className="hidden md:block md:col-span-3">
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


