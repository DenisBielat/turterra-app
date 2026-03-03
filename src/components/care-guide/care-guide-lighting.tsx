import { Icon } from '@/components/Icon';
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

/** UVI scale: 0 → 7+, rendered as a horizontal bar with the target range highlighted. */
function UviScale({ min, max, notes }: { min: number; max: number; notes: string | null }) {
  const SCALE_MAX = 7;
  const leftPct = Math.min((min / SCALE_MAX) * 100, 100);
  const widthPct = Math.min(((max - min) / SCALE_MAX) * 100, 100 - leftPct);

  return (
    <div>
      <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
        {/* Target range highlight */}
        <div
          className="absolute inset-y-0 rounded-full bg-green-500"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7+</span>
      </div>

      {/* Target value + notes */}
      <p className="text-sm font-bold text-green-700 mt-1">
        UVI {min}–{max}
        {notes && <span className="font-normal text-gray-500 ml-1">({notes})</span>}
      </p>
    </div>
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
        <p className="text-base md:text-lg leading-relaxed mb-8">
          {introText}
        </p>
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
              <div className="px-5 py-4 space-y-4">
                {uvbBulbType && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Bulb Type</p>
                    <p className="text-base text-gray-800">{uvbBulbType}</p>
                  </div>
                )}
                {uvbTargetUviMin != null && uvbTargetUviMax != null && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      Target UVI
                      <Icon name="info-circle-flex-solid" style="filled" size="sm" className="text-gray-300" />
                    </p>
                    <UviScale min={uvbTargetUviMin} max={uvbTargetUviMax} notes={uvbTargetNotes} />
                  </div>
                )}
                {uvbDistance && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Mounting Distance</p>
                    <p className="text-base text-gray-800">{uvbDistance}</p>
                  </div>
                )}
                {uvbReplacement && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Replace</p>
                    <p className="text-base text-gray-800">{uvbReplacement}</p>
                  </div>
                )}
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
              <div className="px-5 py-4 space-y-4">
                {daylightType && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Bulb Type</p>
                    <p className="text-base text-gray-800">{daylightType}</p>
                  </div>
                )}
                {daylightCoverage && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Coverage</p>
                    <p className="text-base text-gray-800">{daylightCoverage}</p>
                  </div>
                )}
                {daylightPurpose && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Purpose</p>
                    <p className="text-base text-gray-800">{daylightPurpose}</p>
                  </div>
                )}
                {daylightNote && (
                  <p className="text-sm text-gray-500 italic border-t border-gray-100 pt-3 mt-2">
                    {daylightNote}
                  </p>
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
