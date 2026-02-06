'use client';

import { useState } from 'react';
import { FeedControls } from './feed-controls';
import { PostCard } from './post-card';
import { PostCardCompact } from './post-card-compact';
import { MockPost } from '@/lib/community/mock-data';

type ViewMode = 'rich' | 'compact';

interface PostFeedClientProps {
  sort: 'hot' | 'new' | 'top';
  initialViewMode: ViewMode;
  posts: MockPost[];
  userVotes: Record<number, number>;
}

/**
 * Post Feed Client Component
 *
 * Manages view mode as client-side state for instant toggling.
 * Receives server-fetched posts and user votes as props.
 */
export function PostFeedClient({
  sort,
  initialViewMode,
  posts,
  userVotes,
}: PostFeedClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  return (
    <div>
      <FeedControls
        sort={sort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'rich' ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userVote={userVotes[post.id]}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {posts.map((post) => (
            <PostCardCompact
              key={post.id}
              post={post}
              userVote={userVotes[post.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
