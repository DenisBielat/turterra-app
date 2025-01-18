import { Icon } from '@/components/Icon';
import Image from 'next/image';

interface SpeciesCardProps {
  commonName: string;
  scientificName: string;
  avatarUrl: string;
  backgroundImageUrl?: string;
  variant: {
    sex: string;
    lifeStage: string;
  };
  isComparison?: boolean;
  onRemove?: () => void;
}

export default function SpeciesCard({
  commonName,
  scientificName,
  avatarUrl,
  backgroundImageUrl,
  variant,
  isComparison = false,
  onRemove
}: SpeciesCardProps) {
  return (
    <div className={`relative flex flex-col gap-4 p-4 border border-gray-400 rounded-lg ${
      isComparison ? 'bg-orange-600' : 'bg-green-800'
    }`}>
      {/* Toolbar */}
      <div className="relative z-20 flex justify-between items-center">
        <div className="flex gap-2">
          {['lifeStage', 'sex'].map((type) => (
            <div 
              key={type} 
              className={`px-4 py-1 flex items-center rounded ${
                isComparison ? 'bg-orange-500' : 'bg-green-600'
              }`}
            >
              <span className="h-[18px] text-xs font-semibold text-white">
                {variant[type as keyof typeof variant]}
              </span>
            </div>
          ))}
        </div>
        {!isComparison ? (
          <Icon name="lock" size="sm" style="filled" className="text-orange-500" />
        ) : (
          <button
            onClick={onRemove}
            className="p-1 flex items-center justify-center rounded-full hover:bg-orange-700 transition-colors"
          >
            <Icon name="add" size="sm" style="line" className="text-white rotate-45" />
          </button>
        )}
      </div>

      {/* Species Info */}
      <div className="relative z-20 flex items-center gap-2">
        <div className="relative w-16 h-16">
          <Image
            src={avatarUrl}
            alt={commonName}
            fill
            className="object-cover rounded-full"
            sizes="(max-width: 768px) 100vw, 32vw"
          />
        </div>
        <div>
          <div className="text-xl font-bold text-white font-heading">
            {commonName}
          </div>
          <div className="mt-1 text-white italic">
            {scientificName}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className="absolute inset-0 opacity-70 mix-blend-multiply rounded-lg bg-cover bg-center"
        style={{
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none'
        }}
      />
    </div>
  );
} 