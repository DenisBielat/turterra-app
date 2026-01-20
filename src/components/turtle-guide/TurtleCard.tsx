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

// Conservation status badge colors
const getConservationBadgeColor = (code: string) => {
  switch (code) {
    case 'LC': // Least Concern
      return 'bg-green-600';
    case 'NT': // Near Threatened
      return 'bg-green-700';
    case 'VU': // Vulnerable
      return 'bg-yellow-500';
    case 'EN': // Endangered
      return 'bg-orange-500';
    case 'CR': // Critically Endangered
      return 'bg-red-600';
    case 'EW': // Extinct in the Wild
    case 'EX': // Extinct
      return 'bg-red-800';
    case 'DD': // Data Deficient
    case 'NE': // Not Evaluated
    default:
      return 'bg-gray-500';
  }
};

export default function TurtleCard({
  commonName,
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
        className="group flex items-center gap-4 p-4 bg-green-900/50 rounded-lg hover:bg-green-900 transition-colors border border-green-800/50"
      >
        {/* Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-green-800">
          <Image
            src={imgSrc}
            alt={commonName}
            fill
            className="object-cover"
            sizes="64px"
            onError={handleImageError}
            unoptimized={imgSrc === PLACEHOLDER_IMAGE}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-white text-lg group-hover:text-green-400 transition-colors truncate">
            {commonName}
          </h3>
          {familyCommon && (
            <p className="text-gray-400 text-sm uppercase tracking-wide truncate">
              {familyCommon}
            </p>
          )}
        </div>

        {/* Conservation Badge */}
        {conservationStatus && (
          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold flex-shrink-0 ${getConservationBadgeColor(conservationStatus.code)}`}>
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
        className="group relative block aspect-square rounded-lg overflow-hidden bg-green-900"
      >
        {/* Image */}
        <Image
          src={imgSrc}
          alt={commonName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          onError={handleImageError}
          unoptimized={imgSrc === PLACEHOLDER_IMAGE}
        />

        {/* Conservation Badge */}
        {conservationStatus && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-semibold z-10 ${getConservationBadgeColor(conservationStatus.code)}`}>
            {conservationStatus.status}
          </span>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-heading font-semibold text-white text-sm group-hover:text-green-400 transition-colors line-clamp-2">
            {commonName}
          </h3>
        </div>
      </Link>
    );
  }

  // Default grid view
  return (
    <Link
      href={`/turtle-guide/${slug}`}
      className="group relative block aspect-[4/5] rounded-lg overflow-hidden bg-green-900"
    >
      {/* Image */}
      <Image
        src={imgSrc}
        alt={commonName}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        onError={handleImageError}
        unoptimized={imgSrc === PLACEHOLDER_IMAGE}
      />

      {/* Conservation Badge */}
      {conservationStatus && (
        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-semibold z-10 ${getConservationBadgeColor(conservationStatus.code)}`}>
          {conservationStatus.status}
        </span>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="font-heading font-semibold text-white text-lg group-hover:text-green-400 transition-colors">
          {commonName}
        </h3>
        {familyCommon && (
          <p className="text-gray-300 text-sm uppercase tracking-wide mt-1">
            {familyCommon}
          </p>
        )}
      </div>
    </Link>
  );
}
