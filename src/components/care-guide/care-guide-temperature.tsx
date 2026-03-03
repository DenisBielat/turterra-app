import { CareGuideCallout } from './care-guide-callout';

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
}

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** Pick a bar color based on the temperature value. */
function getZoneColor(tempMaxF: number): { bg: string; text: string } {
  if (tempMaxF >= 90) return { bg: 'bg-red-400', text: 'text-red-950' };
  if (tempMaxF >= 80) return { bg: 'bg-red-300', text: 'text-red-900' };
  if (tempMaxF >= 75) return { bg: 'bg-teal-400', text: 'text-teal-950' };
  if (tempMaxF >= 65) return { bg: 'bg-teal-300', text: 'text-teal-900' };
  return { bg: 'bg-gray-300', text: 'text-gray-800' };
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

/** A single row in the Temperature Zones chart. */
function TempZoneRow({
  zone,
  maxTempF,
}: {
  zone: TempZone;
  maxTempF: number;
}) {
  const color = getZoneColor(zone.temp_max_f);

  // Bar width proportional to max temp; negative values (nighttime drop) get a minimum width
  const widthPct =
    zone.temp_max_f > 0 && maxTempF > 0
      ? Math.max((zone.temp_max_f / maxTempF) * 100, 25)
      : 25;

  // Format the °F label
  const fLabel =
    zone.temp_min_f < 0
      ? `${zone.temp_min_f} to ${zone.temp_max_f}°F`
      : `${zone.temp_min_f}–${zone.temp_max_f}°F`;

  // Format the °C label (use notes as fallback for special rows like nighttime drop)
  let cLabel: string | null = null;
  if (zone.temp_min_c != null && zone.temp_max_c != null) {
    cLabel = `${zone.temp_min_c}–${zone.temp_max_c}°C`;
  } else if (zone.notes) {
    cLabel = zone.notes;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Zone name */}
      <span className="text-sm font-medium text-gray-700 w-32 md:w-40 flex-shrink-0">
        {zone.zone_name}
      </span>

      {/* Colored bar */}
      <div className="flex-1 min-w-0">
        <div
          className={`h-8 rounded-md flex items-center px-3 ${color.bg}`}
          style={{ width: `${widthPct}%` }}
        >
          <span className={`text-xs font-bold whitespace-nowrap ${color.text}`}>
            {fLabel}
          </span>
        </div>
      </div>

      {/* °C / notes column */}
      {cLabel && (
        <span className="text-xs text-gray-500 w-20 md:w-24 text-right flex-shrink-0">
          {cLabel}
        </span>
      )}
    </div>
  );
}

/** An equipment tips card (Heat Lamps, Water Heater, Thermometers). */
function EquipmentCard({ title, tips }: { title: string; tips: string[] }) {
  if (tips.length === 0) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
      <h4 className="font-heading font-bold text-black text-base mb-3">{title}</h4>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
            {tip}
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
}: CareGuideTemperatureProps) {
  const hasEquipment = heatLampTips.length > 0 || waterHeaterTips.length > 0 || thermometerTips.length > 0;
  const hasContent = introText || tempZones.length > 0 || hasEquipment || safetyWarning;

  if (!hasContent) return null;

  // Find the max temp across all zones (for proportional bar widths)
  const maxTempF = tempZones.reduce((max, z) => Math.max(max, z.temp_max_f), 0);

  return (
    <section id="temperature" className="scroll-mt-40">
      {/* Section header */}
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-black mb-4">
        Temperature & Heating
      </h2>

      {/* Intro paragraph */}
      {introText && (
        <p className="text-base md:text-lg leading-relaxed mb-8">
          {introText}
        </p>
      )}

      {/* Temperature Zones chart */}
      {tempZones.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-white px-5 py-3 border-b border-gray-100">
            <h3 className="font-heading font-bold text-black text-lg">
              Temperature Zones
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {tempZones.map((zone) => (
              <TempZoneRow key={zone.zone_name} zone={zone} maxTempF={maxTempF} />
            ))}
          </div>
        </div>
      )}

      {/* Equipment tips — 3 columns */}
      {hasEquipment && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <EquipmentCard title="Heat Lamps" tips={heatLampTips} />
          <EquipmentCard title="Water Heater" tips={waterHeaterTips} />
          <EquipmentCard title="Thermometers" tips={thermometerTips} />
        </div>
      )}

      {/* Safety warning callout */}
      {safetyWarning && (
        <CareGuideCallout variant="red" title="Safety Warning">
          {safetyWarning}
        </CareGuideCallout>
      )}
    </section>
  );
}
