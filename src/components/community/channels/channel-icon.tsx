import { Hash } from 'lucide-react';

interface ChannelIconProps {
  svg?: string | null;
  name: string;
  size?: number;
}

/**
 * Channel Icon Component
 *
 * Renders a channel's custom SVG icon from the icon_svg column in Supabase.
 * Falls back to a Hash icon when no SVG is provided.
 *
 * To set an icon: paste the full <svg>...</svg> markup into the channel's
 * icon_svg column in Supabase.
 */
export function ChannelIcon({ svg, name, size = 48 }: ChannelIconProps) {
  const sizeClass = size >= 64 ? 'w-16 h-16' : 'w-12 h-12';
  const fallbackIconClass = size >= 64 ? 'h-8 w-8' : 'h-6 w-6';

  if (svg) {
    return (
      <div
        className={`${sizeClass} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}
        role="img"
        aria-label={`${name} icon`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center flex-shrink-0 bg-green-700`}
    >
      <Hash className={`${fallbackIconClass} text-white`} />
    </div>
  );
}
