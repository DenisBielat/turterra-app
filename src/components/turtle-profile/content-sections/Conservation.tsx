import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';

// Bracket component for grouping status bubbles with their labels
interface BracketProps {
  width: number;
  className?: string;
}

function Bracket({ width, className = '' }: BracketProps) {
  const height = 20;
  const strokeWidth = 1.5;
  const cornerRadius = 6;
  const centerX = width / 2;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left horizontal line */}
      <path
        d={`M 0 ${strokeWidth / 2} H ${centerX - cornerRadius}`}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Left corner curve */}
      <path
        d={`M ${centerX - cornerRadius} ${strokeWidth / 2} Q ${centerX} ${strokeWidth / 2} ${centerX} ${strokeWidth / 2 + cornerRadius}`}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Center vertical line */}
      <path
        d={`M ${centerX} ${strokeWidth / 2 + cornerRadius} V ${height}`}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Right corner curve */}
      <path
        d={`M ${centerX} ${strokeWidth / 2 + cornerRadius} Q ${centerX} ${strokeWidth / 2} ${centerX + cornerRadius} ${strokeWidth / 2}`}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Right horizontal line */}
      <path
        d={`M ${centerX + cornerRadius} ${strokeWidth / 2} H ${width}`}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
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
    switch (abbreviation) {
      // Extinct categories - red
      case 'EX':
      case 'EW':
        return 'bg-red-500 border-red-500 text-white';
      
      // Threatened categories - orange
      case 'CR':
      case 'EN':
      case 'VU':
        return 'bg-orange-500 border-orange-500 text-white';
      
      // Near Threatened and Least Concern - green
      case 'NT':
      case 'LC':
        return 'bg-green-800 border-green-800 text-white';
      
      // Lacks Data - gray
      case 'DD':
      case 'NE':
        return 'bg-gray-500 border-gray-500 text-white';
      
      // Default fallback
      default:
        return 'bg-black border-black text-white';
    }
  };

  return (
    <section id="conservation" className="scroll-m-20 pb-12">
      <h2 className="text-5xl font-bold mb-2">Conservation</h2>
      
      <div className="mt-12">
        <div className="grid grid-cols-9 gap-4">
          {/* Left content area - Description */}
          <div className="col-span-5 space-y-12">
            {description && (
              <>
                <div>
                  <h3 className="text-3xl font-bold mb-3">Status</h3>
                  <div className="text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {description}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-4 text-base">
                    <p><span className="font-bold">IUCN Red List Status:</span> {currentStatus.status}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Empty column for spacing */}
          <div className="col-span-1" />

          {/* Right content area - reserved for future use */}
          <div className="col-span-3">
            {/* Future content */}
          </div>
        </div>
      </div>

      {/* Status Bubbles - Full width, outside grid */}
      <div className="mt-12 w-full">
        <div className="flex items-center">
          {/* DD and NE bubbles - disconnected group */}
          {specialStatuses.length > 0 && (
            <>
              <div className="flex items-center">
                {specialStatuses.map((status, index) => {
                  const isActive = isStatusActive(status.abbreviation);
                  return (
                    <div key={status.id} className="flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${getStatusColor(status.abbreviation, isActive)}`}
                      >
                        <span className="font-bold text-sm">{status.abbreviation}</span>
                      </div>
                      {index < specialStatuses.length - 1 && (
                        <div className="h-px w-8 bg-gray-300"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Vertical divider between DD/NE and IUCN statuses */}
              {iucnStatuses.length > 0 && (
                <div className="w-px h-12 bg-gray-400 mx-4"></div>
              )}
            </>
          )}
          
          {/* IUCN Status bubbles - connected group */}
          {iucnStatuses.length > 0 && (
            <div className="flex items-center">
              {iucnStatuses.map((status, index) => {
                const isActive = isStatusActive(status.abbreviation);
                return (
                  <div key={status.id} className="flex items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${getStatusColor(status.abbreviation, isActive)}`}
                    >
                      <span className="font-bold text-sm">{status.abbreviation}</span>
                    </div>
                    {index < iucnStatuses.length - 1 && (
                      <div className="h-px w-8 bg-gray-300"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Labels row with brackets */}
        <div className="flex items-start mt-4">
          {/* Lacks Data label with bracket - centered under DD and NE section */}
          {specialStatuses.length > 0 && (
            <>
              <div
                className="flex flex-col items-center"
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

              {/* Spacer matching the vertical divider */}
              {iucnStatuses.length > 0 && (
                <div className="mx-4" style={{ width: '1px' }}></div>
              )}
            </>
          )}

          {/* IUCN Status labels - positioned across the IUCN bubbles section */}
          {iucnStatuses.length > 0 && (
            <div
              className="relative"
              style={{
                width: `${iucnStatuses.length * 48 + (iucnStatuses.length - 1) * 32}px`
              }}
            >
              {/* Extinct label - left aligned */}
              <span className="absolute left-0 text-sm text-gray-600" style={{ top: '12px' }}>
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
              <span className="absolute right-0 text-sm text-gray-600" style={{ top: '12px' }}>
                Least Concern
              </span>

              {/* Spacer to maintain height for absolute positioned elements */}
              <div style={{ height: '44px' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Environmental & Manmade Threats Subsection - After bubbles */}
      {threats && (
        <div className="mt-12">
          <div className="grid grid-cols-9 gap-4">
            <div className="col-span-5">
              <div className="w-full mb-8">
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              <h3 className="text-3xl font-bold mb-3">Environmental & Manmade Threats</h3>
              <div className="text-base">
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
            <div className="col-span-1" />
            <div className="col-span-3">
              {/* Future content */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

