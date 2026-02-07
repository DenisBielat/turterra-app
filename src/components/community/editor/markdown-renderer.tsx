import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose prose-sm max-w-none ${className}`}
      components={{
        a: ({ children, href, ...props }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
        img: ({ src, alt, ...props }) => (
          <img
            src={src}
            alt={alt ?? ''}
            className="rounded-lg max-h-96 object-contain"
            loading="lazy"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
