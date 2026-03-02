import Image from 'next/image';
import Link from 'next/link';

interface CareGuideHeroProps {
  commonName: string;
  scientificName: string;
  category: string | null;
  imageUrl: string;
  introText?: string | null;
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

export function CareGuideHero({
  commonName,
  scientificName,
  category,
  imageUrl,
  introText,
}: CareGuideHeroProps) {
  return (
    <header className="bg-warm">
      <div className="max-w-8xl mx-auto px-4 lg:px-10 pt-8 pb-10 md:pt-10 md:pb-14">
        {/* Breadcrumbs */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-green-800 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link href="/learn" className="hover:text-green-800 transition-colors">
                Guides
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-700">{commonName}</li>
          </ol>
        </nav>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="w-full md:w-5/12 flex-shrink-0">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-green-900">
              <Image
                src={imageUrl || PLACEHOLDER_IMAGE}
                alt={commonName}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-7/12">
            {/* Care Guide badge */}
            <span className="inline-block border border-violet-400 text-violet-500 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-4">
              Care Guide
            </span>

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-green-950 mb-2">
              {commonName} Care Guide
            </h1>

            {/* Scientific name & family */}
            {(scientificName || category) && (
              <p className="text-gray-500 text-base md:text-lg mb-5">
                {scientificName && (
                  <span className="italic">{scientificName}</span>
                )}
                {scientificName && category && (
                  <span> | </span>
                )}
                {category}
              </p>
            )}

            {/* Intro text */}
            {introText && (
              <p className="text-gray-700 text-base leading-relaxed max-w-2xl">
                {introText}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
