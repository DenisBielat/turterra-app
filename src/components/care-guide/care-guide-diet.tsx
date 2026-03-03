'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface FeedingSchedule {
  life_stage: string;
  protein_pct: number | null;
  vegetable_pct: number | null;
  protein_frequency: string | null;
  vegetable_frequency: string | null;
}

interface CareGuideDietProps {
  introText: string | null;
  feedingSchedules: FeedingSchedule[];
  portionProtein: string | null;
  portionVegetables: string | null;
  portionPellets: string | null;
  calciumSupplements: string | null;
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

/** A single life-stage row in the feeding schedule. */
function FeedingScheduleRow({ schedule }: { schedule: FeedingSchedule }) {
  const proteinPct = schedule.protein_pct ?? 0;
  const vegPct = schedule.vegetable_pct ?? 0;
  const hasBar = proteinPct > 0 || vegPct > 0;

  return (
    <div className="space-y-2">
      <p className="text-base font-bold text-gray-900">{schedule.life_stage}</p>

      {/* Stacked percentage bar */}
      {hasBar && (
        <div className="flex h-7 rounded-lg overflow-hidden">
          {proteinPct > 0 && (
            <div
              className="flex items-center justify-center bg-red-300 text-xs font-bold text-red-900"
              style={{ width: `${proteinPct}%` }}
            >
              {proteinPct}% Protein
            </div>
          )}
          {vegPct > 0 && (
            <div
              className="flex items-center justify-center bg-green-300 text-xs font-bold text-green-900"
              style={{ width: `${vegPct}%` }}
            >
              {vegPct}% Vegetables
            </div>
          )}
        </div>
      )}

      {/* Frequency labels */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
        {schedule.protein_frequency && (
          <span><span className="font-semibold text-gray-700">Protein:</span> {schedule.protein_frequency}</span>
        )}
        {schedule.vegetable_frequency && (
          <span><span className="font-semibold text-gray-700">Vegetables:</span> {schedule.vegetable_frequency}</span>
        )}
      </div>
    </div>
  );
}

/** A single portion-size card. */
function PortionCard({
  label,
  description,
  iconName,
  iconStyle,
}: {
  label: string;
  description: string;
  iconName: string;
  iconStyle: 'line' | 'filled' | 'color';
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 flex flex-col items-center text-center">
      <Icon
        name={iconName as 'diet'}
        style={iconStyle}
        size="xl"
        className="mb-2 text-green-700"
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-700 font-medium">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideDiet({
  introText,
  feedingSchedules,
  portionProtein,
  portionVegetables,
  portionPellets,
  calciumSupplements,
}: CareGuideDietProps) {
  const { activeSection } = useCareGuideActiveSection();
  const hasPortions = portionProtein || portionVegetables || portionPellets;
  const hasContent = introText || feedingSchedules.length > 0 || hasPortions || calciumSupplements;

  if (!hasContent) return null;

  return (
    <section id="diet" className="scroll-mt-40">
      {/* Section header */}
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-black mb-4">
        Diet & Nutrition
      </h2>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Feeding Schedule by Age */}
      {feedingSchedules.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Icon name="calendar" style="line" size="base" className="text-black" />
            <h3 className="font-heading font-bold text-black text-lg">
              Feeding Schedule by Age
            </h3>
          </div>
          <div className="px-5 py-4 space-y-5">
            {feedingSchedules.map((schedule) => (
              <FeedingScheduleRow key={schedule.life_stage} schedule={schedule} />
            ))}
          </div>
        </div>
      )}

      {/* Portion Sizes */}
      {hasPortions && (
        <div className="mb-8">
          <h3 className="font-heading font-bold text-black text-lg mb-3">Portion Sizes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {portionProtein && (
              <PortionCard label="Protein" description={portionProtein} iconName="fish-food" iconStyle="color" />
            )}
            {portionVegetables && (
              <PortionCard label="Vegetables" description={portionVegetables} iconName="vegetables-salad" iconStyle="filled" />
            )}
            {portionPellets && (
              <PortionCard label="Pellets" description={portionPellets} iconName="fish-food" iconStyle="color" />
            )}
          </div>
        </div>
      )}

      {/* Calcium & Supplements callout */}
      {calciumSupplements && (
        <CareGuideCallout variant="green" title="Calcium & Supplements" dimmed={activeSection !== 'diet'}>
          {calciumSupplements}
        </CareGuideCallout>
      )}
    </section>
  );
}
