"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TurtleCardProps {
  commonName: string;
  scientificName?: string;
  familyCommon: string | null;
  slug: string;
  imageUrl: string | null;
  conservationStatus: {
    code: string;
    status: string;
  } | null;
  habitats?: string[];
  viewMode?: 'grid' | 'list';
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

// Conservation status badge colors - matching profile page
const getConservationBadgeColor = (code: string) => {
  switch (code) {
    // Extinct categories - red
    case 'EX':
    case 'EW':
      return 'bg-red-500';

    // Threatened categories - orange
    case 'CR':
    case 'EN':
    case 'VU':
      return 'bg-orange-500';

    // Near Threatened and Least Concern - green
    case 'NT':
    case 'LC':
      return 'bg-green-800';

    // Lacks Data - gray
    case 'DD':
    case 'NE':
    default:
      return 'bg-gray-500';
  }
};

export default function TurtleCard({
  commonName,
  scientificName,
  familyCommon,
  slug,
  imageUrl,
  conservationStatus,
  habitats = [],
  viewMode = 'grid'
}: TurtleCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || PLACEHOLDER_IMAGE);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(PLACEHOLDER_IMAGE);
    }
  };

  // List view - Audubon style with image left, content middle, details right
  if (viewMode === 'list') {
    return (
      <Link
        href={`/turtle-guide/${slug}`}
        className="group block bg-green-900/50 rounded-2xl overflow-hidden hover:bg-green-900/70 transition-all duration-300 border border-green-800/50 hover:border-green-700/50"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image - larger square on left */}
          <div className="relative w-full md:w-48 lg:w-56 aspect-square md:aspect-auto md:h-auto flex-shrink-0 bg-green-800">
            <Image
              src={imgSrc}
              alt={commonName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 224px"
              onError={handleImageError}
              unoptimized={imgSrc === PLACEHOLDER_IMAGE}
            />
          </div>

          {/* Content area */}
          <div className="flex flex-col lg:flex-row flex-1 p-5 lg:p-6 gap-6">
            {/* Left content - Name and description */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 className="font-heading font-bold text-white text-2xl group-hover:text-green-400 transition-colors">
                {commonName}
              </h3>
              {scientificName && (
                <p className="text-gray-400 text-base italic mt-1">
                  {scientificName}
                </p>
              )}

              {/* Family label */}
              {familyCommon && (
                <div className="mt-4">
                  <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
                    Family
                  </p>
                  <p className="text-gray-300 text-sm">
                    {familyCommon}
                  </p>
                </div>
              )}
            </div>

            {/* Right content - Conservation and Habitat */}
            <div className="lg:w-64 flex-shrink-0 space-y-4">
              {/* Conservation Status */}
              {conservationStatus && (
                <div>
                  <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
                    Conservation Status
                  </p>
                  <p className="text-gray-300 text-sm">
                    {conservationStatus.status}
                  </p>
                </div>
              )}

              {/* Habitat */}
              {habitats.length > 0 && (
                <div>
                  <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
                    Habitat
                  </p>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {habitats.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default grid view - enhanced with parallax effect and smooth animations
  return (
    <Link
      href={`/turtle-guide/${slug}`}
      className="group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-green-900 ring-1 ring-white/5 hover:ring-white/20 shadow-lg hover:shadow-2xl hover:shadow-black/40 transform-gpu will-change-transform transition-[transform,box-shadow,ring-color] duration-300 ease-out hover:scale-[1.02]"
    >
      {/* Image with separate scale for parallax effect */}
      <Image
        src={imgSrc}
        alt={commonName}
        fill
        className="object-cover transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={handleImageError}
        unoptimized={imgSrc === PLACEHOLDER_IMAGE}
      />

      {/* Conservation Badge - appears on hover with blur */}
      {conservationStatus && (
        <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-white text-xs font-semibold z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm ${getConservationBadgeColor(conservationStatus.code)}`}>
          {conservationStatus.status}
        </span>
      )}

      {/* Gradient overlay - stronger for reliable text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {/* Family as eyebrow label */}
        {familyCommon && (
          <p className="text-green-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            {familyCommon}
          </p>
        )}

        {/* Turtle name - larger and bolder */}
        <h3 className="font-heading font-bold text-white text-xl drop-shadow-lg">
          {commonName}
        </h3>

        {/* Scientific name - visible by default */}
        {scientificName && (
          <p className="text-gray-400 text-sm italic mt-1">
            {scientificName}
          </p>
        )}
      </div>
    </Link>
  );
}
