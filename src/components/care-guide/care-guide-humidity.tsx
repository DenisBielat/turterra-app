'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';
import { CareGuideShopButton } from './care-guide-shop-button';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

interface HumidityZone {
  zone_name: string;
  humidity_min_pct: number;
  humidity_max_pct: number | null;
  notes: string | null;
}

interface HumidityTarget {
  time_label: string;
  target: string;
}

interface CareGuideHumidityProps {
  introText: string | null;
  humidityZones: HumidityZone[];
  humidHideTips: string[];
  dailyMistingTips: string[];
  substrateTips: string[];
  monitoringText: string | null;
  humidityTargets: HumidityTarget[];
  inadequateHumidityWarning: string | null;
  outdoorNote: string | null;
}

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** Bar color based on humidity level — higher humidity = deeper teal. */
function getBarStyleForZone(zoneName: string): { bg: string; text: string } {
  const name = zoneName.toLowerCase();
  if (name.includes('humid hide')) return { bg: 'bg-teal-300', text: 'text-teal-900' };
  if (name.includes('substrate')) return { bg: 'bg-teal-200', text: 'text-teal-800' };
  if (name.includes('ambient')) return { bg: 'bg-cyan-200', text: 'text-cyan-800' };
  if (name.includes('minimum')) return { bg: 'bg-orange-200', text: 'text-orange-800' };
  return { bg: 'bg-gray-200', text: 'text-gray-800' };
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

/** A single row in the Humidity Zones chart. */
function HumidityZoneRow({
  zone,
  maxPct,
  barsVisible,
}: {
  zone: HumidityZone;
  maxPct: number;
  barsVisible: boolean;
}) {
  const widthPct = maxPct > 0
    ? Math.max(((zone.humidity_max_pct ?? zone.humidity_min_pct) / maxPct) * 100, 25)
    : 25;

  const pctLabel = zone.humidity_max_pct != null
    ? `${zone.humidity_min_pct}–${zone.humidity_max_pct}%`
    : `${zone.humidity_min_pct}%+`;

  const color = getBarStyleForZone(zone.zone_name);

  return (
    <div className="flex items-center gap-3">
      <span className="text-base font-medium text-gray-700 w-36 md:w-44 flex-shrink-0">
        {zone.zone_name}
      </span>

      <div className="flex-1 min-w-0">
        <div
          className={`h-8 rounded-md flex items-center px-3 transition-[width] duration-500 ease-out ${color.bg}`}
          style={{ width: barsVisible ? `${widthPct}%` : '0%' }}
        >
          <span className={`text-sm font-bold whitespace-nowrap ${color.text}`}>
            {pctLabel}
          </span>
        </div>
      </div>

      {zone.notes && (
        <span className="text-sm text-gray-500 w-auto md:w-48 text-right flex-shrink-0">
          {zone.notes}
        </span>
      )}
    </div>
  );
}

/** A method tips card (Humid Hide, Daily Misting, Substrate Choice). */
function MethodCard({
  title,
  tips,
  isEssential,
}: {
  title: string;
  tips: string[];
  isEssential?: boolean;
}) {
  if (tips.length === 0) return null;
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden px-5 py-4 ${
      isEssential ? 'border-green-600 bg-green-500/10' : 'border-gray-100 bg-white'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <h4 className="font-heading font-bold text-black text-lg">{title}</h4>
        {isEssential && (
          <span className="inline-flex items-center rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            Essential
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-baseline gap-2 text-base text-gray-700">
            <span className="text-green-600 flex-shrink-0 leading-none">•</span>
            <CareGuideMarkdown inline>{tip}</CareGuideMarkdown>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideHumidity({
  introText,
  humidityZones,
  humidHideTips,
  dailyMistingTips,
  substrateTips,
  monitoringText,
  humidityTargets,
  inadequateHumidityWarning,
  outdoorNote,
}: CareGuideHumidityProps) {
  const hasMethods = humidHideTips.length > 0 || dailyMistingTips.length > 0 || substrateTips.length > 0;
  const hasContent =
    introText ||
    humidityZones.length > 0 ||
    hasMethods ||
    monitoringText ||
    humidityTargets.length > 0 ||
    inadequateHumidityWarning ||
    outdoorNote;

  if (!hasContent) return null;

  const maxPct = humidityZones.reduce(
    (max, z) => Math.max(max, z.humidity_max_pct ?? z.humidity_min_pct),
    0,
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const { activeSection } = useCareGuideActiveSection();

  useEffect(() => {
    const el = chartRef.current;
    if (!el || humidityZones.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setBarsVisible(true);
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [humidityZones.length]);

  return (
    <section id="humidity" className="scroll-mt-40">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Humidity
        </h2>
        <CareGuideShopButton productCategorySlug="humidity" className="flex-shrink-0" />
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Humidity Zones chart */}
      {humidityZones.length > 0 && (
        <div
          ref={chartRef}
          className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="bg-white px-5 py-3 border-b border-gray-100">
            <h3 className="font-heading font-bold text-black text-lg">
              Humidity Zones
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {humidityZones.map((zone) => (
              <HumidityZoneRow
                key={zone.zone_name}
                zone={zone}
                maxPct={maxPct}
                barsVisible={barsVisible}
              />
            ))}
          </div>
        </div>
      )}

      {/* Method cards — 3 columns */}
      {hasMethods && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MethodCard title="Humid Hide" tips={humidHideTips} isEssential />
          <MethodCard title="Daily Misting" tips={dailyMistingTips} />
          <MethodCard title="Substrate Choice" tips={substrateTips} />
        </div>
      )}

      {/* Monitoring Humidity */}
      {(monitoringText || humidityTargets.length > 0) && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden px-5 py-4">
          <h3 className="font-heading font-bold text-black text-lg mb-3">
            Monitoring Humidity
          </h3>
          {monitoringText && (
            <div className="text-base text-gray-700 leading-relaxed mb-4">
              <CareGuideMarkdown>{monitoringText}</CareGuideMarkdown>
            </div>
          )}
          {humidityTargets.length > 0 && (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${humidityTargets.length}, minmax(0, 1fr))` }}
            >
              {humidityTargets.map((target, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-warm flex flex-col items-center text-center px-4 py-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    {target.time_label}
                  </span>
                  <span className="text-base font-bold text-black">
                    {target.target}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signs of Inadequate Humidity callout */}
      {inadequateHumidityWarning && (
        <div className="mb-8">
          <CareGuideCallout variant="red" title="Signs of Inadequate Humidity" dimmed={activeSection !== 'humidity'}>
            {inadequateHumidityWarning}
          </CareGuideCallout>
        </div>
      )}

      {/* Outdoor Enclosures callout */}
      {outdoorNote && (
        <CareGuideCallout variant="green" iconName="info-circle-flex-solid" title="Outdoor Enclosures" dimmed={activeSection !== 'humidity'}>
          {outdoorNote}
        </CareGuideCallout>
      )}
    </section>
  );
}
