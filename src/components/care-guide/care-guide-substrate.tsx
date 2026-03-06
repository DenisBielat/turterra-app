'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { CareGuideShopButton } from './care-guide-shop-button';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

interface SubstrateDepth {
  label: string;
  depth: string;
  description: string | null;
}

interface SubstrateOption {
  name: string;
  description: string | null;
  is_recommended: boolean;
  pros: string[];
  cons: string[];
}

interface MaintenanceSchedule {
  frequency: string;
  tasks: string[];
}

interface CareGuideSubstrateProps {
  introText: string | null;
  depths: SubstrateDepth[];
  options: SubstrateOption[];
  leafLitterText: string | null;
  maintenanceSchedules: MaintenanceSchedule[];
  quarantineNote: string | null;
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

/** A single depth card in the Substrate Depth row. */
function DepthCard({
  depth,
  isLast,
}: {
  depth: SubstrateDepth;
  isLast: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center text-center px-4 py-4 ${
        isLast
          ? 'bg-green-100/60 rounded-r-xl'
          : ''
      }`}
    >
      <span className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLast ? 'text-green-700' : 'text-gray-500'}`}>
        {depth.label}
      </span>
      <span className={`text-2xl md:text-3xl font-bold mb-1 ${isLast ? 'text-green-800' : 'text-black'}`}>
        {depth.depth}
      </span>
      {depth.description && (
        <span className="text-sm text-gray-500">{depth.description}</span>
      )}
    </div>
  );
}

/** A substrate option card with optional Recommended badge and Pros/Cons. */
function SubstrateOptionCard({ option }: { option: SubstrateOption }) {
  return (
    <div
      className={`rounded-xl border shadow-sm overflow-hidden px-5 py-4 ${
        option.is_recommended
          ? 'border-green-200 bg-green-50/50'
          : 'border-gray-100 bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <h4 className="font-heading font-bold text-black text-lg">{option.name}</h4>
        {option.is_recommended && (
          <span className="inline-flex items-center rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            Recommended
          </span>
        )}
      </div>

      {/* Description */}
      {option.description && (
        <p className="text-base text-gray-600 mb-3">{option.description}</p>
      )}

      {/* Pros & Cons grid */}
      {(option.pros.length > 0 || option.cons.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {option.pros.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="checkmark" style="filled" size="sm" className="text-green-700" />
                <span className="text-sm font-semibold text-green-700">Pros</span>
              </div>
              <ul className="space-y-1">
                {option.pros.map((pro, i) => (
                  <li key={i} className="text-base text-gray-700">{pro}</li>
                ))}
              </ul>
            </div>
          )}
          {option.cons.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="close" style="filled" size="sm" className="text-red-500" />
                <span className="text-sm font-semibold text-red-500">Cons</span>
              </div>
              <ul className="space-y-1">
                {option.cons.map((con, i) => (
                  <li key={i} className="text-base text-gray-700">{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideSubstrate({
  introText,
  depths,
  options,
  leafLitterText,
  maintenanceSchedules,
  quarantineNote,
}: CareGuideSubstrateProps) {
  const hasContent =
    introText ||
    depths.length > 0 ||
    options.length > 0 ||
    leafLitterText ||
    maintenanceSchedules.length > 0 ||
    quarantineNote;

  if (!hasContent) return null;

  const { activeSection } = useCareGuideActiveSection();

  return (
    <section id="substrate" className="scroll-mt-40">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Substrate
        </h2>
        <CareGuideShopButton productCategorySlug="substrate" className="flex-shrink-0" />
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Substrate Depth */}
      {depths.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3">
            <h3 className="font-heading font-bold text-black text-lg">
              Substrate Depth
            </h3>
          </div>
          <div className={`grid border-t border-gray-100`} style={{ gridTemplateColumns: `repeat(${depths.length}, minmax(0, 1fr))` }}>
            {depths.map((depth, i) => (
              <DepthCard
                key={i}
                depth={depth}
                isLast={i === depths.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Substrate Options */}
      {options.length > 0 && (
        <div className="mb-8">
          <h3 className="font-heading font-bold text-black text-lg mb-4">
            Substrate Options
          </h3>
          <div className="space-y-4">
            {options.map((option, i) => (
              <SubstrateOptionCard key={i} option={option} />
            ))}
          </div>
        </div>
      )}

      {/* Leaf Litter Layer callout */}
      {leafLitterText && (
        <div className="mb-8">
          <CareGuideCallout variant="green" title="Leaf Litter Layer" dimmed={activeSection !== 'substrate'}>
            {leafLitterText}
          </CareGuideCallout>
        </div>
      )}

      {/* Cleaning & Maintenance */}
      {maintenanceSchedules.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden px-5 py-4">
          <h3 className="font-heading font-bold text-black text-lg mb-4">
            Cleaning & Maintenance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {maintenanceSchedules.map((schedule, i) => (
              <div key={i}>
                <h4 className="font-heading font-bold text-black text-base mb-2">
                  {schedule.frequency}
                </h4>
                <ul className="space-y-2">
                  {schedule.tasks.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-base text-gray-700">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                      <CareGuideMarkdown inline>{task}</CareGuideMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quarantine Note callout */}
      {quarantineNote && (
        <CareGuideCallout variant="green" title="Quarantine Note" dimmed={activeSection !== 'substrate'}>
          {quarantineNote}
        </CareGuideCallout>
      )}
    </section>
  );
}
