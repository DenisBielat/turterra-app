import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CareGuideSectionProps {
  id: string;
  title: string;
  content: string | null;
}

export function CareGuideSection({ id, title, content }: CareGuideSectionProps) {
  if (!content) return null;

  return (
    <section id={id} className="scroll-mt-40">
      {/* Heading */}
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-black mb-6">
        {title}
      </h2>

      {/* Markdown content */}
      <div className="prose prose-gray max-w-none text-base md:text-lg leading-relaxed
        prose-headings:font-heading prose-headings:text-black
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-black prose-p:mb-4
        prose-li:text-black
        prose-strong:text-black
        prose-a:text-green-700 prose-a:underline
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}
