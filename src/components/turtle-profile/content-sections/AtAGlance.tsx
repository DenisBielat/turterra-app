"use client";

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TurtleAtAGlanceProps {
  description: string;
  limitedInformation?: {
    showWarning: boolean;
    description: string;
  };
  conservationStatus: {
    status: string;
    code: string;
    year: number;
    outOfDate?: boolean;
    outOfDateDescription?: string;
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

// Helper function to get population trend color
const getPopulationTrendColor = (trend: string) => {
  const normalizedTrend = trend.toLowerCase();
  if (normalizedTrend.includes('decreasing')) return 'text-red-500';
  if (normalizedTrend.includes('increasing') || normalizedTrend.includes('stable')) return 'text-green-700';
  // Unknown, Null, or any other value
  return 'text-gray-500';
};

// Helper function to get conservation status color classes
const getConservationStatusColor = (code: string) => {
  switch (code) {
    // Extinct categories - red
    case 'EX':
    case 'EW':
      return 'bg-red-500 outline-red-500';
    
    // Critically Endangered - red
    case 'CR':
      return 'bg-red-500 outline-red-500';
    
    // Threatened categories - orange
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
  limitedInformation,
  conservationStatus,
  stats,
  commonNames,
}: TurtleAtAGlanceProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

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
    <section id="at-a-glance-section" className="mb-12">
      <h2 id="intro" className="scroll-m-20 text-3xl md:text-5xl">
        At a Glance
      </h2>
      <div className="mt-6 md:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
          {/* Description area - spans 4 columns on desktop, full width on mobile */}
          <div className="col-span-1 md:col-span-4 text-base md:text-lg leading-relaxed">
            {/* Render the markdown description */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
            
            {/* Limited Information Warning */}
            {limitedInformation?.showWarning && (
              <div className="mt-6 p-4 bg-gray-900/10 border border-gray-900/30 rounded-lg flex gap-3 shadow-sm">
                <div className="flex-shrink-0 -mt-0.5">
                  <Icon
                    name="warning"
                    style="filled"
                    size="base"
                    className="text-orange-500"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                    {limitedInformation.description}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Empty column - hidden on mobile */}
          <div className="hidden md:block md:col-span-1" />

          {/* Stats area - spans 4 columns on desktop, full width on mobile */}
          <div className="col-span-1 md:col-span-4 space-y-6 mt-6 md:mt-0">
            {/* Conservation Status */}
            <button
              onClick={() => scrollToSection('conservation')}
              className="flex gap-4 cursor-pointer hover:opacity-80 transition-opacity text-left"
            >
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-full ${getConservationStatusColor(conservationStatus.code)} outline-2 outline-offset-[3px] outline-dotted`}>
                <span className="font-bold text-white">{conservationStatus.code}</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="font-heading font-bold text-base md:text-lg">{conservationStatus.status}</div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs md:text-sm">
                    {conservationStatus.outOfDate
                      ? `Turterra | ${new Date().getFullYear()}`
                      : `IUCN RedList | ${conservationStatus.year}`}
                  </p>
                  {conservationStatus.outOfDate && conservationStatus.outOfDateDescription && (
                    <TooltipProvider>
                      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                        <TooltipTrigger
                          asChild
                          onClick={(e) => {
                            e.stopPropagation();
                            setTooltipOpen(!tooltipOpen);
                          }}
                        >
                          <span className="inline-flex items-center">
                            <Icon
                              name="information-circle"
                              style="line"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700 cursor-help"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-white/100">
                          <p className="text-sm">{conservationStatus.outOfDateDescription}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
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
                      className={key === 'populationTrend'
                        ? getPopulationTrendColor(value)
                        : "text-green-700"}
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

            {/* Common Names Section - only show if there are common names */}
            {commonNames && commonNames.length > 0 && commonNames.some(name => name && name.trim()) && (
              <div className="space-y-3">
                <h3 className="font-bold text-base md:text-lg">Other Names People Call Me</h3>
                <div className="h-px border-b border-gray-200" />
                <div className="flex flex-wrap gap-2">
                  {commonNames.map((name, index) => (
                    name && name.trim() && (
                      <span
                        key={index}
                        className="rounded-sm bg-green-900/20 px-3 py-1 text-sm"
                      >
                        {name}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}