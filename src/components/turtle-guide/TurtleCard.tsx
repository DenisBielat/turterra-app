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
  avatarUrl?: string | null;
  description?: string | null;
  conservationStatus: {
    code: string;
    status: string;
  } | null;
  habitats?: string[];
  viewMode?: 'grid' | 'list' | 'compact';
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

// Strip markdown formatting for plain text display
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/#{1,6}\s/g, '')        // Headers
    .replace(/`(.*?)`/g, '$1')       // Inline code
    .trim();
};

export default function TurtleCard({
  commonName,
  scientificName,
  familyCommon,
  slug,
  imageUrl,
  avatarUrl,
  description,
  conservationStatus,
  habitats = [],
  viewMode = 'grid'
}: TurtleCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || PLACEHOLDER_IMAGE);
  const [listImgSrc, setListImgSrc] = useState(avatarUrl || imageUrl || PLACEHOLDER_IMAGE);
  const [imgError, setImgError] = useState(false);
  const [listImgError, setListImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(PLACEHOLDER_IMAGE);
    }
  };

  const handleListImageError = () => {
    if (!listImgError) {
      setListImgError(true);
      setListImgSrc(PLACEHOLDER_IMAGE);
    }
  };

  // Compact view - compact grid cards with circular image, name, and scientific name only
  if (viewMode === 'compact') {
    return (
      <Link
        href={`/turtle-guide/${slug}`}
        className="group block bg-green-900/50 rounded-xl hover:bg-green-900/70 transition-all duration-300 border border-green-800/50 hover:border-green-700/50 p-4"
      >
        <div className="flex items-center gap-4">
          {/* Circular image */}
          <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-green-900/50">
            <Image
              src={listImgSrc}
              alt={commonName}
              fill
              className="object-cover"
              sizes="64px"
              onError={handleListImageError}
              unoptimized={listImgSrc === PLACEHOLDER_IMAGE}
            />
          </div>

          {/* Name and Scientific Name */}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-white text-lg group-hover:text-green-400 transition-colors truncate">
              {commonName}
            </h3>
            {scientificName && (
              <p className="text-gray-400 text-sm italic mt-0.5 truncate">
                {scientificName}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // List view - CSS Grid layout matching reference design
  if (viewMode === 'list') {
    return (
      <Link
        href={`/turtle-guide/${slug}`}
        className="group block bg-green-900/50 rounded-2xl hover:bg-green-900/70 transition-all duration-300 border border-green-800/50 hover:border-green-700/50 p-5"
        style={{
          fontSize: '18px',
          lineHeight: '28px',
          letterSpacing: '0.01em',
          color: '#E5E2DE',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          transition: 'opacity 0.5s, transform 0.5s, height 0.5s'
        }}
      >
        <div
          className="grid items-start"
          style={{
            display: 'grid',
            alignItems: 'start',
            gap: '10px 20px',
            gridTemplateColumns: '1fr 2fr 2fr',
            gridTemplateAreas: '"media content status" "media description habitats"'
          }}
        >
          {/* Image - circular in media grid area */}
          <div
            className="relative rounded-full overflow-hidden bg-green-900/50"
            style={{
              gridArea: 'media',
              width: '100%',
              height: 'auto',
              aspectRatio: '1 / 1'
            }}
          >
            <Image
              src={listImgSrc}
              alt={commonName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 200px"
              onError={handleListImageError}
              unoptimized={listImgSrc === PLACEHOLDER_IMAGE}
            />
          </div>

          {/* Content area - Name and Scientific Name */}
          <div style={{ gridArea: 'content' }}>
            <h3 className="font-heading font-bold text-white text-2xl group-hover:text-green-400 transition-colors">
              {commonName}
            </h3>
            {scientificName && (
              <p className="text-gray-400 text-base italic mt-1">
                {scientificName}
              </p>
            )}
          </div>

          {/* Conservation Status */}
          {conservationStatus && (
            <div style={{ gridArea: 'status' }}>
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Conservation Status
              </p>
              <p className="text-gray-300 text-base">
                {conservationStatus.status}
              </p>
            </div>
          )}

          {/* At a Glance description */}
          {description && (
            <div style={{ gridArea: 'description' }}>
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-2">
                At a Glance
              </p>
              <p className="text-gray-300 text-base leading-relaxed line-clamp-4">
                {stripMarkdown(description)}
              </p>
            </div>
          )}

          {/* Habitat */}
          {habitats.length > 0 && (
            <div style={{ gridArea: 'habitats' }}>
              <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Habitat
              </p>
              <p className="text-gray-300 text-base line-clamp-3">
                {habitats.join(', ')}
              </p>
            </div>
          )}
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
