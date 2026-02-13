import { createClient } from '@/lib/supabase/server';
import { getPosts, getUserVotesForPosts } from '@/lib/queries/community';
import { PostFeedClient } from './post-feed-client';

async function getUserSavedPostIds(userId: string, postIds: number[]): Promise<Set<number>> {
  if (postIds.length === 0) return new Set();
  const { createClient: makeClient } = await import('@/lib/supabase/server');
  const supabase = await makeClient();
  const { data } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);
  return new Set(data?.map((d) => d.post_id) ?? []);
}

interface PostFeedServerProps {
  sort: 'hot' | 'new' | 'top';
  viewMode: 'rich' | 'compact';
  channelId?: number;
}

/**
 * Post Feed Server Component
 *
 * Fetches posts and user votes from Supabase, then passes
 * the data to PostFeedClient for rendering with client-side view toggle.
 */
export async function PostFeedServer({ sort, viewMode, channelId }: PostFeedServerProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await getPosts({ channelId, sort });

  // Get user votes and saved posts for these posts
  const postIds = posts?.map((p) => p.id) ?? [];
  const [userVotes, savedPostIds] = await Promise.all([
    user
      ? getUserVotesForPosts(user.id, postIds)
      : Promise.resolve(new Map<number, number>()),
    user
      ? getUserSavedPostIds(user.id, postIds)
      : Promise.resolve(new Set<number>()),
  ]);

  // Transform posts and votes into serializable props
  const transformedPosts = (posts ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    score: post.score,
    comment_count: post.comment_count,
    created_at: post.created_at,
    image_url: post.image_urls?.[0],
    image_urls: (post.image_urls ?? []) as string[],
    author: post.author as { username: string; display_name: string | null; avatar_url: string | null },
    channel: post.channel as { slug: string; name: string },
  }));

  const votesObj: Record<number, number> = {};
  userVotes.forEach((value, key) => {
    votesObj[key] = value;
  });

  const savedArr = Array.from(savedPostIds);

  return (
    <PostFeedClient
      sort={sort}
      initialViewMode={viewMode}
      posts={transformedPosts}
      userVotes={votesObj}
      savedPostIds={savedArr}
      isLoggedIn={!!user}
    />
  );
}
