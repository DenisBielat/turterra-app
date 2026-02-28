'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import type { NavSection } from './care-guide-section-nav';

interface RelatedGuide {
  slug: string;
  commonName: string;
}

interface CareGuideSidebarProps {
  sections: NavSection[];
  relatedGuides?: RelatedGuide[];
}

export function CareGuideSidebar({ sections, relatedGuides = [] }: CareGuideSidebarProps) {
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
    <aside className="hidden lg:block">
      <div className="sticky top-36">
        {/* On This Page nav */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            On This Page
          </h3>
          <div className="flex flex-col gap-0.5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-green-950 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon
                  name={section.icon}
                  style="line"
                  size="sm"
                />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Icon name="book-open" style="line" size="sm" />
            Print Guide
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: document.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Icon name="expand" style="line" size="sm" />
            Share Guide
          </button>
        </div>

        {/* Related care guides */}
        {relatedGuides.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Related Care Guides
            </h3>
            <div className="flex flex-col gap-1">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/learn/${guide.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Icon name="turtle" style="line" size="sm" className="text-green-700" />
                  {guide.commonName}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
