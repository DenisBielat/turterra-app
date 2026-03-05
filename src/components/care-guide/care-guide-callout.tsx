import { Icon } from '@/components/Icon';
import { CareGuideMarkdown } from './care-guide-markdown';

type CalloutVariant = 'amber' | 'red' | 'green' | 'blue';

interface CareGuideCalloutProps {
  variant?: CalloutVariant;
  title: string;
  /** Body content. Pass a string from the DB; use **bold** in the text for bold. */
  children: React.ReactNode;
  /** When true, card is shown at 10% opacity (e.g. when section is not in view). */
  dimmed?: boolean;
}

const variantConfig: Record<
  CalloutVariant,
  {
    headerBg: string;
    bodyBg: string;
    iconColor: string;
    iconName: string;
    texture: string;
    textureOpacity: number;
    /** Tailwind text color class for the header title */
    headerTextColor: string;
    /** Tailwind text color class for the body content */
    bodyTextColor: string;
  }
> = {
  amber: {
    headerBg: 'bg-orange-600',
    bodyBg: 'bg-[#E79319]/20',
    iconColor: 'text-orange-500',
    iconName: 'warning-triangle',
    texture: '/images/textures/topo-1-dark.png',
    textureOpacity: 0.10,
    headerTextColor: 'text-white',
    bodyTextColor: 'text-black',
  },
  red: {
    headerBg: 'bg-red-900',
    bodyBg: 'bg-red-800/20',
    iconColor: 'text-orange-500',
    iconName: 'warning-triangle',
    texture: '/images/textures/topo-2-dark.png',
    textureOpacity: 0.10,
    headerTextColor: 'text-white',
    bodyTextColor: 'text-black',
  },
  green: {
    headerBg: 'bg-green-800',
    bodyBg: 'bg-green-700/20',
    iconColor: 'text-green-400',
    iconName: 'info-circle-flex-solid',
    texture: '/images/textures/topo-green-1.png',
    textureOpacity: 0.10,
    headerTextColor: 'text-white',
    bodyTextColor: 'text-black',
  },
  blue: {
    headerBg: 'bg-blue-800',
    bodyBg: 'bg-blue-600/20',
    iconColor: 'text-blue-200',
    iconName: 'info-circle-flex-solid',
    texture: '/images/textures/topo-blue-1.png',
    textureOpacity: 0.10,
    headerTextColor: 'text-white',
    bodyTextColor: 'text-black',
  },
};

export function CareGuideCallout({
  variant = 'amber',
  title,
  children,
  dimmed = false,
}: CareGuideCalloutProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-opacity duration-300 ${config.bodyBg} ${dimmed ? 'opacity-10' : 'opacity-100'}`}
    >
      {/* Header overlays the top of the card for a seamless look */}
      <div className={`absolute inset-x-0 top-0 z-10 rounded-t-2xl ${config.headerBg}`}>
        <div
          className="absolute inset-0 rounded-t-2xl"
          style={{
            backgroundImage: `url('${config.texture}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '35% 75%',
            backgroundSize: '150%',
            opacity: config.textureOpacity,
          }}
        />
        <div className="relative flex items-center gap-3 px-5 py-4">
          <Icon
            name={config.iconName as 'warning-triangle' | 'info-circle-flex-solid'}
            style="filled"
            size="lg"
            className={`flex-shrink-0 ${config.iconColor}`}
          />
          <h3 className={`font-heading font-bold text-base md:text-lg ${config.headerTextColor}`}>
            {title}
          </h3>
        </div>
      </div>

      {/* Body: padding-top reserves space so text sits below the header */}
      <div className="relative rounded-b-2xl px-5 pt-[72px] pb-4">
        <div className={`${config.bodyTextColor} text-base leading-relaxed`}>
          <CareGuideMarkdown>{children}</CareGuideMarkdown>
        </div>
      </div>
    </div>
  );
}
