interface Reference {
  id: number;
  text: string;
  url?: string | null;
}

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
        {references.map((reference) => (
          <li
            key={reference.id}
            className="text-sm md:text-base text-gray-700 leading-relaxed pl-1"
          >
            {reference.url ? (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-800 hover:underline transition-colors"
              >
                {reference.text}
              </a>
            ) : (
              <span>{reference.text}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
