import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import SpeciesSelector from './SpeciesSelector';

const TurtleDistributionMap = dynamic(
  () => import('./TurtleDistributionMap'),
  { 
    loading: () => <div className="h-96 md:h-[600px] bg-gray-100 rounded-lg animate-pulse" />,
    ssr: false 
  }
);

export const LazyTurtleMap = ({ currentSpeciesId }: { currentSpeciesId?: string | number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<(string | number)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSpeciesId) {
      console.log('LazyTurtleMap: Setting initial species ID:', currentSpeciesId);
      setSelectedSpeciesIds([currentSpeciesId]);
    }
  }, [currentSpeciesId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log('LazyTurtleMap: Map is now visible, loading components');
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <>
          <TurtleDistributionMap selectedSpeciesIds={selectedSpeciesIds} />
          <SpeciesSelector 
            onChange={setSelectedSpeciesIds} 
            initialSelectedIds={selectedSpeciesIds}
          />
        </>
      ) : (
        <div className="h-96 md:h-[600px] bg-gray-100 rounded-lg animate-pulse" />
      )}
    </div>
  );
};