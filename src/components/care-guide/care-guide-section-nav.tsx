'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/Icon';
import type { IconNameMap } from '@/types/icons';

export interface NavSection {
  id: string;
  label: string;
  icon: IconNameMap['line'];
}

const DEFAULT_SECTIONS: NavSection[] = [
  { id: 'at-a-glance', label: 'At a Glance', icon: 'at-a-glance' },
  { id: 'housing', label: 'Housing & Enclosure', icon: 'enclosure' },
  { id: 'lighting', label: 'Lighting & UVB', icon: 'lighting' },
  { id: 'temperature', label: 'Temps & Heating', icon: 'temperature' },
  { id: 'water', label: 'Water Quality', icon: 'water' },
  { id: 'diet', label: 'Diet & Nutrition', icon: 'diet' },
  { id: 'handling', label: 'Handling', icon: 'handling' },
  { id: 'health', label: 'Health & Issues', icon: 'health' },
  { id: 'shopping-checklist', label: 'Shopping Checklist', icon: 'shop' },
  { id: 'references', label: 'References', icon: 'book-open' },
];

interface CareGuideSectionNavProps {
  sections?: NavSection[];
}

export function CareGuideSectionNav({ sections = DEFAULT_SECTIONS }: CareGuideSectionNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

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
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 140;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 lg:px-10">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-green-950 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon name={section.icon} style="line" size="sm" />
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
