import { Icon } from '@/components/Icon';

type CalloutVariant = 'amber' | 'red';

interface CareGuideCalloutProps {
  variant?: CalloutVariant;
  title: string;
  children: React.ReactNode;
}

const variantConfig: Record<
  CalloutVariant,
  { headerBg: string; bodyBg: string; iconColor: string; texture: string }
> = {
  amber: {
    headerBg: 'bg-orange-800',
    bodyBg: 'bg-orange-700',
    iconColor: 'text-green-700',
    texture: '/images/textures/topo-1-dark.png',
  },
  red: {
    headerBg: 'bg-red-900',
    bodyBg: 'bg-red-800',
    iconColor: 'text-white',
    texture: '/images/textures/topo-2-dark.png',
  },
};

export function CareGuideCallout({
  variant = 'amber',
  title,
  children,
}: CareGuideCalloutProps) {
  const config = variantConfig[variant];

  return (
    <div className="rounded-2xl overflow-hidden">
      {/* Header with topo texture overlay */}
      <div className={`relative ${config.headerBg}`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('${config.texture}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            backgroundSize: '14rem auto',
          }}
        />
        <div className="relative flex items-center gap-3 px-5 py-4">
          <Icon
            name="warning"
            style="filled"
            size="lg"
            className={`flex-shrink-0 ${config.iconColor}`}
          />
          <h3 className="font-heading font-bold text-white text-base md:text-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className={`${config.bodyBg} px-5 py-4`}>
        <div className="text-white text-base leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
