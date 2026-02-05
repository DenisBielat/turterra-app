import Link from 'next/link';
import Image from 'next/image';
import { Gem } from 'lucide-react';
import { MockFeaturedSpecies } from '@/lib/community/mock-data';
import { formatDate } from '@/lib/community/utils';

interface FeaturedSpeciesCardProps {
  species: MockFeaturedSpecies;
}

/**
 * Featured Species Card Component
 *
 * Displays the weekly featured species with a full photo background,
 * species name, description, and a link to the species guide profile.
 */
export function FeaturedSpeciesCard({ species }: FeaturedSpeciesCardProps) {
  return (
    <Link
      href={`/turtle-guide/${species.species_slug}`}
      className="flex-shrink-0 w-72 rounded-xl overflow-hidden relative group hover:shadow-lg transition-shadow"
    >
      {/* Background image */}
      <div className="relative w-full h-full min-h-[360px]">
        {/* Placeholder background color if image fails to load */}
        <div className="absolute inset-0 bg-green-800" />
        <Image
          src={species.image_url}
          alt={species.species_common_name}
          fill
          className="object-cover"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600 text-white mb-2">
            <Gem className="h-3 w-3" />
            Featured Species
          </span>

          {/* Species Name */}
          <h3 className="font-heading text-xl font-bold text-white leading-tight">
            {species.species_common_name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-gray-200 line-clamp-3 leading-relaxed">
            {species.description}
          </p>

          {/* Footer */}
          <div className="mt-3 text-xs text-gray-300">
            <span>{species.source_name}</span>
            <span> | </span>
            <span>{formatDate(species.feature_start_date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
