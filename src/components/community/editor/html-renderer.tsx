import { sanitizePostHtml } from '@/lib/community/sanitize'

interface HtmlRendererProps {
  content: string
  className?: string
}

export function HtmlRenderer({ content, className = '' }: HtmlRendererProps) {
  const sanitized = sanitizePostHtml(content)

  return (
    <div
      className={`prose prose-sm max-w-none prose-a:text-green-700 prose-a:underline prose-blockquote:border-l-green-600 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
