import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
}

export default function Conservation({
  description,
  statuses,
  currentStatus,
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

  // Combine all statuses in order: DD, NE, [divider], EX, EW, CR, EN, VU, NT, LC
  const allStatuses = [...specialStatuses, ...iucnStatuses];

  const isStatusActive = (abbreviation: string) => {
    return currentStatus.code === abbreviation;
  };

  return (
    <section id="conservation" className="scroll-m-20 pb-12">
      <h2 className="text-5xl font-bold mb-2">Conservation</h2>
      
      <div className="mt-12">
        <div className="w-full mb-8">
          <div className="w-full h-px bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-9 gap-4">
          {/* Left content area - Description */}
          <div className="col-span-5">
            {description && (
              <>
                <h3 className="text-3xl font-bold mb-3">Conservation Status</h3>
                <div className="text-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                  </ReactMarkdown>
                </div>
                <div className="mt-4 text-base">
                  <p>IUCN Red List Status: {currentStatus.status}</p>
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
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                          isActive
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-black border-black text-white'
                        }`}
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
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-black border-black text-white'
                      }`}
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
        
        {/* Labels row */}
        <div className="flex items-start mt-2 relative">
          {/* Lacks Data label - centered under DD and NE */}
          {specialStatuses.length > 0 && (
            <div 
              className="text-sm text-gray-600 absolute"
              style={{ 
                left: `${(specialStatuses.length - 1) * 80 + 24}px`, 
                transform: 'translateX(-50%)' 
              }}
            >
              Lacks Data
            </div>
          )}
          
          {/* IUCN Status labels */}
          {iucnStatuses.length > 0 && (
            <>
              {/* Calculate starting position of IUCN statuses */}
              {(() => {
                // Each bubble is 48px (w-12), each connector is 32px (w-8)
                // Vertical divider is 1px (w-px) + 32px margins (mx-4 = 1rem each side)
                const bubbleWidth = 48;
                const connectorWidth = 32;
                const dividerWidth = 1 + 32; // w-px (1px) + mx-4 (1rem = 16px each side = 32px total)
                
                const specialStatusesWidth = specialStatuses.length > 0 
                  ? specialStatuses.length * bubbleWidth + (specialStatuses.length - 1) * connectorWidth + dividerWidth
                  : 0;
                
                const iucnStart = specialStatusesWidth;
                // Each IUCN bubble+connector pair is 80px (48 + 32)
                const bubbleConnectorPair = bubbleWidth + connectorWidth;
                
                return (
                  <>
                    {/* Extinct - under EX (index 0) */}
                    <div 
                      className="text-sm text-gray-600 absolute"
                      style={{ 
                        left: `${iucnStart + bubbleWidth / 2}px`, 
                        transform: 'translateX(-50%)' 
                      }}
                    >
                      Extinct
                    </div>
                    
                    {/* Threatened - centered under CR, EN, VU (indices 2, 3, 4) - center at EN (index 3) */}
                    <div 
                      className="text-sm text-gray-600 absolute"
                      style={{ 
                        left: `${iucnStart + 3 * bubbleConnectorPair + bubbleWidth / 2}px`, 
                        transform: 'translateX(-50%)' 
                      }}
                    >
                      Threatened
                    </div>
                    
                    {/* Least Concern - under LC (index 6) */}
                    <div 
                      className="text-sm text-gray-600 absolute"
                      style={{ 
                        left: `${iucnStart + 6 * bubbleConnectorPair + bubbleWidth / 2}px`, 
                        transform: 'translateX(-50%)' 
                      }}
                    >
                      Least Concern
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

