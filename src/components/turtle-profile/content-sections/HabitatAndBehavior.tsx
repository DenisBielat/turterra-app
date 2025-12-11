import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface HabitatAndBehaviorProps {
  habitatDescription: string;
  habitatSystems?: string[];
  habitatTypes?: string[];
  behaviorDescription?: string;
}

export default function HabitatAndBehavior({
  habitatDescription,
  habitatSystems = [],
  habitatTypes = [],
  behaviorDescription,
}: HabitatAndBehaviorProps) {
  return (
    <>
      {/* Habitat Section */}
      <section id="habitat" className="scroll-m-20 pb-12">
        <h2 className="text-5xl font-bold mb-2">Habitat</h2>
        
        <div className="mt-12">
          <div className="grid grid-cols-9 gap-4">
            {/* Left content area - Description */}
            <div className="col-span-5">
              {habitatDescription && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {habitatDescription}
                </ReactMarkdown>
              )}
            </div>

            {/* Empty column for spacing */}
            <div className="col-span-1" />

            {/* Right content area - Habitat Systems and Types */}
            <div className="col-span-3">
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

      {/* Behavior Section */}
      {behaviorDescription && (
        <section id="behavior" className="scroll-m-20 pb-12 mt-20">
          <h2 className="text-5xl font-bold mb-2">Behavior</h2>
          
          <div className="mt-12 max-w-4xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {behaviorDescription}
            </ReactMarkdown>
          </div>
        </section>
      )}
    </>
  );
}

