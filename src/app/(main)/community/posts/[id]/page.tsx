import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import {
  getPostById,
  getUserVotesForPosts,
  getCommentsByPostId,
  getUserVotesForComments,
  isPostSavedByUser,
} from '@/lib/queries/community';
import { getRelativeTime } from '@/lib/community/utils';
import { VoteButtons } from '@/components/community/posts/vote-buttons';
import { HtmlRenderer } from '@/components/community/editor/html-renderer';
import { ImageCarousel } from '@/components/community/posts/image-carousel';
import { PostActionsBar } from '@/components/community/posts/post-actions-bar';
import { CommentSection } from '@/components/community/comments/comment-section';
import type { CommentData } from '@/components/community/comments/comment-item';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

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

  // Fetch comments first (needed for vote IDs)
  const rawComments = await getCommentsByPostId(postId);
  const commentIds = rawComments.map((c) => c.id);

  // Fetch remaining data in parallel
  const [userVotes, commentVotes, isSaved] = await Promise.all([
    user
      ? getUserVotesForPosts(user.id, [postId])
      : Promise.resolve(new Map<number, number>()),
    user
      ? getUserVotesForComments(user.id, commentIds)
      : Promise.resolve(new Map<number, number>()),
    user ? isPostSavedByUser(user.id, postId) : Promise.resolve(false),
  ]);

  const author = post.author as {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  const channel = post.channel as { slug: string; name: string };
  const isAuthor = user?.id === author.id;

  // Cast comments to CommentData type
  const comments: CommentData[] = rawComments.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    parent_comment_id: c.parent_comment_id,
    author_id: c.author_id,
    body: c.body,
    score: c.score,
    is_deleted: c.is_deleted,
    created_at: c.created_at,
    author: c.author as unknown as CommentData['author'],
  }));

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
                <span className="text-gray-400">&middot;</span>
                <span className="text-gray-500">
                  {getRelativeTime(post.created_at)}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-2xl font-bold text-green-950 mb-4">
                {post.title}
              </h1>

              {/* Images (above text) */}
              {post.image_urls && (post.image_urls as string[]).length > 0 && (
                <div className="mb-6">
                  <ImageCarousel images={post.image_urls as string[]} />
                </div>
              )}

              {/* Body (below images) */}
              {post.body && (
                <div className="mb-6">
                  <HtmlRenderer content={post.body} className="prose-green" />
                </div>
              )}

              {/* Actions */}
              <PostActionsBar
                postId={post.id}
                commentCount={post.comment_count}
                isSaved={isSaved}
                isAuthor={isAuthor}
                isLoggedIn={!!user}
              />
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentSection
          postId={postId}
          comments={comments}
          commentVotes={commentVotes}
          currentUserId={user?.id}
          commentCount={post.comment_count}
        />
      </div>
    </div>
  );
}
