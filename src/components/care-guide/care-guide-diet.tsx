'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { CareGuideShopButton } from './care-guide-shop-button';
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
  subtitleText?: string | null;
  feedingSchedules: FeedingSchedule[];
  portionProtein: string | null;
  portionVegetables: string | null;
  portionPellets: string | null;
  proteinFoods?: string[];
  vegetableFoods?: string[];
  calciumSupplements: string | null;
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

/** Percentage pill for table cells */
function Pill({ value, variant }: { value: number; variant: 'protein' | 'vegetable' }) {
  const isProtein = variant === 'protein';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${
        isProtein ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}
    >
      {value}%
    </span>
  );
}

/** A single portion-size card (Protein, Vegetables, Pellets) with definition. */
function PortionCard({
  label,
  description,
  iconName,
}: {
  label: string;
  description: string;
  iconName: 'shrimp-line' | 'vegetable-line' | 'diet' | 'pellets';
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-warm p-5 flex flex-col items-center text-center min-h-[100px] justify-center">
      <Icon name={iconName} style="line" size="base" className="text-gray-700 mb-2" />
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">{label}</p>
      <p className="text-base text-gray-800">{description}</p>
    </div>
  );
}

/** Protein or Vegetable foods card with icon and two-column list. */
function FoodListCard({
  title,
  items,
  iconName,
  bulletColor,
}: {
  title: string;
  items: string[];
  iconName: 'shrimp-line' | 'vegetable-line';
  bulletColor: string;
}) {
  if (items.length === 0) return null;
  const mid = Math.ceil(items.length / 2);
  const col1 = items.slice(0, mid);
  const col2 = items.slice(mid);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name={iconName} style="line" size="base" className="text-black flex-shrink-0" />
        <h3 className="font-heading font-bold text-black text-lg">{title}</h3>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-base text-gray-700">
        {col1.map((item, i) => (
          <li key={`a-${i}`} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${bulletColor}`} />
            {item}
          </li>
        ))}
        {col2.map((item, i) => (
          <li key={`b-${i}`} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${bulletColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideDiet({
  introText,
  subtitleText,
  feedingSchedules,
  portionProtein,
  portionVegetables,
  portionPellets,
  proteinFoods = [],
  vegetableFoods = [],
  calciumSupplements,
}: CareGuideDietProps) {
  const { activeSection } = useCareGuideActiveSection();
  const hasPortions = portionProtein || portionVegetables || portionPellets;
  const hasFoodLists = proteinFoods.length > 0 || vegetableFoods.length > 0;
  const hasContent =
    introText ||
    subtitleText ||
    feedingSchedules.length > 0 ||
    hasPortions ||
    hasFoodLists ||
    calciumSupplements;

  if (!hasContent) return null;

  return (
    <section id="diet" className="scroll-mt-40">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
            Diet & Nutrition
          </h2>
          {subtitleText && (
            <p className="text-base text-gray-500 mt-1">{subtitleText}</p>
          )}
        </div>
        <CareGuideShopButton productCategorySlug="food" className="flex-shrink-0" />
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Feeding Schedule by Age — table with title row + column labels */}
      {feedingSchedules.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-green-900/20">
                <th colSpan={5} className="text-left px-4 py-3 font-heading font-bold text-black text-lg">
                  Feeding Schedule by Age
                </th>
              </tr>
              <tr className="bg-white">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Life Stage</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Protein</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Vegetables</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Protein Frequency</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Veggie Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedingSchedules.map((schedule) => (
                <tr key={schedule.life_stage}>
                  <td className="px-4 py-3 font-medium text-gray-800">{schedule.life_stage}</td>
                  <td className="px-4 py-3">
                    {schedule.protein_pct != null ? (
                      <Pill value={schedule.protein_pct} variant="protein" />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {schedule.vegetable_pct != null ? (
                      <Pill value={schedule.vegetable_pct} variant="vegetable" />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{schedule.protein_frequency ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{schedule.vegetable_frequency ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Portion Sizes — white container with food-type boxes inside (bg-warm) */}
      {hasPortions && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden p-5">
          <h3 className="font-heading font-bold text-black text-lg mb-4">Portion Sizes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {portionProtein && (
              <PortionCard
                label="Protein"
                description={portionProtein}
                iconName="shrimp-line"
              />
            )}
            {portionVegetables && (
              <PortionCard
                label="Vegetables"
                description={portionVegetables}
                iconName="vegetable-line"
              />
            )}
            {portionPellets && (
              <PortionCard
                label="Pellets"
                description={portionPellets}
                iconName="pellets"
              />
            )}
          </div>
        </div>
      )}

      {/* Protein Foods & Vegetable Foods — side by side */}
      {hasFoodLists && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <FoodListCard
            title="Protein Foods"
            items={proteinFoods}
            iconName="shrimp-line"
            bulletColor="bg-red-500"
          />
          <FoodListCard
            title="Vegetable Foods"
            items={vegetableFoods}
            iconName="vegetable-line"
            bulletColor="bg-green-500"
          />
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
