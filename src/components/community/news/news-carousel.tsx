'use client';

import { useRef } from 'react';
import Link from 'next/link';
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
    <div className="pb-8 pt-6 relative">
      <div className="relative z-10">
        {/* Header with nav buttons - over hero, use light text */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-lg font-semibold text-white">
              Latest News
            </h2>
            <Link
              href="/community/news"
              className="text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
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
