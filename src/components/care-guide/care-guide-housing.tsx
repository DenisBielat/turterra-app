import { Icon } from '@/components/Icon';

interface EnclosureSize {
  life_stage: string;
  size_range: string | null;
  min_gallons: number;
  max_gallons: number | null;
  notes: string | null;
}

interface CareGuideHousingProps {
  introText: string | null;
  essentials: string[];
  commonMistakes: string[];
  cohabitationNotes: string | null;
  enclosureSizes: EnclosureSize[];
}

export function CareGuideHousing({
  introText,
  essentials,
  commonMistakes,
  cohabitationNotes,
  enclosureSizes,
}: CareGuideHousingProps) {
  const hasContent = introText || essentials.length > 0 || commonMistakes.length > 0 || cohabitationNotes || enclosureSizes.length > 0;
  if (!hasContent) return null;

  return (
    <section id="housing" className="scroll-mt-40">
      {/* Section header */}
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-950 mb-4">
        Housing & Enclosure
      </h2>

      {/* Intro paragraph */}
      {introText && (
        <p className="text-gray-700 text-base leading-relaxed mb-8">
          {introText}
        </p>
      )}

      {/* Minimum Enclosure Sizing table */}
      {enclosureSizes.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-green-900/10 px-5 py-3">
            <h3 className="font-heading font-bold text-green-950 text-base">
              Minimum Enclosure Sizing
            </h3>
          </div>
          <div className="px-5 py-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {enclosureSizes.map((size, i) => (
                    <tr key={i} className={i < enclosureSizes.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="py-3 pr-4 font-semibold text-green-950">{size.life_stage}</td>
                      <td className="py-3 pr-4 text-gray-700">{size.size_range ?? '—'}</td>
                      <td className="py-3 pr-4 font-bold text-green-700">
                        {size.max_gallons
                          ? `${size.min_gallons}-${size.max_gallons} gal`
                          : `${size.min_gallons} gal`}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{size.notes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Essentials & Common Mistakes — side by side */}
      {(essentials.length > 0 || commonMistakes.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Enclosure Essentials */}
          {essentials.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="checkmark" style="filled" size="base" className="text-green-700" />
                <h3 className="font-heading font-bold text-green-950 text-base">
                  Enclosure Essentials
                </h3>
              </div>
              <ul className="space-y-2">
                {essentials.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="warning" style="line" size="base" className="text-red-500" />
                <h3 className="font-heading font-bold text-green-950 text-base">
                  Common Mistakes
                </h3>
              </div>
              <ul className="space-y-2">
                {commonMistakes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* A Note on Cohabitation callout */}
      {cohabitationNotes && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Icon name="warning" style="line" size="base" className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-green-950 text-sm md:text-base mb-1">
                A Note on Cohabitation
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {cohabitationNotes}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
