'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsCard } from './news-card';
import { MOCK_NEWS } from '@/lib/community/mock-data';

/**
 * News Carousel Component
 *
 * Horizontally scrolling row of news cards with navigation arrows.
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
    <div className="bg-stone-100 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold text-green-950">
          Latest News
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {MOCK_NEWS.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
}
