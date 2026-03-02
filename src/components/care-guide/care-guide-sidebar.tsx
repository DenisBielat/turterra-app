'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  commonName: string;
  scientificName: string;
  imageUrl: string;
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

export function CareGuideSidebar({
  sections,
  relatedGuides = [],
  commonName,
  scientificName,
  imageUrl,
}: CareGuideSidebarProps) {
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-36 rounded-2xl w-full max-w-[15rem]">
        {/* Profile image + name */}
        <div className="flex flex-col gap-3 items-center text-center mb-6">
          <Image
            src={imageUrl || PLACEHOLDER_IMAGE}
            alt={`Profile image of ${commonName}`}
            width={160}
            height={160}
            className="rounded-full w-40 h-40 object-cover aspect-square"
            sizes="160px"
          />
          <h5 className="font-heading font-bold text-2xl">{commonName}</h5>
          <p className="italic text-gray-700 text-sm">{scientificName}</p>
        </div>

        {/* Section navigation */}
        <div className="flex flex-col gap-2 mb-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold ${
                activeSection === section.id
                  ? 'bg-green-800 text-white'
                  : 'hover:bg-green-800 hover:text-white'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <Icon name={section.icon} style="line" size="base" />
              </div>
              {section.label}
            </button>
          ))}

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold hover:bg-green-800 hover:text-white"
          >
            <div className="w-5 h-5 flex items-center justify-center -rotate-90">
              <Icon name="arrow-right-1" style="line" size="base" />
            </div>
            Back to Top
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Icon name="print" style="line" size="sm" />
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
            <Icon name="share" style="line" size="sm" />
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
