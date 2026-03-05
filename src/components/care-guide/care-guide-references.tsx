'use client';

import { Icon } from '@/components/Icon';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface CareGuideReference {
  id: number;
  referenceType: string | null;
  citationFull: string | null;
  citationShort: string | null;
  authors: string | null;
  year: string | null;
  title: string | null;
  sourceName: string | null;
  url: string | null;
  doi: string | null;
  accessDate: string | null;
  notes: string | null;
}

interface CareGuideReferencesProps {
  references: CareGuideReference[];
  /** Optional intro paragraph below the subtitle */
  introText?: string | null;
  /** Optional custom disclaimer text; if not provided, a default is shown */
  disclaimerText?: string | null;
}

type ReferenceCategory = 'website' | 'book' | 'veterinary' | 'scientific';

const categoryConfig: Record<
  ReferenceCategory,
  { label: string; icon: 'earth-locate' | 'book-open' | 'health' | 'graph-stats-ascend' }
> = {
  website: { label: 'Website', icon: 'earth-locate' },
  book: { label: 'Book', icon: 'book-open' },
  veterinary: { label: 'Veterinary', icon: 'health' },
  scientific: { label: 'Scientific', icon: 'graph-stats-ascend' },
};

const DEFAULT_INTRO =
  'This care guide was compiled using information from reputable sources including veterinary literature, experienced keepers, scientific research, and established reptile care organizations. We encourage you to consult multiple sources and always seek advice from a qualified reptile veterinarian for species-specific guidance.';

const DEFAULT_DISCLAIMER =
  "This care guide is provided for educational purposes only and should not be considered a substitute for professional veterinary advice. Care requirements may vary based on individual circumstances, subspecies, and local conditions. Always consult with a qualified reptile veterinarian before making significant changes to your turtle's care regimen.";

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

function CategoryPill({ type }: { type: ReferenceCategory }) {
  const config = categoryConfig[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#f2f0e7] px-2.5 py-1 text-xs font-medium text-gray-800">
      <Icon name={config.icon} style="line" size="xsm" className="text-gray-600" />
      {config.label}
    </span>
  );
}

function ReferenceCard({
  reference,
  index,
}: {
  reference: CareGuideReference;
  index: number;
}) {
  const href = reference.doi
    ? `https://doi.org/${reference.doi}`
    : reference.url;
  const category = (reference.referenceType?.toLowerCase() || 'website') as ReferenceCategory;
  const displayCategory: ReferenceCategory = categoryConfig[category] ? category : 'website';
  const title = reference.title || reference.sourceName || 'Reference';

  // Source line: e.g. "Mariah Healey. *ReptiFiles* (2024)" or "Ernst, C.H. & Lovich, J.E... Johns Hopkins University Press (2009)"
  const sourceParts: string[] = [];
  if (reference.authors) sourceParts.push(reference.authors);
  if (reference.sourceName) sourceParts.push(`*${reference.sourceName}*`);
  if (reference.year) sourceParts.push(`(${reference.year})`);
  const sourceLine = sourceParts.join('. ');

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden px-5 py-4 flex items-start gap-4">
      {/* Number in light green circle */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-sm font-semibold text-gray-800">
        {index + 1}
      </div>

      {/* Title (with link icon directly after), source line */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-heading font-semibold text-black text-base">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-2"
              >
                {title}
                <Icon
                  name="arrow-corner-left"
                  style="line"
                  size="sm"
                  className="flex-shrink-0 rotate-180 text-gray-500"
                />
              </a>
            ) : (
              title
            )}
          </h4>
        </div>
        {sourceLine && (
          <p className="mt-1 text-sm text-gray-600">
            {sourceLine.split('*').map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="italic">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        )}
      </div>

      {/* Category pill */}
      <div className="flex-shrink-0">
        <CategoryPill type={displayCategory} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideReferences({
  references,
  introText,
  disclaimerText,
}: CareGuideReferencesProps) {
  if (!references || references.length === 0) return null;

  const intro = introText ?? DEFAULT_INTRO;
  const disclaimer = disclaimerText ?? DEFAULT_DISCLAIMER;

  return (
    <section id="references" className="scroll-mt-40">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          References & Further Reading
        </h2>
        {intro && (
          <p className="mt-3 text-base text-gray-700 leading-relaxed">
            {intro}
          </p>
        )}
      </div>

      {/* Reference cards - each its own card */}
      <div className="flex flex-col gap-4">
        {references.map((ref, index) => (
          <ReferenceCard key={ref.id} reference={ref} index={index} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl border border-green-200/60 bg-green-50/70 px-5 py-4">
        <p className="text-sm text-gray-800 leading-relaxed">
          <span className="font-semibold">Disclaimer:</span> {disclaimer}
        </p>
      </div>
    </section>
  );
}
