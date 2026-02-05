'use client';

import { useState } from 'react';
import { ArrowUpDown, Flame, Clock, TrendingUp, List, LayoutGrid } from 'lucide-react';
import { MOCK_POSTS } from '@/lib/community/mock-data';
import { PostCard } from './post-card';
import { PostCardCompact } from './post-card-compact';
import { cn } from '@/lib/utils';

type SortOption = 'hot' | 'new' | 'top';
type ViewMode = 'rich' | 'compact';

/**
 * Post Feed Component
 *
 * Displays the list of posts with sort controls and view toggle.
 */
export function PostFeed() {
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [viewMode, setViewMode] = useState<ViewMode>('rich');

  // In real implementation, sorting would be done via API
  const sortedPosts = [...MOCK_POSTS].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        // Hot combines score and recency - simplified for mock
        return b.score - a.score;
      case 'new':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'top':
        return b.score - a.score;
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Controls Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Sort Options */}
        <div className="flex items-center gap-1 bg-white rounded-full border border-gray-200 p-1">
          <button
            onClick={() => setSortBy('hot')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              sortBy === 'hot'
                ? 'bg-gray-100 text-green-950'
                : 'text-gray-600 hover:text-green-950'
            )}
          >
            <Flame className="h-4 w-4" />
            Hot
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              sortBy === 'new'
                ? 'bg-gray-100 text-green-950'
                : 'text-gray-600 hover:text-green-950'
            )}
          >
            <Clock className="h-4 w-4" />
            New
          </button>
          <button
            onClick={() => setSortBy('top')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              sortBy === 'top'
                ? 'bg-gray-100 text-green-950'
                : 'text-gray-600 hover:text-green-950'
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Top
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode('compact')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'compact'
                ? 'bg-gray-100 text-green-950'
                : 'text-gray-400 hover:text-green-950'
            )}
            aria-label="Compact view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('rich')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'rich'
                ? 'bg-gray-100 text-green-950'
                : 'text-gray-400 hover:text-green-950'
            )}
            aria-label="Rich view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Posts List */}
      {viewMode === 'rich' ? (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {sortedPosts.map((post) => (
            <PostCardCompact key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
