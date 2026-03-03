import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TextWithMarkdownProps {
  /** Database or API text; use **bold** for bold. */
  children: string;
  className?: string;
  /** Render as inline (span) to avoid block spacing when inside lists or other text. */
  inline?: boolean;
}

/**
 * Renders a string with markdown support (e.g. **bold**, *italic*, links).
 * Use wherever you display text from the database and want to support bold/formatting.
 */
export function TextWithMarkdown({ children, className = '', inline }: TextWithMarkdownProps) {
  return (
    <span className={inline ? `inline ${className}`.trim() : className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (inline ? <span className="inline">{children}</span> : <p className="mb-0 last:mb-0">{children}</p>),
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
        }}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}
