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
  viewMode?: 'grid' | 'compact' | 'list';
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

  if (viewMode === 'list') {
    return (
      <Link
        href={`/turtle-guide/${slug}`}
        className="group flex items-center gap-4 p-4 bg-green-900/50 rounded-xl hover:bg-green-900 transition-all duration-300 border border-green-800/50 hover:border-green-700/50 hover:shadow-lg hover:shadow-green-950/50"
      >
        {/* Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-green-800">
          <Image
            src={imgSrc}
            alt={commonName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="64px"
            onError={handleImageError}
            unoptimized={imgSrc === PLACEHOLDER_IMAGE}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {familyCommon && (
            <p className="text-green-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
              {familyCommon}
            </p>
          )}
          <h3 className="font-heading font-bold text-white text-lg group-hover:text-green-400 transition-colors truncate">
            {commonName}
          </h3>
          {scientificName && (
            <p className="text-gray-500 text-sm italic truncate">
              {scientificName}
            </p>
          )}
        </div>

        {/* Conservation Badge */}
        {conservationStatus && (
          <span className={`px-3 py-1.5 rounded-full text-white text-xs font-semibold flex-shrink-0 backdrop-blur-sm ${getConservationBadgeColor(conservationStatus.code)}`}>
            {conservationStatus.status}
          </span>
        )}
      </Link>
    );
  }

  if (viewMode === 'compact') {
    return (
      <Link
        href={`/turtle-guide/${slug}`}
        className="group relative block aspect-square rounded-2xl overflow-hidden bg-green-900 ring-1 ring-white/5 hover:ring-white/20 shadow-lg hover:shadow-xl hover:shadow-black/30 transform-gpu will-change-transform transition-[transform,box-shadow,ring-color] duration-300 ease-out hover:scale-[1.02]"
      >
        {/* Image with separate scale */}
        <Image
          src={imgSrc}
          alt={commonName}
          fill
          className="object-cover transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          onError={handleImageError}
          unoptimized={imgSrc === PLACEHOLDER_IMAGE}
        />

        {/* Conservation Badge - appears on hover */}
        {conservationStatus && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-semibold z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm ${getConservationBadgeColor(conservationStatus.code)}`}>
            {conservationStatus.status}
          </span>
        )}

        {/* Gradient overlay - stronger for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          {familyCommon && (
            <p className="text-green-500 text-xs font-semibold uppercase tracking-wider mb-1">
              {familyCommon}
            </p>
          )}
          <h3 className="font-heading font-bold text-white text-sm drop-shadow-lg line-clamp-2">
            {commonName}
          </h3>
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
