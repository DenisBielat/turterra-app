'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

interface CareGuideHandlingProps {
  introText: string | null;
  dos: string[];
  donts: string[];
  salmonellaWarning: string | null;
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideHandling({
  introText,
  dos,
  donts,
  salmonellaWarning,
}: CareGuideHandlingProps) {
  const hasContent = introText || dos.length > 0 || donts.length > 0 || salmonellaWarning;
  if (!hasContent) return null;

  const { activeSection } = useCareGuideActiveSection();

  return (
    <section id="handling" className="scroll-mt-40">
      {/* Section header */}
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-black mb-4">
        Handling & Interaction
      </h2>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Do's & Don'ts — side by side */}
      {(dos.length > 0 || donts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Do's */}
          {dos.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="checkmark" style="filled" size="base" className="text-green-700" />
                <h3 className="font-heading font-bold text-black text-lg">Do</h3>
              </div>
              <ul className="space-y-2">
                {dos.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                    <CareGuideMarkdown inline>{item}</CareGuideMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Don'ts */}
          {donts.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="close" style="filled" size="base" className="text-red-500" />
                <h3 className="font-heading font-bold text-black text-lg">Don&apos;t</h3>
              </div>
              <ul className="space-y-2">
                {donts.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                    <CareGuideMarkdown inline>{item}</CareGuideMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Salmonella Warning callout */}
      {salmonellaWarning && (
        <CareGuideCallout variant="red" title="Salmonella Warning" dimmed={activeSection !== 'handling'}>
          {salmonellaWarning}
        </CareGuideCallout>
      )}
    </section>
  );
}
