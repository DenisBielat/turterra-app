import { createClient } from '@/lib/supabase/server';
import { getPosts, getUserVotesForPosts } from '@/lib/queries/community';
import { PostFeedClient } from './post-feed-client';

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

  // Get user votes for these posts
  const postIds = posts?.map((p) => p.id) ?? [];
  const userVotes = user
    ? await getUserVotesForPosts(user.id, postIds)
    : new Map<number, number>();

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

  return (
    <PostFeedClient
      sort={sort}
      initialViewMode={viewMode}
      posts={transformedPosts}
      userVotes={votesObj}
    />
  );
}
