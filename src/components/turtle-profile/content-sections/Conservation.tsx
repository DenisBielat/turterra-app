"use client"

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Bracket component for grouping status bubbles with their labels
interface BracketProps {
  width: number;
  className?: string;
}

function Bracket({ width, className = '' }: BracketProps) {
  const height = 16;
  const strokeWidth = 1.5;
  const radius = 8;
  const centerX = width / 2;
  const y = strokeWidth / 2;

  // Path: left line -> arc curving down -> short vertical stem -> arc curving down <- right line
  const path = `
    M 0 ${y}
    H ${centerX - radius}
    A ${radius} ${radius} 0 0 1 ${centerX} ${y + radius}
    V ${height}
    M ${centerX} ${y + radius}
    A ${radius} ${radius} 0 0 1 ${centerX + radius} ${y}
    H ${width}
  `;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface ConservationProps {
  description: string | null;
  statuses: Array<{
    id: string;
    status: string;
    abbreviation: string;
    definition?: string | null;
    order_of_concern?: number | null;
  }>;
  currentStatus: {
    status: string;
    code: string;
    year: number;
  };
  threats?: string | null;
  threatTags?: Array<{
    name: string;
    icon: string | null;
  }>;
}

export default function Conservation({
  description,
  statuses,
  currentStatus,
  threats,
  threatTags = [],
}: ConservationProps) {
  const labelsContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (labelsContainerRef.current) {
        setContainerWidth(labelsContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Separate statuses into the two groups
  const specialStatuses = statuses.filter(s => 
    s.abbreviation === 'DD' || s.abbreviation === 'NE'
  ).sort((a, b) => {
    // Order: DD, NE
    const order = ['DD', 'NE'];
    return order.indexOf(a.abbreviation) - order.indexOf(b.abbreviation);
  });
  
  const iucnStatuses = statuses.filter(s => 
    ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC'].includes(s.abbreviation)
  ).sort((a, b) => {
    // Order: EX, EW, CR, EN, VU, NT, LC
    const order = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC'];
    return order.indexOf(a.abbreviation) - order.indexOf(b.abbreviation);
  });

  const isStatusActive = (abbreviation: string) => {
    return currentStatus.code === abbreviation;
  };

  const getStatusColor = (abbreviation: string, isActive: boolean) => {
    // Only active status gets threat-level color, inactive bubbles are black
    if (!isActive) {
      return 'bg-black border-black text-white';
    }

    // Color coding based on threat level (only for active status)
    // For active statuses, use outline classes to match At a Glance styling
    switch (abbreviation) {
      // Extinct categories - red
      case 'EX':
      case 'EW':
        return 'bg-red-500 outline-red-500 text-white';
      
      // Threatened categories - orange
      case 'CR':
      case 'EN':
      case 'VU':
        return 'bg-orange-500 outline-orange-500 text-white';
      
      // Near Threatened and Least Concern - green
      case 'NT':
      case 'LC':
        return 'bg-green-800 outline-green-800 text-white';
      
      // Lacks Data - gray
      case 'DD':
      case 'NE':
        return 'bg-gray-500 outline-gray-500 text-white';
      
      // Default fallback
      default:
        return 'bg-black outline-black text-white';
    }
  };

  return (
    <section id="conservation" className="scroll-m-20 pb-12">
      <h2 className="text-3xl md:text-5xl font-bold mb-2">Conservation</h2>
      
      <div className="mt-6 md:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
          {/* Left content area - Description */}
          <div className="col-span-1 md:col-span-5 space-y-8 md:space-y-12">
            {description && (
              <>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">Status</h3>
                  <div className="text-base md:text-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-4 text-base md:text-lg">
                    <p><span className="font-bold">IUCN Red List Status:</span> {currentStatus.status}</p>
                  </div>
                </div>
              </>
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

      {/* Status Bubbles - Full width, outside grid */}
      <TooltipProvider>
        <div className="mt-8 md:mt-12 w-full">
          {/* Desktop: horizontal layout, Mobile: vertical layout */}
          <div className="flex flex-col md:flex-row md:items-start">
            {/* IUCN Status group - complete with bubbles and labels */}
            {iucnStatuses.length > 0 && (
              <div className="flex flex-col w-full md:w-auto md:items-start">
                {/* IUCN Status bubbles - responsive sizing to span full width on mobile */}
                <div className="flex items-center justify-between w-full md:w-auto md:justify-start">
                  {iucnStatuses.map((status, index) => {
                    const isActive = isStatusActive(status.abbreviation);
                    return (
                      <div key={status.id} className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`relative z-10 flex aspect-square items-center justify-center rounded-full cursor-pointer flex-[2_2_0%] min-w-[32px] min-h-[32px] max-w-[48px] max-h-[48px] md:flex-none md:h-12 md:w-12 ${isActive ? 'outline-2 outline-offset-[3px] outline-dotted' : 'border-2'} ${getStatusColor(status.abbreviation, isActive)}`}
                            >
                              <span className="font-bold text-[clamp(0.75rem,2vw,0.875rem)] md:text-sm">{status.abbreviation}</span>
                            </div>
                          </TooltipTrigger>
                          {status.definition && (
                            <TooltipContent className="max-w-xs">
                              <div className="flex flex-col gap-1.5">
                                <div className="font-bold text-base leading-tight">{status.status}</div>
                                <div className="text-sm text-gray-600 font-normal">
                                  {status.definition}
                                </div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                        {index < iucnStatuses.length - 1 && (
                          <div className="h-px bg-gray-300 flex-[1_1_0%] min-w-[8px] max-w-[32px] md:flex-none md:w-8 -mx-[6px] md:-mx-0 relative z-0"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* IUCN Status labels with brackets - responsive sizing */}
                {/* Mobile labels */}
                <div className="relative mt-3 md:hidden w-full">
                  <div ref={labelsContainerRef} className="relative w-full">
                    {/* Extinct label - left aligned */}
                    <span className="absolute left-0 text-xs text-gray-600" style={{ top: '14px' }}>
                      Extinct
                    </span>

                    {/* Threatened label with bracket - spanning CR, EN, VU */}
                    {/* Position: after 2 bubbles (20%) + 2 gaps (10%) = 30%, Width: 3 bubbles (30%) + 2 gaps (10%) = 40% */}
                    <div
                      className="absolute flex flex-col items-center"
                      style={{
                        left: '30%',
                        width: '40%'
                      }}
                    >
                      <Bracket 
                        width={containerWidth > 0 ? containerWidth * 0.4 : 128} 
                        className="text-gray-400" 
                      />
                      <span className="text-xs text-gray-600 mt-1">Threatened</span>
                    </div>

                    {/* Least Concern label - right aligned */}
                    <span className="absolute right-0 text-xs text-gray-600" style={{ top: '14px' }}>
                      Least Concern
                    </span>

                    {/* Spacer to maintain height */}
                    <div style={{ height: '32px' }}></div>
                  </div>
                </div>

                {/* Desktop labels */}
                <div className="hidden md:block relative mt-4">
                  <div
                    className="relative"
                    style={{
                      width: `${iucnStatuses.length * 48 + (iucnStatuses.length - 1) * 32}px`
                    }}
                  >
                    {/* Extinct label - left aligned */}
                    <span className="absolute left-0 text-sm text-gray-600" style={{ top: '20px' }}>
                      Extinct
                    </span>

                    {/* Threatened label with bracket - spanning CR, EN, VU */}
                    <div
                      className="absolute flex flex-col items-center"
                      style={{
                        left: `${2 * 48 + 2 * 32}px`,
                        width: `${3 * 48 + 2 * 32}px`
                      }}
                    >
                      <Bracket width={3 * 48 + 2 * 32} className="text-gray-400" />
                      <span className="text-sm text-gray-600 mt-1">Threatened</span>
                    </div>

                    {/* Least Concern label - right aligned */}
                    <span className="absolute right-0 text-sm text-gray-600" style={{ top: '20px' }}>
                      Least Concern
                    </span>

                    {/* Spacer to maintain height */}
                    <div style={{ height: '40px' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Vertical divider between IUCN and DD/NE - hidden on mobile */}
            {specialStatuses.length > 0 && iucnStatuses.length > 0 && (
              <div className="hidden md:block w-px h-12 bg-gray-400 mx-4 self-center"></div>
            )}
            
            {/* DD and NE group - complete with bubbles and labels */}
            {specialStatuses.length > 0 && (
              <div className="flex flex-col items-start mt-8 md:mt-0 w-full md:w-auto">
                {/* DD and NE bubbles - same sizing as IUCN bubbles */}
                <div className="flex items-center justify-start w-full md:w-auto">
                  {specialStatuses.map((status, index) => {
                    const isActive = isStatusActive(status.abbreviation);
                    return (
                      <div key={status.id} className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`relative z-10 flex aspect-square items-center justify-center rounded-full cursor-pointer flex-[2_2_0%] min-w-[32px] min-h-[32px] max-w-[48px] max-h-[48px] md:flex-none md:h-12 md:w-12 ${isActive ? 'outline-2 outline-offset-[3px] outline-dotted' : 'border-2'} ${getStatusColor(status.abbreviation, isActive)}`}
                            >
                              <span className="font-bold text-[clamp(0.75rem,2vw,0.875rem)] md:text-sm">{status.abbreviation}</span>
                            </div>
                          </TooltipTrigger>
                          {status.definition && (
                            <TooltipContent className="max-w-xs">
                              <div className="flex flex-col gap-1.5">
                                <div className="font-bold text-base leading-tight">{status.status}</div>
                                <div className="text-sm text-gray-600 font-normal leading-relaxed">
                                  {status.definition}
                                </div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                        {index < specialStatuses.length - 1 && (
                          <div className="h-px bg-gray-300 flex-[1_1_0%] min-w-[8px] max-w-[32px] md:flex-none md:w-8 -mx-[6px] md:-mx-0 relative z-0"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Lacks Data label with bracket - responsive sizing */}
                {/* Mobile label */}
                <div className="flex flex-col items-start mt-3 md:hidden w-full">
                  <div className="w-full" style={{ maxWidth: '80px' }}>
                    <Bracket
                      width={containerWidth > 0 ? Math.min(containerWidth * 0.2, 80) : 80}
                      className="text-gray-400"
                    />
                    <span className="text-xs text-gray-600 mt-1">Lacks Data</span>
                  </div>
                </div>

                {/* Desktop label */}
                <div className="hidden md:flex md:flex-col md:items-start mt-4">
                  <div
                    style={{
                      width: `${specialStatuses.length * 48 + (specialStatuses.length - 1) * 32}px`
                    }}
                  >
                    <Bracket
                      width={specialStatuses.length * 48 + (specialStatuses.length - 1) * 32}
                      className="text-gray-400"
                    />
                    <span className="text-sm text-gray-600 mt-1">Lacks Data</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* Environmental & Manmade Threats Subsection - After bubbles */}
      {threats && (
        <div className="mt-8 md:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-9 gap-4">
            <div className="col-span-1 md:col-span-5">
              <div className="w-full mb-6 md:mb-8">
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Environmental & Manmade Threats</h3>
              <div className="text-base md:text-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {threats}
                </ReactMarkdown>
              </div>
              {threatTags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {threatTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-2 px-4 py-2 text-sm border-gray-300 rounded-md bg-green-500/10"
                    >
                      {tag.icon && (
                        <span
                          className="w-5 h-5 flex-shrink-0"
                          dangerouslySetInnerHTML={{ __html: tag.icon }}
                        />
                      )}
                      <span>{tag.name}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden md:block md:col-span-1" />
            <div className="hidden md:block md:col-span-3">
              {/* Future content */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

