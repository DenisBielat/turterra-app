import Link from 'next/link';
import Image from 'next/image';
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
      className="group flex-shrink-0 w-72 h-[384px] rounded-xl overflow-hidden relative shadow-sm block"
    >
      {/* Background image + border layer (below gradient) */}
      <div className="relative w-full h-[384px] border-[3px] border-orange-500 rounded-xl overflow-hidden">
        {/* Placeholder background color if image fails to load */}
        <div className="absolute inset-0 bg-green-800 rounded-xl" />
        <Image
          src={species.image_url}
          alt={species.species_common_name}
          fill
          className="object-cover rounded-xl transition-transform duration-300 ease-out group-hover:scale-105"
          sizes="288px"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-xl" />

        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Featured Species label: icon + text (no badge) */}
          <div className="flex items-center gap-1.5 mb-2">
            <Image
              src="/images/nav-menu-icons/species-id-light.png"
              alt=""
              width={16}
              height={16}
              className="flex-shrink-0"
            />
            <span className="text-xs font-semibold text-white">
              Featured Species
            </span>
          </div>

          {/* Species Name */}
          <h3 className="font-heading text-2xl font-bold text-white leading-tight">
            {species.species_common_name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-sm text-gray-200 line-clamp-3">
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
