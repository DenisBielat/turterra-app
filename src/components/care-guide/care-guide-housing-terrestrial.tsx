'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { CareGuideShopButton } from './care-guide-shop-button';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

interface TerrestrialEnclosureSize {
  scenario: string;
  size_range: string | null;
  dimensions: string | null;
  min_sq_ft: number | null;
  notes: string | null;
}

interface CareGuideHousingTerrestrialProps {
  introText: string | null;
  enclosureSizes: TerrestrialEnclosureSize[];
  outdoorTitle: string | null;
  outdoorDescription: string | null;
  outdoorTips: string[];
  indoorTitle: string | null;
  indoorDescription: string | null;
  indoorTips: string[];
  essentials: string[];
  commonMistakes: string[];
  cohabitationNotes: string | null;
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideHousingTerrestrial({
  introText,
  enclosureSizes,
  outdoorTitle,
  outdoorDescription,
  outdoorTips,
  indoorTitle,
  indoorDescription,
  indoorTips,
  essentials,
  commonMistakes,
  cohabitationNotes,
}: CareGuideHousingTerrestrialProps) {
  const hasOutdoor = outdoorDescription || outdoorTips.length > 0;
  const hasIndoor = indoorDescription || indoorTips.length > 0;
  const hasContent =
    introText ||
    enclosureSizes.length > 0 ||
    hasOutdoor ||
    hasIndoor ||
    essentials.length > 0 ||
    commonMistakes.length > 0 ||
    cohabitationNotes;

  if (!hasContent) return null;

  const { activeSection } = useCareGuideActiveSection();

  return (
    <section id="housing" className="scroll-mt-40">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Housing & Enclosure
        </h2>
        <CareGuideShopButton productCategorySlug="enclosure" className="flex-shrink-0" />
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Minimum Enclosure Sizing table */}
      {enclosureSizes.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-green-900/10 px-5 py-3">
            <h3 className="font-heading font-bold text-black text-lg">
              Minimum Enclosure Sizing
            </h3>
          </div>
          <div className="px-5 py-2">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <tbody>
                  {enclosureSizes.map((size, i) => (
                    <tr key={i} className={i < enclosureSizes.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="py-3 pr-4 font-semibold text-black">{size.scenario}</td>
                      <td className="py-3 pr-4 text-gray-700">{size.size_range ?? '—'}</td>
                      <td className="py-3 pr-4 font-bold text-gray-700">{size.dimensions ?? '—'}</td>
                      <td className="py-3 pr-4 font-bold text-green-700">
                        {size.min_sq_ft != null ? `${size.min_sq_ft}+ sq ft` : '—'}
                      </td>
                      <td className="py-3 text-gray-500 text-sm">{size.notes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Outdoor & Indoor Enclosure cards — side by side */}
      {(hasOutdoor || hasIndoor) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Outdoor Enclosure */}
          {hasOutdoor && (
            <div className="rounded-xl border border-green-600 bg-green-500/10 shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="outdoor" style="line" size="base" className="text-green-800" />
                <h3 className="font-heading font-bold text-black text-lg">
                  {outdoorTitle ?? 'Outdoor Enclosure'}
                </h3>
              </div>
              {outdoorDescription && (
                <div className="text-base text-gray-700 mb-3">
                  <CareGuideMarkdown>{outdoorDescription}</CareGuideMarkdown>
                </div>
              )}
              {outdoorTips.length > 0 && (
                <ul className="space-y-2">
                  {outdoorTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                      <CareGuideMarkdown inline>{tip}</CareGuideMarkdown>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Indoor Enclosure */}
          {hasIndoor && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="indoor" style="line" size="base" className="text-gray-700" />
                <h3 className="font-heading font-bold text-black text-lg">
                  {indoorTitle ?? 'Indoor Enclosure'}
                </h3>
              </div>
              {indoorDescription && (
                <div className="text-base text-gray-700 mb-3">
                  <CareGuideMarkdown>{indoorDescription}</CareGuideMarkdown>
                </div>
              )}
              {indoorTips.length > 0 && (
                <ul className="space-y-2">
                  {indoorTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                      <CareGuideMarkdown inline>{tip}</CareGuideMarkdown>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Essentials & Common Mistakes — side by side */}
      {(essentials.length > 0 || commonMistakes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Enclosure Essentials */}
          {essentials.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="checkmark" style="filled" size="base" className="text-green-700" />
                <h3 className="font-heading font-bold text-black text-lg">
                  Enclosure Essentials
                </h3>
              </div>
              <ul className="space-y-2">
                {essentials.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                    <CareGuideMarkdown inline>{item}</CareGuideMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="warning" style="line" size="base" className="text-red-500" />
                <h3 className="font-heading font-bold text-black text-lg">
                  Common Mistakes
                </h3>
              </div>
              <ul className="space-y-2">
                {commonMistakes.map((item, i) => (
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

      {/* A Note on Cohabitation callout */}
      {cohabitationNotes && (
        <CareGuideCallout variant="amber" title="A Note on Cohabitation" dimmed={activeSection !== 'housing'}>
          {cohabitationNotes}
        </CareGuideCallout>
      )}
    </section>
  );
}
