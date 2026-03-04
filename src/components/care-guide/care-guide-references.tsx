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
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

function ReferenceCard({ reference }: { reference: CareGuideReference }) {
  const isBook = reference.referenceType === 'book';
  const href = reference.doi
    ? `https://doi.org/${reference.doi}`
    : reference.url;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex">
      {/* Green left accent border */}
      <div className="w-1 bg-green-600 flex-shrink-0" />

      <div className="flex-1 px-5 py-4 flex items-start gap-4">
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0 text-green-700">
          <Icon
            name={isBook ? 'book-open' : 'earth-locate'}
            style="line"
            size="base"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Source name */}
          <h4 className="font-heading font-bold text-black text-base">
            {reference.sourceName || reference.title || 'Reference'}
          </h4>

          {/* Authors & year */}
          {(reference.authors || reference.year) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {[reference.authors, reference.year && `(${reference.year})`]
                .filter(Boolean)
                .join(' ')}
            </p>
          )}

          {/* Title (if different from source name) */}
          {reference.title && reference.title !== reference.sourceName && (
            <p className="text-sm text-gray-700 mt-1 italic">
              {reference.title}
            </p>
          )}

          {/* Link */}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 hover:underline mt-2 transition-colors"
            >
              {reference.doi
                ? `doi.org/${reference.doi}`
                : new URL(href).hostname.replace('www.', '')}
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H18m0 0v4.5m0-4.5L10.5 13.5"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideReferences({ references }: CareGuideReferencesProps) {
  if (!references || references.length === 0) return null;

  return (
    <section id="references" className="scroll-mt-40">
      {/* Section header */}
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-black mb-6">
        References
      </h2>

      {/* Reference cards */}
      <div className="flex flex-col gap-4">
        {references.map((ref) => (
          <ReferenceCard key={ref.id} reference={ref} />
        ))}
      </div>
    </section>
  );
}
