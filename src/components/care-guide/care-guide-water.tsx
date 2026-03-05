'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { CareGuideShopButton } from './care-guide-shop-button';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface WaterSchedule {
  tank_size: string;
  frequency: string;
}

interface CareGuideWaterProps {
  introText: string | null;
  filtrationText: string | null;
  filtrationExample: string | null;
  filtrationTips: string[];
  waterChangesText: string | null;
  waterSchedules: WaterSchedule[];
  feedingTip: string | null;
  conditionerTip: string | null;
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideWater({
  introText,
  filtrationText,
  filtrationExample,
  filtrationTips,
  waterChangesText,
  waterSchedules,
  feedingTip,
  conditionerTip,
}: CareGuideWaterProps) {
  const { activeSection } = useCareGuideActiveSection();
  const hasFiltration = filtrationText || filtrationExample || filtrationTips.length > 0;
  const hasWaterChanges = waterChangesText || waterSchedules.length > 0;
  const hasTips = feedingTip || conditionerTip;
  const hasContent = introText || hasFiltration || hasWaterChanges || hasTips;

  if (!hasContent) return null;

  return (
    <section id="water" className="scroll-mt-40">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Water Quality & Maintenance
        </h2>
        <CareGuideShopButton productCategorySlug="filtration" className="flex-shrink-0" />
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Filtration + Water Changes cards — side by side */}
      {(hasFiltration || hasWaterChanges) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Filtration card */}
          {hasFiltration && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Icon name="water-filter-flex-line" style="line" size="base" className="text-black" />
                <h3 className="font-heading font-bold text-black text-lg">
                  Filtration
                </h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                {filtrationText && (
                  <div className="text-base text-gray-700 leading-relaxed">
                    <CareGuideMarkdown>{filtrationText}</CareGuideMarkdown>
                  </div>
                )}
                {filtrationExample && (
                  <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                    <p className="text-sm font-bold text-blue-800 mb-1">Example</p>
                    <p className="text-sm font-semibold text-blue-800">{filtrationExample}</p>
                  </div>
                )}
                {filtrationTips.length > 0 && (
                  <ul className="space-y-2">
                    {filtrationTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                        <CareGuideMarkdown inline>{tip}</CareGuideMarkdown>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Water Changes card */}
          {hasWaterChanges && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Icon name="water-drop-flex-line" style="line" size="base" className="text-black" />
                <h3 className="font-heading font-bold text-black text-lg">
                  Water Changes
                </h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                {waterChangesText && (
                  <div className="text-base text-gray-700 leading-relaxed">
                    <CareGuideMarkdown>{waterChangesText}</CareGuideMarkdown>
                  </div>
                )}
                {waterSchedules.length > 0 && (
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider text-xs">
                            Tank Size
                          </th>
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 uppercase tracking-wider text-xs">
                            Frequency
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {waterSchedules.map((schedule, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 text-base font-medium text-gray-800">
                              {schedule.tank_size}
                            </td>
                            <td className="px-4 py-2.5 text-base font-bold text-gray-700">
                              {schedule.frequency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pro-tip callouts */}
      {hasTips && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedingTip && (
            <CareGuideCallout variant="blue" title="Feed in a Separate Container" dimmed={activeSection !== 'water'}>
              {feedingTip}
            </CareGuideCallout>
          )}
          {conditionerTip && (
            <CareGuideCallout variant="green" title="Water Conditioner" dimmed={activeSection !== 'water'}>
              {conditionerTip}
            </CareGuideCallout>
          )}
        </div>
      )}
    </section>
  );
}
