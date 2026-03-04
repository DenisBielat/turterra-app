'use client';

import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface HealthIssue {
  name: string;
  severity: 'monitor' | 'moderate' | 'urgent';
  common_cause: string | null;
  signs: string | null;
}

interface CareGuideHealthProps {
  introText: string | null;
  subtitleText?: string | null;
  healthIssues: HealthIssue[];
  whenToSeeVet: string | null;
  preventiveCare: string[];
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

const severityConfig: Record<
  HealthIssue['severity'],
  { bg: string; text: string; label: string }
> = {
  urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
  monitor: { bg: 'bg-green-100', text: 'text-green-700', label: 'Monitor' },
};

function SeverityBadge({ severity }: { severity: HealthIssue['severity'] }) {
  const config = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function HealthIssueCard({ issue }: { issue: HealthIssue }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex">
      {/* Green left accent border */}
      <div className="w-1 bg-green-600 flex-shrink-0" />

      <div className="flex-1 px-5 py-4">
        {/* Name + severity badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="font-heading font-bold text-black text-base">
            {issue.name}
          </h4>
          <SeverityBadge severity={issue.severity} />
        </div>

        {/* Common cause & signs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {issue.common_cause && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">
                Common Cause
              </p>
              <p className="text-sm text-gray-700">
                <CareGuideMarkdown inline>{issue.common_cause}</CareGuideMarkdown>
              </p>
            </div>
          )}
          {issue.signs && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">
                Signs to Watch For
              </p>
              <p className="text-sm text-gray-700">
                <CareGuideMarkdown inline>{issue.signs}</CareGuideMarkdown>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreventiveCareChecklist({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  const mid = Math.ceil(items.length / 2);
  const col1 = items.slice(0, mid);
  const col2 = items.slice(mid);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="checkmark" style="filled" size="base" className="text-green-700" />
          <h3 className="font-heading font-bold text-black text-lg">
            Preventive Care Checklist
          </h3>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-base text-gray-700">
          {col1.map((item, i) => (
            <li key={`a-${i}`} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-green-500" />
              <CareGuideMarkdown inline>{item}</CareGuideMarkdown>
            </li>
          ))}
          {col2.map((item, i) => (
            <li key={`b-${i}`} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-green-500" />
              <CareGuideMarkdown inline>{item}</CareGuideMarkdown>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideHealth({
  introText,
  subtitleText,
  healthIssues,
  whenToSeeVet,
  preventiveCare,
}: CareGuideHealthProps) {
  const hasContent =
    introText ||
    healthIssues.length > 0 ||
    whenToSeeVet ||
    preventiveCare.length > 0;

  if (!hasContent) return null;

  const { activeSection } = useCareGuideActiveSection();

  return (
    <section id="health" className="scroll-mt-40">
      {/* Section header */}
      <div className="mb-2">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Health & Common Issues
        </h2>
        {subtitleText && (
          <p className="text-base text-gray-500 mt-1">{subtitleText}</p>
        )}
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Health issue cards */}
      {healthIssues.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          {healthIssues.map((issue) => (
            <HealthIssueCard key={issue.name} issue={issue} />
          ))}
        </div>
      )}

      {/* When to See a Vet callout */}
      {whenToSeeVet && (
        <div className="mb-8">
          <CareGuideCallout variant="amber" title="When to See a Vet" dimmed={activeSection !== 'health'}>
            {whenToSeeVet}
          </CareGuideCallout>
        </div>
      )}

      {/* Preventive Care Checklist */}
      <PreventiveCareChecklist items={preventiveCare} />
    </section>
  );
}
