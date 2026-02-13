import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize HTML output from the Quill rich text editor.
 * Allows safe formatting tags while stripping dangerous elements.
 */
export function sanitizePostHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h1', 'h2', 'h3',
      'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'a', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['class'],
      pre: ['class'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  }).trim()
}
