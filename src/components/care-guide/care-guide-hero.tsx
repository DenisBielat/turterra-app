import Image from 'next/image';
import Link from 'next/link';

interface CareGuideHeroProps {
  commonName: string;
  scientificName: string;
  category: string | null;
  bannerImageUrl: string;
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

export function CareGuideHero({
  commonName,
  scientificName,
  category,
  bannerImageUrl,
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

        {/* Care Guide badge */}
        <span className="inline-block border border-violet-400 text-violet-300 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-4 w-fit">
          Care Guide
        </span>

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-1.5">
          {commonName} Care Guide
        </h1>

        {/* Scientific name & family */}
        {(scientificName || category) && (
          <p className="text-white/60 text-base md:text-lg italic">
            {scientificName}
            {scientificName && category && (
              <span className="not-italic"> | </span>
            )}
            {category && (
              <span className="not-italic">{category}</span>
            )}
          </p>
        )}
      </div>
    </header>
  );
}
