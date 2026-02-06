import Link from 'next/link';
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MockPost } from '@/lib/community/mock-data';
import { getRelativeTime, formatNumber } from '@/lib/community/utils';
import { VoteButtons } from './vote-buttons';

interface PostCardProps {
  post: MockPost;
  userVote?: number;
}

/**
 * Post Card Component (Rich View)
 *
 * Full display of a post with vote buttons, content preview, and actions.
 */
export function PostCard({ post, userVote }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Vote Column */}
        <VoteButtons
          postId={post.id}
          score={post.score}
          userVote={userVote}
          layout="vertical"
        />

        {/* Content Column */}
        <div className="flex-1 p-4">
          {/* Meta Line */}
          <div className="flex items-center gap-2 text-sm mb-2">
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
          <Link
            href={`/community/posts/${post.id}`}
            className="block font-semibold text-lg text-green-950 hover:text-green-700 transition-colors mb-2"
          >
            {post.title}
          </Link>

          {/* Body Preview */}
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.body}</p>

          {/* Image (if post has images) */}
          {post.image_url && (
            <div className="mb-3 bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href={`/community/posts/${post.id}`}
              className="flex items-center gap-1.5 hover:text-green-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              {formatNumber(post.comment_count)} Comments
            </Link>
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
  );
}
