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

/** Photoperiod bar — shows light vs dark hours. */
function PhotoperiodBar({
  label,
  lightHours,
}: {
  label: string;
  lightHours: number;
}) {
  const darkHours = 24 - lightHours;
  const lightPct = (lightHours / 24) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-700 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 flex h-7 rounded-lg overflow-hidden">
        {/* Light portion */}
        <div
          className="flex items-center justify-center bg-amber-300 text-xs font-bold text-amber-900"
          style={{ width: `${lightPct}%` }}
        >
          {lightHours}h light
        </div>
        {/* Dark portion */}
        <div
          className="flex items-center justify-center bg-gray-700 text-xs font-bold text-gray-300"
          style={{ width: `${100 - lightPct}%` }}
        >
          {darkHours}h dark
        </div>
      </div>
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
              <div className="bg-green-900/10 px-5 py-3 flex items-center gap-2">
                <Icon name="lighting" style="line" size="base" className="text-green-700" />
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Target UVI</p>
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
              <div className="bg-green-900/10 px-5 py-3 flex items-center gap-2">
                <Icon name="lighting" style="line" size="base" className="text-green-700" />
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

      {/* Photoperiod */}
      {hasPhotoperiod && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-green-900/10 px-5 py-3">
            <h3 className="font-heading font-bold text-black text-lg">
              Photoperiod
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {summerLightHours != null && (
              <PhotoperiodBar label="Summer" lightHours={summerLightHours} />
            )}
            {winterLightHours != null && (
              <PhotoperiodBar label="Winter" lightHours={winterLightHours} />
            )}
          </div>
        </div>
      )}

      {/* Outdoor housing callout */}
      {outdoorHousingNote && (
        <CareGuideCallout variant="amber" title="Natural Sunlight & Outdoor Housing">
          {outdoorHousingNote}
        </CareGuideCallout>
      )}
    </section>
  );
}
