'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { useCareGuideActiveSection } from './care-guide-active-section-context';
import type { NavSection } from './care-guide-section-nav';

interface RelatedGuide {
  slug: string;
  commonName: string;
}

interface CareGuideSidebarProps {
  sections: NavSection[];
  relatedGuides?: RelatedGuide[];
  commonName: string;
  imageUrl: string;
  /** Species slug for the Species Guide link (turtle-guide/[slug]); button hidden if null */
  speciesSlug?: string | null;
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

export function CareGuideSidebar({
  sections,
  relatedGuides = [],
  commonName,
  imageUrl,
  speciesSlug = null,
}: CareGuideSidebarProps) {
  const { activeSection } = useCareGuideActiveSection();

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
    <aside className="hidden lg:block h-full">
      <div className="sticky top-36 rounded-2xl w-full max-w-[17rem]">
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
          <div className="flex flex-row gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon name="print" style="line" size="sm" />
              Print
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: document.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon name="share" style="line" size="sm" />
              Share
            </button>
          </div>
          {speciesSlug && (
            <Link
              href={`/turtle-guide/${speciesSlug}`}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors"
            >
              <Image
                src="/images/nav-menu-icons/species-guide.png"
                alt=""
                width={24}
                height={24}
                className="flex-shrink-0 w-6 h-6 object-contain"
              />
              <div className="flex-1 min-w-0">
                <span className="font-heading font-bold text-gray-900 block text-sm">Species Guide</span>
                <span className="text-xs text-gray-600 block">
                  Learn about {commonName.endsWith('s') ? commonName : `${commonName}s`}.
                </span>
              </div>
              <Icon name="arrow-right-1" style="line" size="base" className="text-gray-600 flex-shrink-0" />
            </Link>
          )}
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
