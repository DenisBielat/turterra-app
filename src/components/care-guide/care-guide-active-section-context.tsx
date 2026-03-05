'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { NavSection } from './care-guide-section-nav';

interface CareGuideActiveSectionContextValue {
  activeSection: string;
  sections: NavSection[];
  /** When set, Product Guide should open this category (slug); consumed then cleared */
  requestedProductCategory: string | null;
  setRequestedProductCategory: (slug: string | null) => void;
}

const CareGuideActiveSectionContext = createContext<CareGuideActiveSectionContextValue | null>(null);

interface CareGuideActiveSectionProviderProps {
  sections: NavSection[];
  children: React.ReactNode;
}

/**
 * Tracks which section is "active" based on scroll (same logic as sidebar nav).
 * Callouts use this to dim when their section is not active.
 * Also supports requestedProductCategory so Shop buttons can request a category to open without URL delay.
 */
export function CareGuideActiveSectionProvider({ sections, children }: CareGuideActiveSectionProviderProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const [requestedProductCategory, setRequestedProductCategory] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    const OFFSET = 160;
    let current = sections[0]?.id ?? '';
    let minDistance = Infinity;

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      const distance = Math.abs(el.getBoundingClientRect().top - OFFSET);
      if (distance < minDistance) {
        minDistance = distance;
        current = section.id;
      }
    }

    setActiveSection(current);
  }, [sections]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return (
    <CareGuideActiveSectionContext.Provider value={{ activeSection, sections, requestedProductCategory, setRequestedProductCategory }}>
      {children}
    </CareGuideActiveSectionContext.Provider>
  );
}

export function useCareGuideActiveSection(): CareGuideActiveSectionContextValue {
  const ctx = useContext(CareGuideActiveSectionContext);
  if (!ctx) {
    return {
      activeSection: '',
      sections: [],
      requestedProductCategory: null,
      setRequestedProductCategory: () => {},
    };
  }
  return ctx;
}
