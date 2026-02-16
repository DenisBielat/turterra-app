import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MockPost } from '@/lib/community/mock-data';
import { getRelativeTime, formatNumber } from '@/lib/community/utils';
import { VoteButtons } from './vote-buttons';
import { HtmlRenderer } from '../editor/html-renderer';
import { ImageCarousel } from './image-carousel';
import { ShareButton } from './share-button';
import { PostMenuButton } from './post-menu-button';

interface PostCardProps {
  post: MockPost;
  userVote?: number;
  isSaved?: boolean;
  isLoggedIn?: boolean;
}

export function PostCard({ post, userVote, isSaved = false, isLoggedIn = false }: PostCardProps) {
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
            <span className="text-gray-400">&middot;</span>
            <span className="text-gray-500">
              {getRelativeTime(post.created_at)}
            </span>
            {/* Ellipsis menu (aligned right) */}
            <div className="ml-auto">
              <PostMenuButton
                postId={post.id}
                isSaved={isSaved}
                isLoggedIn={isLoggedIn}
                isAuthor={false}
              />
            </div>
          </div>

          {/* Title */}
          <Link
            href={`/community/posts/${post.id}`}
            className="block font-semibold text-lg text-green-950 hover:text-green-700 transition-colors mb-2"
          >
            {post.title}
          </Link>

          {/* Images (above text) */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mb-3">
              <ImageCarousel images={post.image_urls} />
            </div>
          )}

          {/* Body Preview (below images) */}
          {post.body && (
            <div className="line-clamp-3 text-sm text-gray-600 mb-3">
              <HtmlRenderer content={post.body} />
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
            <ShareButton postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
