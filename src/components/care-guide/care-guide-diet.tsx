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
  description: string | null;
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
  /* Terrestrial-specific fields (all optional) */
  compositionProteinPct?: number | null;
  compositionPlantPct?: number | null;
  compositionNote?: string | null;
  foodsToAvoid?: string[];
  commercialDiets?: string[];
  commercialDietsNote?: string | null;
  drinkingWater?: string | null;
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
  compositionProteinPct,
  compositionPlantPct,
  compositionNote,
  foodsToAvoid = [],
  commercialDiets = [],
  commercialDietsNote,
  drinkingWater,
}: CareGuideDietProps) {
  const { activeSection } = useCareGuideActiveSection();
  const hasPortions = portionProtein || portionVegetables || portionPellets;
  const hasFoodLists = proteinFoods.length > 0 || vegetableFoods.length > 0;
  const hasComposition = compositionProteinPct != null && compositionPlantPct != null;
  // Use card-style feeding schedule when any schedule has a description field
  const useCardSchedule = feedingSchedules.some(s => s.description != null);
  const hasContent =
    introText ||
    subtitleText ||
    feedingSchedules.length > 0 ||
    hasPortions ||
    hasFoodLists ||
    hasComposition ||
    foodsToAvoid.length > 0 ||
    commercialDiets.length > 0 ||
    calciumSupplements ||
    drinkingWater;

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

      {/* Feeding Schedule — card-style (terrestrial) */}
      {feedingSchedules.length > 0 && useCardSchedule && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-white px-5 py-3 border-b border-gray-100">
            <h3 className="font-heading font-bold text-black text-lg">
              Feeding Schedule
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {feedingSchedules.map((schedule, i) => (
              <div
                key={i}
                className={`rounded-xl border px-5 py-4 ${
                  i === 0 ? 'border-green-600 bg-green-500/10' : 'border-gray-100 bg-warm'
                }`}
              >
                <h4 className="font-heading font-bold text-black text-base mb-1">
                  {schedule.life_stage}
                </h4>
                {schedule.description && (
                  <p className="text-base text-gray-700">{schedule.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feeding Schedule by Age — table (aquatic) */}
      {feedingSchedules.length > 0 && !useCardSchedule && (
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

      {/* Diet Composition bar (terrestrial) */}
      {hasComposition && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden p-5">
          <h3 className="font-heading font-bold text-black text-lg mb-3">Diet Composition</h3>
          <div className="flex rounded-lg overflow-hidden h-10 mb-3">
            <div
              className="bg-orange-400 flex items-center justify-center"
              style={{ width: `${compositionProteinPct}%` }}
            >
              <span className="text-sm font-bold text-red-800">{compositionProteinPct}% Animal Protein</span>
            </div>
            <div
              className="bg-green-400 flex items-center justify-center"
              style={{ width: `${compositionPlantPct}%` }}
            >
              <span className="text-sm font-bold text-green-800">{compositionPlantPct}% Plant Matter</span>
            </div>
          </div>
          {compositionNote && (
            <p className="text-base text-gray-700">{compositionNote}</p>
          )}
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
            title={useCardSchedule ? 'Animal Protein' : 'Protein Foods'}
            items={proteinFoods}
            iconName="shrimp-line"
            bulletColor="bg-red-500"
          />
          <FoodListCard
            title={useCardSchedule ? 'Plants, Fruits & Vegetables' : 'Vegetable Foods'}
            items={vegetableFoods}
            iconName="vegetable-line"
            bulletColor="bg-green-500"
          />
        </div>
      )}

      {/* Foods to Avoid (terrestrial) */}
      {foodsToAvoid.length > 0 && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 shadow-sm overflow-hidden p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />
            <h3 className="font-heading font-bold text-red-800 text-lg">Foods to Avoid</h3>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-base text-gray-700">
            {foodsToAvoid.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Commercial Diets (terrestrial) */}
      {(commercialDiets.length > 0 || commercialDietsNote) && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden p-5">
          <h3 className="font-heading font-bold text-black text-lg mb-2">Commercial Diets</h3>
          {commercialDietsNote && (
            <p className="text-base text-gray-700 mb-3">{commercialDietsNote}</p>
          )}
          {commercialDiets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {commercialDiets.map((diet, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-green-800/30 bg-white px-3 py-1 text-sm font-medium text-gray-800"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supplements & Calcium callout */}
      {calciumSupplements && (
        <div className="mb-8">
          <CareGuideCallout variant="green" title="Supplements & Calcium" dimmed={activeSection !== 'diet'}>
            {calciumSupplements}
          </CareGuideCallout>
        </div>
      )}

      {/* Drinking Water callout (terrestrial) */}
      {drinkingWater && (
        <CareGuideCallout variant="blue" title="Drinking Water" dimmed={activeSection !== 'diet'}>
          {drinkingWater}
        </CareGuideCallout>
      )}
    </section>
  );
}
