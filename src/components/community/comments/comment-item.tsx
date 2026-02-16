'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { MessageSquare, Trash2, Flag } from 'lucide-react';
import { deleteComment } from '@/app/(main)/community/actions';
import { getRelativeTime } from '@/lib/community/utils';
import { HtmlRenderer } from '@/components/community/editor/html-renderer';
import { CommentVoteButtons } from './comment-vote-buttons';
import { CommentForm } from './comment-form';

export interface CommentData {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  author_id: string;
  body: string;
  score: number;
  is_deleted: boolean;
  created_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: string;
  userVote?: number;
  depth?: number;
  maxDepth?: number;
  onReport: (commentId: number) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  userVote,
  depth = 0,
  maxDepth = 5,
  onReport,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const isAuthor = currentUserId === comment.author_id;

  const handleDelete = () => {
    if (!confirm('Delete this comment? This cannot be undone.')) return;
    startDeleteTransition(() => {
      deleteComment(comment.id, comment.post_id);
    });
  };

  if (comment.is_deleted) {
    return (
      <div className="py-1">
        <span className="text-sm text-gray-400 italic">[deleted]</span>
      </div>
    );
  }

  return (
    <div className="pb-2">
      {/* Author line */}
      <div className="flex items-center gap-2 mb-1">
        <Link
          href={`/user/${comment.author.username}`}
          className="text-sm font-medium text-green-950 hover:text-green-700 transition-colors"
        >
          @{comment.author.username}
        </Link>
        <span className="text-xs text-gray-400">&middot;</span>
        <span className="text-xs text-gray-500">
          {getRelativeTime(comment.created_at)}
        </span>
      </div>

      {/* Comment body */}
      <div className="text-sm text-gray-700 mb-2">
        <HtmlRenderer content={comment.body} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <CommentVoteButtons
          commentId={comment.id}
          score={comment.score}
          userVote={userVote}
        />
        {currentUserId && depth < maxDepth && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 hover:text-green-700 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Reply
          </button>
        )}
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
        {currentUserId && !isAuthor && (
          <button
            onClick={() => onReport(comment.id)}
            className="flex items-center gap-1 hover:text-red-600 transition-colors"
          >
            <Flag className="h-3.5 w-3.5" />
            Report
          </button>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-3">
          <CommentForm
            postId={comment.post_id}
            parentCommentId={comment.id}
            autoFocus
            placeholder={`Reply to @${comment.author.username}...`}
            onCancel={() => setShowReplyForm(false)}
            onSubmitted={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </div>
  );
}
