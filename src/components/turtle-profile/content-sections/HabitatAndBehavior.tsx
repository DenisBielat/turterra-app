import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from '@/components/Icon';

interface HabitatAndBehaviorProps {
  description: string;
  habitats: Array<{
    name: string;
    icon: string;
  }>;
}

export default function HabitatAndBehavior({
  description,
  habitats,
}: HabitatAndBehaviorProps) {
  return (
    <section id="habitat" className="scroll-m-20 pb-12">
      <h2 className="text-5xl font-bold mb-2">Habitat and Behavior</h2>
      
      <div className="mt-12">
        {/* Habitat Description */}
        {description && (
          <div className="mb-12 max-w-4xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}

        {/* Habitat Types Section */}
        {habitats.length > 0 && (
          <div className="mt-12">
            <h3 className="font-heading text-xl font-semibold mb-6">
              Habitat Types
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {habitats.map((habitat, index) => {
                // Check if icon is SVG markup (starts with <svg) or an icon name
                const isSvgMarkup = habitat.icon?.trim().startsWith('<svg');
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                      {habitat.icon ? (
                        isSvgMarkup ? (
                          <div 
                            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                            dangerouslySetInnerHTML={{ __html: habitat.icon }}
                          />
                        ) : (
                          <Icon 
                            name={habitat.icon as any} 
                            style="color" 
                            size="xlg"
                            className="w-full h-full"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-black">
                        {habitat.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

