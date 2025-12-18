'use client';

import Image from 'next/image';
import { Icon } from '@/components/Icon';

// Shadcn UI components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Import props interface
import { SpeciesCardProps } from '@/types/turtleTypes';

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
    <Card className="relative overflow-hidden h-full">
      {/* Overlay background: 
          We can keep the background color and an optional overlay image */}
      <div
        className={
          isComparison
            ? 'absolute inset-0 bg-orange-600'
            : 'absolute inset-0 bg-green-800'
        }
      />
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 opacity-70 mix-blend-multiply bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      {/* Card Header */}
      <CardHeader className="relative z-10 flex flex-col px-4 pt-4 pb-0">
        <div className="flex justify-between items-center">
          {/* Variant Badges */}
          <div className="flex gap-2">
            {['lifeStage', 'sex'].map((key) => {
              const label = variant[key as keyof typeof variant];
              return (
                <div
                  key={key}
                  className={
                    isComparison
                      ? 'px-4 py-1 flex items-center rounded bg-orange-500'
                      : 'px-4 py-1 flex items-center rounded bg-green-600'
                  }
                >
                  <span className="h-[18px] text-xs font-semibold text-white">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Remove / Lock Icon */}
          {!isComparison ? (
            <Icon name="lock" size="sm" style="filled" className="text-orange-500" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="hover:bg-orange-700 hover:text-white text-white p-2 w-auto h-auto rounded-full"
              aria-label="Remove comparison species"
            >
              <Icon name="close" size="sm" style="line" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* CardContent */}
      <CardContent className="relative z-10 p-4 flex items-center gap-2">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={commonName}
            fill
            className="object-cover rounded-full"
            sizes="(max-width: 768px) 100vw, 32vw"
          />
        </div>
        <div>
          <CardTitle className="text-xl text-white">
            {commonName}
          </CardTitle>
          <p className="mt-1 text-white italic">{scientificName}</p>
        </div>
      </CardContent>
    </Card>
  );
}