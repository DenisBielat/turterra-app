import { Hash } from 'lucide-react';

interface ChannelIconProps {
  svg?: string | null;
  name: string;
  bgColor?: string;
  size?: number;
}

/**
 * Channel Icon Component
 *
 * Renders a channel's custom SVG icon inside a colored rounded container.
 * The SVG is rendered white to match the colored background.
 * Falls back to a Hash icon when no SVG is provided.
 *
 * To set an icon: paste the full <svg>...</svg> markup into the channel's
 * icon_svg column in Supabase.
 */
export function ChannelIcon({ svg, name, bgColor = 'bg-green-700', size = 48 }: ChannelIconProps) {
  const sizeClass = size >= 64 ? 'w-16 h-16' : 'w-12 h-12';
  const fallbackIconClass = size >= 64 ? 'h-8 w-8' : 'h-6 w-6';
  const svgSizeClass = size >= 64 ? '[&_svg]:w-8 [&_svg]:h-8' : '[&_svg]:w-6 [&_svg]:h-6';

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}
    >
      {svg ? (
        <div
          className={`text-white [&_svg]:stroke-white [&_svg]:fill-none ${svgSizeClass}`}
          role="img"
          aria-label={`${name} icon`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <Hash className={`${fallbackIconClass} text-white`} />
      )}
    </div>
  );
}
