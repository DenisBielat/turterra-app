import { IconStyle, IconNameMap } from '@/types/icons';

interface IconProps<T extends IconStyle> {
  name: IconNameMap[T];
  style: T;
  size?: 'xsm' | 'sm' | 'base' | 'lg' | 'xlg';
  className?: string;
}

const sizeMap = {
  xsm: '0.5rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.5rem',
  xlg: '2rem'
};

export const Icon = <T extends IconStyle>({ 
  name, 
  style,
  size = 'base',
  className = ''
}: IconProps<T>) => {
  const useCurrentColor = style !== 'color';
  
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        WebkitMaskImage: useCurrentColor ? `url('/icons/${style}/${name}.svg')` : undefined,
        maskImage: useCurrentColor ? `url('/icons/${style}/${name}.svg')` : undefined,
        WebkitMaskRepeat: useCurrentColor ? 'no-repeat' : undefined,
        maskRepeat: useCurrentColor ? 'no-repeat' : undefined,
        WebkitMaskPosition: useCurrentColor ? 'center' : undefined,
        maskPosition: useCurrentColor ? 'center' : undefined,
        WebkitMaskSize: useCurrentColor ? 'contain' : undefined,
        maskSize: useCurrentColor ? 'contain' : undefined,
        backgroundColor: useCurrentColor ? 'currentColor' : undefined,
        backgroundImage: !useCurrentColor ? `url('/icons/${style}/${name}.svg')` : undefined,
        backgroundPosition: !useCurrentColor ? 'center' : undefined,
        backgroundRepeat: !useCurrentColor ? 'no-repeat' : undefined,
        backgroundSize: !useCurrentColor ? 'contain' : undefined,
        width: sizeMap[size],
        height: sizeMap[size],
        verticalAlign: 'middle'
      }}
    />
  );
};

export default Icon;