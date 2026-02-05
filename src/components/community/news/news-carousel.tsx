'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsCard } from './news-card';
import { FeaturedSpeciesCard } from './featured-species-card';
import { MOCK_NEWS, MOCK_FEATURED_SPECIES } from '@/lib/community/mock-data';

/**
 * News Carousel Component
 *
 * Horizontally scrolling row with a featured species card followed by
 * news cards, all on a dark green background.
 */
export function NewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-green-900 rounded-b-2xl px-8 pb-8 pt-6 relative overflow-hidden">
      {/* Decorative curved lines (extending from header) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 500"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M600 600 A350 350 0 0 1 1000 200"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="80"
          fill="none"
        />
        <path
          d="M500 700 A450 450 0 0 1 1050 100"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="80"
          fill="none"
        />
        <path
          d="M400 800 A550 550 0 0 1 1100 0"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="80"
          fill="none"
        />
      </svg>

      <div className="relative z-10">
        {/* Header with nav buttons */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold text-white">
            Latest News
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable card row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Featured Species Card */}
          <FeaturedSpeciesCard species={MOCK_FEATURED_SPECIES} />

          {/* News Cards */}
          {MOCK_NEWS.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </div>
  );
}
