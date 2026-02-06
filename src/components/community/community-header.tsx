import Image from 'next/image';

/**
 * Community Header Component
 *
 * Full-width hero with community icon, title, description on dark green
 * background and topo-community pattern overlay on the right.
 */
export function CommunityHeader() {
  return (
    <header className="relative w-full overflow-hidden bg-green-950 min-h-[540px]">
      {/* Topographical pattern: full hero, positioned right so nothing is cut off */}
      <div
        className="absolute inset-0 bg-no-repeat opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/textures/topo-community.png)',
          backgroundPosition: 'right center',
          backgroundSize: 'auto 100%',
        }}
        aria-hidden
      />

      {/* Content: same max-width and padding as page content for alignment */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-32 md:pt-20 md:pb-48">
        <Image
          src="/images/nav-menu-icons/community-light.png"
          alt=""
          width={64}
          height={64}
          className="mb-4"
        />
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
          Community
        </h1>
        <p className="text-white/90 text-base md:text-lg max-w-lg leading-relaxed">
          Connect with fellow turtle enthusiasts, share your experiences,
          and learn from the community. Join discussions, ask questions,
          and help others on their turtle journey.
        </p>
      </div>
    </header>
  );
}
