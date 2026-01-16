import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BehaviorProps {
  hibernation?: string;
  diet?: string;
  nesting?: string;
  uniqueTraits?: string;
}

export default function Behavior({
  hibernation,
  diet,
  nesting,
  uniqueTraits,
}: BehaviorProps) {
  return (
    <section id="behavior" className="scroll-m-20">
      <h2 className="text-3xl md:text-5xl font-bold mb-2">Behavior</h2>
      
      <div className="mt-6 md:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
          {/* Left content area - All subsections */}
          <div className="col-span-1 md:col-span-5 space-y-8 md:space-y-12">
            {/* Hibernation Subsection */}
            {hibernation && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Hibernation</h3>
                <div className="text-base md:text-lg whitespace-pre-line">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {hibernation}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Diet Subsection */}
            {diet && (
              <div>
                <div className="w-full mb-6 md:mb-8">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Diet</h3>
                <div className="text-base md:text-lg whitespace-pre-line">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {diet}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Nesting Subsection */}
            {nesting && (
              <div>
                <div className="w-full mb-6 md:mb-8">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Nesting</h3>
                <div className="text-base md:text-lg whitespace-pre-line">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {nesting}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Unique Traits and Qualities Subsection */}
            {uniqueTraits && (
              <div>
                <div className="w-full mb-6 md:mb-8">
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Unique Traits and Qualities</h3>
                <div className="text-base md:text-lg whitespace-pre-line">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {uniqueTraits}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Empty column for spacing - hidden on mobile */}
          <div className="hidden md:block md:col-span-1" />

          {/* Right content area - reserved for future use */}
          <div className="hidden md:block md:col-span-3">
            {/* Future content */}
          </div>
        </div>
      </div>
    </section>
  );
}

