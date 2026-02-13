import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserVotesForPosts } from '@/lib/queries/community';
import { PostCard } from '@/components/community/posts/post-card';

export const metadata = {
  title: 'Saved Posts | Turterra Community',
  description: 'Your bookmarked posts',
};

export default async function SavedPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch saved posts with full post data
  const { data: savedRows } = await supabase
    .from('saved_posts')
    .select(
      `
      post_id,
      saved_at,
      post:posts!post_id (
        id, title, body, score, comment_count, created_at, image_urls,
        author:profiles!author_id (id, username, display_name, avatar_url),
        channel:channels!channel_id (id, slug, name)
      )
    `
    )
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });

  const posts = (savedRows ?? [])
    .map((row) => row.post as unknown as {
      id: number;
      title: string;
      body: string | null;
      score: number;
      comment_count: number;
      created_at: string;
      image_urls: string[] | null;
      author: { id: string; username: string; display_name: string | null; avatar_url: string | null };
      channel: { id: number; slug: string; name: string };
    })
    .filter(Boolean);

  const postIds = posts.map((p) => p.id);
  const userVotes = await getUserVotesForPosts(user.id, postIds);

  const votesObj: Record<number, number> = {};
  userVotes.forEach((value, key) => {
    votesObj[key] = value;
  });

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        <h1 className="text-2xl font-bold text-green-950 font-heading mb-6 flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          Saved Posts
        </h1>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-semibold text-green-950 mb-2">No saved posts yet</h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Click the Save button on any post to bookmark it for later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  body: post.body ?? '',
                  score: post.score,
                  comment_count: post.comment_count,
                  created_at: post.created_at,
                  image_url: post.image_urls?.[0],
                  image_urls: post.image_urls ?? [],
                  author: post.author,
                  channel: post.channel,
                }}
                userVote={votesObj[post.id]}
                isSaved={true}
                isLoggedIn={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
