import Image from 'next/image';

/**
 * Learn Header Component
 *
 * Full-width hero with learn icon, title, description on dark green
 * background and topographical pattern overlay on the right.
 */
export function LearnHeader() {
  return (
    <header className="relative w-full overflow-hidden bg-green-950 min-h-[540px]">
      {/* Topographical pattern: full hero, positioned right */}
      <div
        className="absolute inset-0 bg-no-repeat opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/textures/topo-community.png)',
          backgroundPosition: '600% center',
          backgroundSize: 'auto 300%',
        }}
        aria-hidden
      />

      {/* Content: same max-width and padding as page content for alignment */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-32 md:pt-20 md:pb-48">
        <Image
          src="/images/nav-menu-icons/guides-light.png"
          alt=""
          width={64}
          height={64}
          className="mb-4"
        />
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
          Learn
        </h1>
        <p className="text-white/90 text-base md:text-lg max-w-lg leading-relaxed">
          Everything you need to know about turtle keeping. Explore care guides,
          habitat setup tips, diet and nutrition advice, and more to give your
          shelled friends the best life possible.
        </p>
      </div>
    </header>
  );
}
