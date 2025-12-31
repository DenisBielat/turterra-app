"use client";

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
  habitat: 'outdoors-tree-valley',
  region: 'map-marks',
  ecology: 'split',
  category: 'category'
} as const;

// Add a helper function to determine the population trend icon
const getPopulationTrendIcon = (trend: string) => {
  const normalizedTrend = trend.toLowerCase();
  if (normalizedTrend.includes('increasing')) return 'graph-stats-ascend';
  if (normalizedTrend.includes('decreasing')) return 'graph-stats-descend';
  return 'dotted-line-horizontal';
};

// Helper function to get conservation status color classes
const getConservationStatusColor = (code: string) => {
  switch (code) {
    // Extinct categories - red
    case 'EX':
    case 'EW':
      return 'bg-red-500 outline-red-500';
    
    // Threatened categories - orange
    case 'CR':
    case 'EN':
    case 'VU':
      return 'bg-orange-500 outline-orange-500';
    
    // Near Threatened and Least Concern - green
    case 'NT':
    case 'LC':
      return 'bg-green-800 outline-green-800';
    
    // Lacks Data - gray
    case 'DD':
    case 'NE':
      return 'bg-gray-500 outline-gray-500';
    
    // Default fallback - black
    default:
      return 'bg-black outline-black';
  }
};

export default function TurtleAtAGlance({
  description,
  conservationStatus,
  stats,
  commonNames,
}: TurtleAtAGlanceProps) {
  // Smooth scroll handler matching the side menu behavior
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 100;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  return (
    <section>
      <h2 id="intro" className="scroll-m-20 text-3xl md:text-4xl lg:text-5xl">
        At a Glance
      </h2>
      <div className="mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 lg:gap-4">
          {/* Description area - full width on mobile, 4 columns on large screens */}
          <div className="col-span-1 lg:col-span-4 text-base lg:text-lg leading-relaxed">
            {/* Render the markdown description */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>

          {/* Empty column - hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Stats area - full width on mobile, 4 columns on large screens */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            {/* Conservation Status */}
            <button
              onClick={() => scrollToSection('conservation')}
              className="flex gap-4 cursor-pointer hover:opacity-80 transition-opacity text-left"
            >
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-full ${getConservationStatusColor(conservationStatus.code)} outline-2 outline-offset-[3px] outline-dotted`}>
                <span className="font-bold text-white">{conservationStatus.code}</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="font-heading font-bold text-lg">{conservationStatus.status}</div>
                <p className="text-sm">IUCN RedList | {conservationStatus.year}</p>
              </div>
            </button>

            {/* Stats Grid */}
            <div className="flex flex-wrap gap-x-5">
              {Object.entries(stats).map(([key, value]) => (
                <div
                  key={key}
                  className="w-[calc(50%-10px)] border-t border-t-gray-200 py-4"
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      name={key === 'populationTrend' 
                        ? getPopulationTrendIcon(value)
                        : STAT_ICONS[key as keyof typeof STAT_ICONS]} 
                      style="line" 
                      size="base" 
                      className="text-green-700" 
                    />
                    <div className="text-sm uppercase">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
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