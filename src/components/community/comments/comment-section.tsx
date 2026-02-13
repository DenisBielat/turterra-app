'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { CommentForm } from './comment-form';
import { CommentItem, type CommentData } from './comment-item';
import { ReportDialog } from '../posts/report-dialog';

interface CommentSectionProps {
  postId: number;
  comments: CommentData[];
  commentVotes: Map<number, number>;
  currentUserId?: string;
  commentCount: number;
}

export function CommentSection({
  postId,
  comments,
  commentVotes,
  currentUserId,
  commentCount,
}: CommentSectionProps) {
  const [reportCommentId, setReportCommentId] = useState<number | null>(null);

  // Build children map for threaded rendering
  const childrenMap = new Map<number, CommentData[]>();
  for (const c of comments) {
    if (c.parent_comment_id) {
      const arr = childrenMap.get(c.parent_comment_id) ?? [];
      arr.push(c);
      childrenMap.set(c.parent_comment_id, arr);
    }
  }

  const topLevel = comments.filter((c) => !c.parent_comment_id);

  function renderThread(comment: CommentData, depth: number): React.ReactNode {
    const kids = childrenMap.get(comment.id) ?? [];
    return (
      <div
        key={comment.id}
        className={depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100' : ''}
      >
        <CommentItem
          comment={comment}
          currentUserId={currentUserId}
          userVote={commentVotes.get(comment.id)}
          depth={depth}
          onReport={(id) => setReportCommentId(id)}
        />
        {kids.map((child) => renderThread(child, depth + 1))}
      </div>
    );
  }

  return (
    <div>
      {/* Comment form */}
      {currentUserId ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-green-950 mb-3">Add a Comment</h3>
          <CommentForm postId={postId} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 text-center">
          <p className="text-gray-500 text-sm">
            <a href="/auth/signin" className="text-green-700 hover:underline">
              Sign in
            </a>{' '}
            to join the conversation.
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-green-950 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </h3>
        </div>

        {topLevel.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="px-6 divide-y divide-gray-50">
            {topLevel.map((comment) => (
              <div key={comment.id}>{renderThread(comment, 0)}</div>
            ))}
          </div>
        )}
      </div>

      {/* Report dialog */}
      {reportCommentId !== null && (
        <ReportDialog
          contentType="comment"
          contentId={reportCommentId}
          onClose={() => setReportCommentId(null)}
        />
      )}
    </div>
  );
}
