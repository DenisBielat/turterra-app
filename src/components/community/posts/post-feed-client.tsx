'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
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
  savedPostIds?: number[];
  isLoggedIn?: boolean;
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
  savedPostIds = [],
  isLoggedIn = false,
}: PostFeedClientProps) {
  const savedSet = new Set(savedPostIds);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  return (
    <div>
      <FeedControls
        sort={sort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-green-950 mb-2">No posts yet</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Be the first to start a discussion! Share a question, story, or photo
            with the community.
          </p>
        </div>
      ) : viewMode === 'rich' ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userVote={userVotes[post.id]}
              isSaved={savedSet.has(post.id)}
              isLoggedIn={isLoggedIn}
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
