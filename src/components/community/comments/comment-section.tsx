'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
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
  void postId;
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
    const hasChildren = kids.length > 0;

    return (
      <div key={comment.id} className="comment-thread">
        {/* Thread line + content wrapper */}
        <div className={depth > 0 ? 'comment-nested' : ''}>
          {/* The comment itself */}
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            userVote={commentVotes.get(comment.id)}
            depth={depth}
            onReport={(id) => setReportCommentId(id)}
          />

          {/* Children rendered inside, so the thread line covers them */}
          {hasChildren && (
            <div className="comment-children">
              {kids.map((child) => renderThread(child, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
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

      {/* Reddit-style comment threading */}
      <style jsx global>{`
        /* Nested comments: indented with a thread line on the left */
        .comment-nested {
          position: relative;
          margin-left: 12px;
          padding-left: 20px;
        }

        /* Vertical thread line */
        .comment-nested::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 8px;
          width: 2px;
          background: rgb(229 231 235);
          border-radius: 1px;
          cursor: pointer;
          transition: background 0.15s;
        }

        /* Highlight on hover */
        .comment-nested:hover > ::before,
        .comment-nested::before:hover {
          background: rgb(156 163 175);
        }

        /* Only highlight the directly hovered line, not parent lines */
        .comment-nested:hover::before {
          background: rgb(156 163 175);
        }
        .comment-nested .comment-nested::before {
          background: rgb(229 231 235);
        }
        .comment-nested .comment-nested:hover::before {
          background: rgb(156 163 175);
        }
      `}</style>

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
