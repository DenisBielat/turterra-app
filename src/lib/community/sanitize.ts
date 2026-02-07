import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize user-provided markdown text.
 * Strips any HTML tags that a user might try to inject into markdown.
 * The markdown will be rendered safely by react-markdown later.
 */
export function sanitizeMarkdown(input: string): string {
  // Strip all HTML tags — we only want plain markdown
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim()
}
