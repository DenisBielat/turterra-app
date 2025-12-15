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

  const isStatusActive = (abbreviation: string) => {
    return currentStatus.code === abbreviation;
  };

  return (
    <section id="conservation" className="scroll-m-20 pb-12">
      <h2 className="text-5xl font-bold mb-2">Conservation</h2>
      
      <div className="mt-12">
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
        <div className="flex items-start mt-2">
          {/* Lacks Data label - left aligned under DD and NE section */}
          {specialStatuses.length > 0 && (
            <>
              <div
                className="text-sm text-gray-600 text-left"
                style={{
                  width: `${specialStatuses.length * 48 + (specialStatuses.length - 1) * 32}px`
                }}
              >
                Lacks Data
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
              className="flex text-sm text-gray-600"
              style={{
                width: `${iucnStatuses.length * 48 + (iucnStatuses.length - 1) * 32}px`
              }}
            >
              {/* Extinct - left aligned */}
              <span className="text-left">Extinct</span>

              {/* Threatened - centered */}
              <span className="flex-1 text-center">Threatened</span>

              {/* Least Concern - right aligned */}
              <span className="text-right">Least Concern</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

