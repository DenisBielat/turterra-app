import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';
import { CareGuideCallout } from './care-guide-callout';

interface CareGuideLightingProps {
  introText: string | null;
  uvbBulbType: string | null;
  uvbTargetUviMin: number | null;
  uvbTargetUviMax: number | null;
  uvbTargetNotes: string | null;
  uvbDistance: string | null;
  uvbReplacement: string | null;
  daylightType: string | null;
  daylightCoverage: string | null;
  daylightPurpose: string | null;
  daylightNote: string | null;
  summerLightHours: number | null;
  winterLightHours: number | null;
  outdoorHousingNote: string | null;
}

/** Single row: bold label, colon, value. Values use body text color (gray-700). */
function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-base text-gray-700">
      <span className="font-bold text-gray-900">{label}:</span> {value}
    </p>
  );
}

/** Single season card for Photoperiod — hours in a colored card. */
function PhotoperiodSeasonCard({
  season,
  lightHours,
  variant,
}: {
  season: string;
  lightHours: number;
  variant: 'summer' | 'winter';
}) {
  const isSummer = variant === 'summer';
  return (
    <div
      className={`rounded-lg px-5 py-4 text-center flex flex-col items-center justify-center min-h-[100px] ${
        isSummer ? 'bg-orange-200' : 'bg-blue-200'
      }`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
          isSummer ? 'text-orange-800' : 'text-blue-800'
        }`}
      >
        {season}
      </span>
      <span className="text-2xl font-bold text-gray-900">{lightHours} hrs</span>
      <span className="text-xs text-gray-600 mt-0.5">light per day</span>
    </div>
  );
}

export function CareGuideLighting({
  introText,
  uvbBulbType,
  uvbTargetUviMin,
  uvbTargetUviMax,
  uvbTargetNotes,
  uvbDistance,
  uvbReplacement,
  daylightType,
  daylightCoverage,
  daylightPurpose,
  daylightNote,
  summerLightHours,
  winterLightHours,
  outdoorHousingNote,
}: CareGuideLightingProps) {
  const hasUvb = uvbBulbType || (uvbTargetUviMin != null && uvbTargetUviMax != null) || uvbDistance || uvbReplacement;
  const hasDaylight = daylightType || daylightCoverage || daylightPurpose;
  const hasPhotoperiod = summerLightHours != null || winterLightHours != null;
  const hasContent = introText || hasUvb || hasDaylight || hasPhotoperiod || outdoorHousingNote;

  if (!hasContent) return null;

  return (
    <section id="lighting" className="scroll-mt-40">
      {/* Section header */}
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-black mb-4">
        Lighting & UVB
      </h2>

      {/* Intro paragraph */}
      {introText && (
        <div className="text-base md:text-lg leading-relaxed mb-8">
          <CareGuideMarkdown>{introText}</CareGuideMarkdown>
        </div>
      )}

      {/* UVB + Daylight cards — side by side */}
      {(hasUvb || hasDaylight) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* UVB Lighting card */}
          {hasUvb && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-blue-500/10 px-5 py-3 flex items-center gap-2">
                <Icon name="lightbulb-flex-line" style="line" size="base" className="text-blue-600" />
                <h3 className="font-heading font-bold text-black text-lg">
                  UVB Lighting
                </h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                {uvbBulbType && <LabelValue label="Type" value={uvbBulbType} />}
                {uvbTargetUviMin != null && uvbTargetUviMax != null && (
                  <LabelValue
                    label="Target UVI"
                    value={[`${uvbTargetUviMin.toFixed(1)} - ${uvbTargetUviMax.toFixed(1)}`, uvbTargetNotes].filter(Boolean).join(' ')}
                  />
                )}
                {uvbDistance && <LabelValue label="Distance" value={uvbDistance} />}
                {uvbReplacement && <LabelValue label="Replacement" value={uvbReplacement} />}
              </div>
            </div>
          )}

          {/* Daylight Lighting card */}
          {hasDaylight && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-orange-500/30 px-5 py-3 flex items-center gap-2 border-b border-orange-400/30">
                <Icon name="sun-flex-line" style="line" size="base" className="text-orange-700" />
                <h3 className="font-heading font-bold text-black text-lg">
                  Daylight Lighting
                </h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                {daylightType && <LabelValue label="Type" value={daylightType} />}
                {daylightCoverage && <LabelValue label="Coverage" value={daylightCoverage} />}
                {daylightPurpose && <LabelValue label="Purpose" value={daylightPurpose} />}
                {daylightNote && (
                  <div className="text-sm text-gray-600 italic pt-1">
                    <CareGuideMarkdown inline>{daylightNote}</CareGuideMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photoperiod (Light Cycle) */}
      {hasPhotoperiod && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-white px-5 py-3 flex items-center gap-2 border-b border-gray-100">
            <h3 className="font-heading font-bold text-black text-lg">
              Photoperiod <span className="font-normal text-gray-500 text-base">(Light Cycle)</span>
            </h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-base text-gray-600 leading-relaxed">
              To replicate natural seasonal rhythms, adjust your light schedule throughout the year. This supports healthy behavior and can be important for breeding cycles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summerLightHours != null && (
                <PhotoperiodSeasonCard season="Summer" lightHours={summerLightHours} variant="summer" />
              )}
              {winterLightHours != null && (
                <PhotoperiodSeasonCard season="Winter" lightHours={winterLightHours} variant="winter" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Outdoor housing callout */}
      {outdoorHousingNote && (
        <CareGuideCallout variant="green" title="Natural Sunlight & Outdoor Housing">
          {outdoorHousingNote}
        </CareGuideCallout>
      )}
    </section>
  );
}
