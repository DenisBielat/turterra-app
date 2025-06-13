'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ExtendedWrapperProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
}

const ExtendedWrapper: React.FC<ExtendedWrapperProps> = ({ 
  children, 
  className = '', 
  backgroundColor = 'bg-green-950' 
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState<React.CSSProperties>({});

  const extendFullWidth = () => {
    if (!wrapperRef.current) return;
  
    const item = wrapperRef.current;
    const parent = item.parentElement;
    
    if (!parent) return;
  
    // Use clientWidth instead of innerWidth to exclude scrollbar
    const windowWidth = document.documentElement.clientWidth;
    const parentRect = parent.getBoundingClientRect();
    const parentOffsetLeft = parentRect.left + window.scrollX;
    
    const newStyles: React.CSSProperties = {
      width: windowWidth,
      left: 'unset',
      marginLeft: -parentOffsetLeft,
      marginRight: -(windowWidth - parent.offsetWidth - parentOffsetLeft),
    };
    
    setStyles(newStyles);
  };

  useEffect(() => {
    // Initial calculation
    extendFullWidth();

    // Add resize listener
    const handleResize = () => {
      extendFullWidth();
    };

    window.addEventListener('resize', handleResize);
    
    // Also recalculate on scroll in case of any layout shifts
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    <div 
      ref={wrapperRef}
      className={`relative ${backgroundColor} ${className}`}
      style={styles}
    >
      {children}
    </div>
  );
};

export default ExtendedWrapper;