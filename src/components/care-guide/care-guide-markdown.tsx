import { TextWithMarkdown } from '@/components/ui/text-with-markdown';

interface CareGuideMarkdownProps {
  /**
   * Content from the database or API. Strings are rendered with markdown (**bold**, *italic*, etc.).
   * Use this for any care guide text that may contain markdown.
   */
  children: React.ReactNode;
  className?: string;
  /** Use when content is inline (e.g. inside a list item) to avoid extra block spacing. */
  inline?: boolean;
}

/**
 * Use across all care guide sections for any text that comes from the database.
 * Renders strings with markdown support; passes through JSX unchanged.
 * Single place to get markdown styling everywhere.
 */
export function CareGuideMarkdown({ children, className = '', inline }: CareGuideMarkdownProps) {
  if (typeof children === 'string') {
    return (
      <TextWithMarkdown className={className} inline={inline}>
        {children}
      </TextWithMarkdown>
    );
  }
  return <>{children}</>;
}
