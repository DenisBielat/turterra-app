import Link from 'next/link';
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { MockPost } from '@/lib/community/mock-data';
import { getRelativeTime, formatNumber } from '@/lib/community/utils';

interface PostCardCompactProps {
  post: MockPost;
}

/**
 * Post Card Compact Component
 *
 * Minimal single-row display of a post for list view.
 */
export function PostCardCompact({ post }: PostCardCompactProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors">
      {/* Vote Buttons */}
      <div className="flex items-center gap-1 text-sm">
        <button className="p-0.5 text-gray-400 hover:text-green-700 transition-colors">
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium text-green-950 min-w-[2rem] text-center">
          {formatNumber(post.score)}
        </span>
        <button className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Title */}
      <Link
        href={`/community/posts/${post.id}`}
        className="flex-1 font-medium text-green-950 hover:text-green-700 transition-colors line-clamp-1"
      >
        {post.title}
      </Link>

      {/* Meta Info */}
      <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
        <Link
          href={`/community/channels/${post.channel.slug}`}
          className="text-green-700 hover:text-green-600"
        >
          {post.channel.name}
        </Link>
        <span className="text-gray-300">·</span>
        <span>@{post.author.username}</span>
        <span className="text-gray-300">·</span>
        <span>{getRelativeTime(post.created_at)}</span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {post.comment_count}
        </span>
      </div>
    </div>
  );
}
