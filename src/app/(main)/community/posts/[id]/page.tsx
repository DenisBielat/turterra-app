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
  getChannelBySlug,
  getChannelStats,
  getUserChannelMemberships,
} from '@/lib/queries/community';
import { getRelativeTime } from '@/lib/community/utils';
import { HtmlRenderer } from '@/components/community/editor/html-renderer';
import { ImageCarousel } from '@/components/community/posts/image-carousel';
import { PostActionsBar } from '@/components/community/posts/post-actions-bar';
import { PostMenuButton } from '@/components/community/posts/post-menu-button';
import { CommentSection } from '@/components/community/comments/comment-section';
import { CommentForm } from '@/components/community/comments/comment-form';
import { SignInPrompt } from '@/components/community/comments/sign-in-prompt';
import { PostSidebar } from '@/components/community/posts/post-sidebar';
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

  const postChannel = post.channel as { slug: string; name: string };

  // Fetch comments first (needed for vote IDs)
  const rawComments = await getCommentsByPostId(postId);
  const commentIds = rawComments.map((c) => c.id);

  // Fetch all remaining data in parallel
  const [userVotes, commentVotes, isSaved, fullChannel, allStats, memberships, moderatorsResult] =
    await Promise.all([
      user
        ? getUserVotesForPosts(user.id, [postId])
        : Promise.resolve(new Map<number, number>()),
      user
        ? getUserVotesForComments(user.id, commentIds)
        : Promise.resolve(new Map<number, number>()),
      user ? isPostSavedByUser(user.id, postId) : Promise.resolve(false),
      getChannelBySlug(postChannel.slug),
      getChannelStats(),
      user ? getUserChannelMemberships(user.id) : Promise.resolve([]),
      supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .in('role', ['admin', 'moderator'])
        .order('username')
        .limit(10),
    ]);

  const author = post.author as {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  const isAuthor = user?.id === author.id;

  const channelStats = allStats?.find((s) => s.channel_id === fullChannel?.id);
  const isJoined = fullChannel ? memberships.includes(fullChannel.id) : false;
  const moderators = moderatorsResult?.data ?? [];

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
      <div className="max-w-6xl mx-auto px-4 py-8 pb-16">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Post + Comment Input (combined card) */}
            <div className="bg-white rounded-xl border border-gray-100 mb-6">
              <div className="flex">
                {/* Content Column */}
                <div className="flex-1 p-6">
                  {/* Meta Line */}
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Link href={`/community/channels/${postChannel.slug}`}>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        {postChannel.name}
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
                    {/* Ellipsis menu (aligned right) */}
                    <div className="ml-auto">
                      <PostMenuButton
                        postId={post.id}
                        isSaved={isSaved}
                        isLoggedIn={!!user}
                        isAuthor={isAuthor}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="font-heading text-2xl font-bold text-green-950 mb-4">
                    {post.title}
                  </h1>

                  {/* Images (above text) */}
                  {post.image_urls &&
                    (post.image_urls as string[]).length > 0 && (
                      <div className="mb-6">
                        <ImageCarousel images={post.image_urls as string[]} />
                      </div>
                    )}

                  {/* Body (below images) */}
                  {post.body && (
                    <div className="mb-6">
                      <HtmlRenderer
                        content={post.body}
                        className="prose-green"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <PostActionsBar
                    postId={post.id}
                    commentCount={post.comment_count}
                    isAuthor={isAuthor}
                    score={post.score}
                    userVote={userVotes.get(post.id)}
                  />

                  {/* Inline comment form (inside the post card) */}
                  <div className="mt-4">
                    {user ? (
                      <CommentForm postId={postId} />
                    ) : (
                      <SignInPrompt />
                    )}
                  </div>
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

          {/* Sidebar (hidden on small screens) */}
          {fullChannel && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8">
                <PostSidebar
                  channel={{
                    id: fullChannel.id,
                    slug: fullChannel.slug,
                    name: fullChannel.name,
                    description: fullChannel.description,
                    icon_svg: fullChannel.icon_svg,
                    created_at: fullChannel.created_at,
                  }}
                  memberCount={Number(channelStats?.member_count ?? 0)}
                  isJoined={isJoined}
                  isLoggedIn={!!user}
                  moderators={moderators}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
