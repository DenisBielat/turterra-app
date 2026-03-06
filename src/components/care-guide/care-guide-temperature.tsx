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

export interface TempZone {
  zone_name: string;
  temp_min_f: number;
  temp_max_f: number;
  temp_min_c: number | null;
  temp_max_c: number | null;
  notes: string | null;
}

interface CareGuideTemperatureProps {
  introText: string | null;
  tempZones: TempZone[];
  heatLampTips: string[];
  waterHeaterTips: string[];
  thermometerTips: string[];
  safetyWarning: string | null;
  /* Terrestrial-specific fields (all optional) */
  lightCycleTips?: string[];
  indoorHeatingNote?: string | null;
  outdoorHeatingNote?: string | null;
  hibernationNote?: string | null;
}

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** Static bar colors by zone type. Set once here; not driven by DB or props. */
function getBarStyleForZone(zoneName: string): { bg: string; text: string } {
  const name = zoneName.toLowerCase();
  if (name.includes('basking')) return { bg: 'bg-red-200', text: 'text-red-700' };
  if (name.includes('warm')) return { bg: 'bg-orange-500/40', text: 'text-orange-700' };
  if (name.includes('air')) return { bg: 'bg-orange-500/40', text: 'text-orange-700' };
  if (name.includes('cool')) return { bg: 'bg-green-200', text: 'text-green-800' };
  if (name.includes('water')) return { bg: 'bg-blue-200', text: 'text-blue-900' };
  if (name.includes('night')) return { bg: 'bg-gray-500/20', text: 'text-gray-800' };
  return { bg: 'bg-gray-200', text: 'text-gray-800' };
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

/** A single row in the Temperature Zones chart. */
function TempZoneRow({
  zone,
  maxTempF,
  barsVisible,
}: {
  zone: TempZone;
  maxTempF: number;
  barsVisible: boolean;
}) {
  // Bar width proportional to max temp; negative values (nighttime drop) get a minimum width
  const widthPct =
    zone.temp_max_f > 0 && maxTempF > 0
      ? Math.max((zone.temp_max_f / maxTempF) * 100, 25)
      : 25;

  // Format the °F label
  const fLabel =
    zone.temp_min_f === zone.temp_max_f
      ? `Down to ${zone.temp_max_f}°F`
      : zone.temp_min_f < 0
        ? `${zone.temp_min_f} to ${zone.temp_max_f}°F`
        : `${zone.temp_min_f}–${zone.temp_max_f}°F`;

  // Format the °C label (use notes as fallback for special rows like nighttime drop)
  let cLabel: string | null = null;
  if (zone.temp_min_c != null && zone.temp_max_c != null) {
    cLabel = `${zone.temp_min_c}–${zone.temp_max_c}°C`;
  } else if (zone.notes) {
    cLabel = zone.notes;
  }

  const color = getBarStyleForZone(zone.zone_name);

  return (
    <div className="flex items-center gap-3">
      {/* Zone name */}
      <span className="text-base font-medium text-gray-700 w-32 md:w-40 flex-shrink-0">
        {zone.zone_name}
      </span>

      {/* Colored bar — static color by zone type; animates from left when in view */}
      <div className="flex-1 min-w-0">
        <div
          className={`h-8 rounded-md flex items-center px-3 transition-[width] duration-500 ease-out ${color.bg}`}
          style={{ width: barsVisible ? `${widthPct}%` : '0%' }}
        >
          <span className={`text-sm font-bold whitespace-nowrap ${color.text}`}>
            {fLabel}
          </span>
        </div>
      </div>

      {/* °C / notes column */}
      {cLabel && (
        <span className="text-sm text-gray-500 w-20 md:w-24 text-right flex-shrink-0">
          {cLabel}
        </span>
      )}
    </div>
  );
}

/** An equipment tips card (Heat Lamps, Water Heater, Thermometers). */
function EquipmentCard({
  title,
  tips,
  iconName,
}: {
  title: string;
  tips: string[];
  iconName: 'heat-lamp-flex-line' | 'water-heat-flex-line' | 'thermometer-flex-line' | 'sun-flex-line';
}) {
  if (tips.length === 0) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name={iconName} style="line" size="base" className="text-black" />
        <h4 className="font-heading font-bold text-black text-lg">{title}</h4>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-base text-gray-700">
            <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
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

export function CareGuideTemperature({
  introText,
  tempZones,
  heatLampTips,
  waterHeaterTips,
  thermometerTips,
  safetyWarning,
  lightCycleTips = [],
  indoorHeatingNote,
  outdoorHeatingNote,
  hibernationNote,
}: CareGuideTemperatureProps) {
  const hasEquipment = heatLampTips.length > 0 || waterHeaterTips.length > 0 || thermometerTips.length > 0 || lightCycleTips.length > 0;
  const hasHeatingNotes = !!indoorHeatingNote || !!outdoorHeatingNote;
  const hasContent = introText || tempZones.length > 0 || hasEquipment || hasHeatingNotes || hibernationNote || safetyWarning;

  if (!hasContent) return null;

  // Find the max temp across all zones (for proportional bar widths)
  const maxTempF = tempZones.reduce((max, z) => Math.max(max, z.temp_max_f), 0);

  const chartRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const { activeSection } = useCareGuideActiveSection();

  useEffect(() => {
    const el = chartRef.current;
    if (!el || tempZones.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setBarsVisible(true);
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tempZones.length]);

  return (
    <section id="temperature" className="scroll-mt-40">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Temperature & Heating
        </h2>
        <CareGuideShopButton productCategorySlug="heating-temp" className="flex-shrink-0" />
      </div>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* Temperature Zones chart */}
      {tempZones.length > 0 && (
        <div
          ref={chartRef}
          className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="bg-white px-5 py-3 border-b border-gray-100">
            <h3 className="font-heading font-bold text-black text-lg">
              Temperature Zones
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {tempZones.map((zone) => (
              <TempZoneRow
                key={zone.zone_name}
                zone={zone}
                maxTempF={maxTempF}
                barsVisible={barsVisible}
              />
            ))}
          </div>
        </div>
      )}

      {/* Equipment tips — 3 columns */}
      {hasEquipment && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <EquipmentCard title="Heat Lamps" tips={heatLampTips} iconName="heat-lamp-flex-line" />
          {waterHeaterTips.length > 0 && (
            <EquipmentCard title="Water Heater" tips={waterHeaterTips} iconName="water-heat-flex-line" />
          )}
          <EquipmentCard title="Thermometers" tips={thermometerTips} iconName="thermometer-flex-line" />
          {lightCycleTips.length > 0 && (
            <EquipmentCard title="Light Cycle" tips={lightCycleTips} iconName="sun-flex-line" />
          )}
        </div>
      )}

      {/* Indoor Heating & Outdoor Pens — side by side (terrestrial) */}
      {hasHeatingNotes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {indoorHeatingNote && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <h4 className="font-heading font-bold text-black text-lg mb-2">Indoor Heating</h4>
              <div className="text-base text-gray-700 leading-relaxed">
                <CareGuideMarkdown>{indoorHeatingNote}</CareGuideMarkdown>
              </div>
            </div>
          )}
          {outdoorHeatingNote && (
            <div className="rounded-xl border border-green-600 bg-green-500/10 shadow-sm px-5 py-4">
              <h4 className="font-heading font-bold text-black text-lg mb-2">Outdoor Pens</h4>
              <div className="text-base text-gray-700 leading-relaxed">
                <CareGuideMarkdown>{outdoorHeatingNote}</CareGuideMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hibernation (Brumation) callout (terrestrial) */}
      {hibernationNote && (
        <div className="mb-8">
          <CareGuideCallout variant="green" iconName="info-circle-flex-solid" title="Hibernation (Brumation)" dimmed={activeSection !== 'temperature'}>
            {hibernationNote}
          </CareGuideCallout>
        </div>
      )}

      {/* Safety warning callout */}
      {safetyWarning && (
        <CareGuideCallout variant="red" title="Safety Warning" dimmed={activeSection !== 'temperature'}>
          {safetyWarning}
        </CareGuideCallout>
      )}
    </section>
  );
}
