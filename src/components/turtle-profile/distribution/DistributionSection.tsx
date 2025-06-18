'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with no SSR
const TurtleDistributionMap = dynamic(
  () => import('./TurtleDistributionMap'),
  { 
    loading: () => (
      <div className="h-96 md:h-[600px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading map...</div>
      </div>
    ),
    ssr: false 
  }
);

interface DistributionSectionProps {
  currentSpeciesId?: string | number;
}

const DistributionSection = ({ currentSpeciesId }: DistributionSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { 
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: '100px' // Start loading 100px before the component comes into view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={containerRef}>
      {isVisible ? (
        <TurtleDistributionMap currentSpeciesId={currentSpeciesId} />
      ) : (
        <div className="h-96 md:h-[600px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-400">Map will load when scrolled into view</div>
        </div>
      )}
    </div>
  );
};

export default DistributionSection;