import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { getPostById, getUserVotesForPosts } from '@/lib/queries/community';
import { getRelativeTime, formatNumber } from '@/lib/community/utils';
import { VoteButtons } from '@/components/community/posts/vote-buttons';
import { MarkdownRenderer } from '@/components/community/editor/markdown-renderer';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Post Detail Page
 *
 * Displays a single post fetched from Supabase with its content and actions.
 */
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) return notFound();

  let post;
  try {
    post = await getPostById(postId);
  } catch {
    return notFound();
  }

  if (!post) return notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userVotes = user
    ? await getUserVotesForPosts(user.id, [postId])
    : new Map<number, number>();

  const author = post.author as { username: string; display_name: string | null; avatar_url: string | null };
  const channel = post.channel as { slug: string; name: string };

  return (
    <div className="min-h-screen bg-warm">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        {/* Post */}
        <div className="bg-white rounded-xl border border-gray-100 mb-8">
          <div className="flex">
            {/* Vote Column */}
            <div className="py-2">
              <VoteButtons
                postId={post.id}
                score={post.score}
                userVote={userVotes.get(post.id)}
                layout="vertical"
              />
            </div>

            {/* Content Column */}
            <div className="flex-1 p-6">
              {/* Meta Line */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Link href={`/community/channels/${channel.slug}`}>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    {channel.name}
                  </Badge>
                </Link>
                <span className="text-gray-400">Posted by</span>
                <Link
                  href={`/user/${author.username}`}
                  className="text-gray-600 hover:text-green-700"
                >
                  @{author.username}
                </Link>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">
                  {getRelativeTime(post.created_at)}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-2xl font-bold text-green-950 mb-4">
                {post.title}
              </h1>

              {/* Body */}
              {post.body && (
                <div className="mb-6">
                  <MarkdownRenderer content={post.body} className="prose-green" />
                </div>
              )}

              {/* Images */}
              {post.image_urls && (post.image_urls as string[]).length > 0 && (
                <div className="mb-6 space-y-3">
                  {(post.image_urls as string[]).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt=""
                      className="rounded-lg max-w-full"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {formatNumber(post.comment_count)} Comments
                </span>
                <button className="flex items-center gap-1.5 hover:text-green-700 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="flex items-center gap-1.5 hover:text-green-700 transition-colors">
                  <Bookmark className="h-4 w-4" />
                  Save
                </button>
                <button className="p-1 hover:text-green-700 transition-colors ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Form Placeholder */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-green-950 mb-3">Add a Comment</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            Comment form coming soon
          </div>
        </div>

        {/* Comments Placeholder */}
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h2 className="font-semibold text-green-950 mb-2">Comments Coming Soon</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Comments will appear here once the community features are fully
            connected to the database. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}
