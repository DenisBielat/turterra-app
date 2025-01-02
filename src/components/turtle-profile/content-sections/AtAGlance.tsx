import { Icon } from '@/components/Icon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TurtleAtAGlanceProps {
  description: string;
  conservationStatus: {
    status: string;
    code: string;
    year: number;
  };
  stats: {
    population: string;
    populationTrend: string;
    habitat: string;
    region: string;
    ecology: string;
    category: string;
  };
  commonNames: string[];
}

const STAT_ICONS = {
  population: 'turtle',
  populationTrend: 'graph-stats-descend',
  habitat: 'outdoors-tree-valley',
  region: 'map-marks',
  ecology: 'split',
  category: 'category'
} as const;

export default function TurtleAtAGlance({
  description,
  conservationStatus,
  stats,
  commonNames,
}: TurtleAtAGlanceProps) {
  return (
    <section className="pb-12">
      <h2 id="intro" className="scroll-m-20 text-5xl">
        At a Glance
      </h2>
      <div className="mt-12">
        <div className="grid grid-cols-9 gap-4">
          {/* Description area - spans 4 columns */}
          <div className="col-span-4 text-lg leading-relaxed">
            {/* Render the markdown description */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
          
          {/* Empty column */}
          <div className="col-span-1" />
          
          {/* Stats area - spans 4 columns */}
          <div className="col-span-4 space-y-6">
            {/* Conservation Status */}
            <div className="flex gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 outline-2 outline-offset-[3px] outline-dotted outline-orange-500">
                <span className="font-bold text-white">{conservationStatus.code}</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="font-heading font-bold text-lg">{conservationStatus.status}</div>
                <p className="text-sm">IUCN RedList | {conservationStatus.year}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex flex-wrap gap-x-5">
              {Object.entries(stats).map(([key, value]) => (
                <div
                  key={key}
                  className="w-[calc(50%-10px)] border-t border-t-gray-200 py-4"
                >
                  {/* Header with icon */}
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={STAT_ICONS[key as keyof typeof STAT_ICONS]} 
                      style="line" 
                      size="base" 
                      className="text-green-700" 
                    />
                    <div className="text-sm uppercase">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                  {/* Value aligned with icon */}
                  <div className="mt-1 text-sm">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Common Names Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Other Names People Call Me</h3>
              <div className="h-px border-b border-gray-200" />
              <div className="flex flex-wrap gap-2">
                {commonNames.map((name, index) => (
                  <span
                    key={index}
                    className="rounded-sm bg-green-900/20 px-3 py-1 text-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}