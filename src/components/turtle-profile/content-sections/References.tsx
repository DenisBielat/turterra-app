import { Reference } from '@/types/turtleTypes';

interface ReferencesProps {
  references: Reference[];
}

export default function References({ references }: ReferencesProps) {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <section id="references" className="scroll-m-20 pb-12">
      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">References</h3>
      <ol className="list-decimal list-outside ml-5 space-y-2 md:space-y-3">
        {references.map((reference) => {
          // Use citation_full as the display text, fallback to constructing from parts
          const displayText = reference.citationFull ||
            [reference.authors, reference.year && `(${reference.year})`, reference.title, reference.sourceName]
              .filter(Boolean)
              .join('. ') ||
            'Reference';

          // Build URL - prefer DOI link if available, then regular URL
          const href = reference.doi
            ? `https://doi.org/${reference.doi}`
            : reference.url;

          return (
            <li
              key={reference.id}
              className="text-sm md:text-base text-gray-700 leading-relaxed pl-1"
            >
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-800 hover:underline transition-colors"
                >
                  {displayText}
                </a>
              ) : (
                <span>{displayText}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
