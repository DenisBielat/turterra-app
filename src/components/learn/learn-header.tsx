import Image from 'next/image';
import { Icon } from '@/components/Icon';

/**
 * Learn Header Component
 *
 * Full-width hero with learn icon, badge, title, description, and
 * placeholder search bar on dark green background with topo pattern.
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

      {/* Content aligned with navbar via max-w-8xl + px-10 */}
      <div className="relative z-10 max-w-8xl mx-auto px-4 lg:px-10 pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Icon */}
        <Image
          src="/images/nav-menu-icons/guides-light.png"
          alt=""
          width={64}
          height={64}
          className="mb-5"
        />

        {/* Badge */}
        <div className="mb-4">
          <span className="inline-block border border-green-600 text-green-400 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full">
            Care Guides, Articles, and More
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
          Learn Everything Turtle
        </h1>

        {/* Description */}
        <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed mb-8">
          Everything you need to give your shelled companion the best life
          possible. From species-specific care sheets to in-depth topic articles.
        </p>

        {/* Placeholder search bar */}
        <div className="max-w-xl">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" style="line" size="lg" />
            </span>
            <input
              type="text"
              placeholder="Search guides, articles, and more..."
              disabled
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
