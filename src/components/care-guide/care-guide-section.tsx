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
      {/* Heading with green left accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-green-600 rounded-full" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-950">
          {title}
        </h2>
      </div>

      {/* Markdown content */}
      <div className="prose prose-gray max-w-none text-base leading-relaxed
        prose-headings:font-heading prose-headings:text-green-950
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:mb-4
        prose-li:text-gray-700
        prose-strong:text-green-950
        prose-a:text-green-700 prose-a:underline
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}
