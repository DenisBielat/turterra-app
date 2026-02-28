import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

interface CareGuideHeroProps {
  commonName: string;
  scientificName: string;
  category: string | null;
  bannerImageUrl: string;
  difficulty: string | null;
  lifespan: string | null;
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

export function CareGuideHero({
  commonName,
  scientificName,
  category,
  bannerImageUrl,
  difficulty,
  lifespan,
}: CareGuideHeroProps) {
  return (
    <header className="relative w-full h-[420px] md:h-[480px] overflow-hidden bg-green-950">
      {/* Background image */}
      <Image
        src={bannerImageUrl || PLACEHOLDER_IMAGE}
        alt={commonName}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/60 to-green-950/30" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-8xl mx-auto px-4 lg:px-10 flex flex-col justify-end pb-10 md:pb-14">
        {/* Breadcrumbs */}
        <nav className="mb-5" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-white/60">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li className="text-white/40">/</li>
            <li>
              <Link href="/learn" className="hover:text-white transition-colors">
                Care Guides
              </Link>
            </li>
            <li className="text-white/40">/</li>
            <li className="text-white/90">{commonName}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            {/* Category badge */}
            {category && (
              <span className="inline-block border border-green-500 text-green-400 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-4">
                {category}
              </span>
            )}

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-1.5">
              {commonName} Care Guide
            </h1>

            {/* Scientific name */}
            {scientificName && (
              <p className="text-white/60 text-base md:text-lg italic">
                {scientificName}
              </p>
            )}
          </div>

          {/* Difficulty + Lifespan pills */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {difficulty && (
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full">
                <Icon name="category" style="line" size="sm" className="text-green-400" />
                Difficulty: {difficulty}
              </span>
            )}
            {lifespan && (
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full">
                <Icon name="clock" style="line" size="sm" className="text-green-400" />
                Lifespan: {lifespan}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
