import { Icon } from '@/components/Icon';
import { TextWithMarkdown } from '@/components/ui/text-with-markdown';

type CalloutVariant = 'amber' | 'red' | 'green' | 'blue';

interface CareGuideCalloutProps {
  variant?: CalloutVariant;
  title: string;
  /** Body content. Pass a string from the DB; use **bold** in the text for bold. */
  children: React.ReactNode;
}

const variantConfig: Record<
  CalloutVariant,
  { headerBg: string; bodyBg: string; iconColor: string; iconName: string; texture: string; textureOpacity: number }
> = {
  amber: {
    headerBg: 'bg-orange-600',
    bodyBg: 'bg-[#E79319]',
    iconColor: 'text-orange-500',
    iconName: 'warning-triangle',
    texture: '/images/textures/topo-1-dark.png',
    textureOpacity: 0.10,
  },
  red: {
    headerBg: 'bg-red-900',
    bodyBg: 'bg-red-800',
    iconColor: 'text-orange-500',
    iconName: 'warning-triangle',
    texture: '/images/textures/topo-2-dark.png',
    textureOpacity: 0.10,
  },
  green: {
    headerBg: 'bg-green-800',
    bodyBg: 'bg-green-700',
    iconColor: 'text-green-400',
    iconName: 'info-circle-flex-solid',
    texture: '/images/textures/topo-green-1.png',
    textureOpacity: 0.10,
  },
  blue: {
    headerBg: 'bg-blue-900',
    bodyBg: 'bg-blue-800',
    iconColor: 'text-blue-400',
    iconName: 'info-circle-flex-solid',
    texture: '/images/textures/topo-blue-1.png',
    textureOpacity: 0.10,
  },
};

export function CareGuideCallout({
  variant = 'amber',
  title,
  children,
}: CareGuideCalloutProps) {
  const config = variantConfig[variant];

  return (
    <div className={`relative rounded-2xl overflow-hidden ${config.bodyBg}`}>
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
          <h3 className="font-heading font-bold text-white text-base md:text-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Body: padding-top reserves space so text sits below the header */}
      <div className="relative rounded-b-2xl px-5 pt-[72px] pb-4">
        <div className="text-white text-base leading-relaxed">
          {typeof children === 'string' ? (
            <TextWithMarkdown>{children}</TextWithMarkdown>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
