import Link from 'next/link';
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { MOCK_POSTS } from '@/lib/community/mock-data';
import { getRelativeTime, formatNumber } from '@/lib/community/utils';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Post Detail Page
 *
 * Placeholder page for viewing a single post and its comments.
 */
export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);

  // Find the post from mock data
  const post = MOCK_POSTS.find((p) => p.id === postId);

  if (!post) {
    return notFound();
  }

  const displayName = post.author.display_name || post.author.username;

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
            <div className="flex flex-col items-center py-6 px-4 bg-gray-50 rounded-l-xl">
              <button className="p-1 text-gray-400 hover:text-green-700 transition-colors">
                <ChevronUp className="h-7 w-7" />
              </button>
              <span className="font-bold text-xl text-green-950 my-2">
                {formatNumber(post.score)}
              </span>
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <ChevronDown className="h-7 w-7" />
              </button>
            </div>

            {/* Content Column */}
            <div className="flex-1 p-6">
              {/* Meta Line */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Link href={`/community/channels/${post.channel.slug}`}>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    {post.channel.name}
                  </Badge>
                </Link>
                <span className="text-gray-400">Posted by</span>
                <Link
                  href={`/user/${post.author.username}`}
                  className="text-gray-600 hover:text-green-700"
                >
                  @{post.author.username}
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
              <div className="prose prose-green max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{post.body}</p>
              </div>

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
            Comment form will be added in Phase 2
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
