import { createClient } from '@/lib/supabase/server';
import { getPosts, getUserVotesForPosts } from '@/lib/queries/community';
import { FeedControls } from './feed-controls';
import { PostCard } from './post-card';
import { PostCardCompact } from './post-card-compact';
import { FileText } from 'lucide-react';

interface PostFeedServerProps {
  sort: 'hot' | 'new' | 'top';
  viewMode: 'rich' | 'compact';
  channelId?: number;
}

/**
 * Post Feed Server Component
 *
 * Fetches posts and user votes from Supabase, then renders
 * feed controls and post list.
 */
export async function PostFeedServer({ sort, viewMode, channelId }: PostFeedServerProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await getPosts({ channelId, sort });

  // Get user votes for these posts
  const postIds = posts?.map((p) => p.id) ?? [];
  const userVotes = user
    ? await getUserVotesForPosts(user.id, postIds)
    : new Map<number, number>();

  return (
    <div>
      <FeedControls sort={sort} viewMode={viewMode} />

      {!posts || posts.length === 0 ? (
        <EmptyFeed />
      ) : viewMode === 'rich' ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                body: post.body,
                score: post.score,
                comment_count: post.comment_count,
                created_at: post.created_at,
                image_url: post.image_urls?.[0],
                author: post.author as { username: string; display_name: string | null; avatar_url: string | null },
                channel: post.channel as { slug: string; name: string },
              }}
              userVote={userVotes.get(post.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
          {posts.map((post) => (
            <PostCardCompact
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                body: post.body,
                score: post.score,
                comment_count: post.comment_count,
                created_at: post.created_at,
                author: post.author as { username: string; display_name: string | null; avatar_url: string | null },
                channel: post.channel as { slug: string; name: string },
              }}
              userVote={userVotes.get(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="font-semibold text-green-950 mb-2">No posts yet</h3>
      <p className="text-gray-600 text-sm max-w-md mx-auto">
        Be the first to start a discussion! Share a question, story, or photo
        with the community.
      </p>
    </div>
  );
}
