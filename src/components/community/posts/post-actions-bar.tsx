import Link from 'next/link';
import { MessageSquare, Pencil } from 'lucide-react';
import { formatNumber } from '@/lib/community/utils';
import { ShareButton } from './share-button';
import { VoteButtons } from './vote-buttons';

interface PostActionsBarProps {
  postId: number;
  commentCount: number;
  isAuthor: boolean;
  score?: number;
  userVote?: number;
}

export function PostActionsBar({
  postId,
  commentCount,
  isAuthor,
  score = 0,
  userVote,
}: PostActionsBarProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100 flex-wrap">
      <VoteButtons
        postId={postId}
        score={score}
        userVote={userVote}
        layout="horizontal"
      />
      <span className="flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        {formatNumber(commentCount)} Comments
      </span>
      <ShareButton postId={postId} />
      {isAuthor && (
        <Link
          href={`/community/posts/${postId}/edit`}
          className="flex items-center gap-1.5 hover:text-green-700 transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      )}
    </div>
  );
}
