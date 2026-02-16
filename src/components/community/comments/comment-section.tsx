'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  function renderAvatar(comment: CommentData) {
    if (comment.is_deleted) {
      return <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />;
    }

    const initial = (
      comment.author.display_name?.[0] || comment.author.username[0]
    ).toUpperCase();

    return (
      <Link href={`/user/${comment.author.username}`} className="flex-shrink-0">
        {comment.author.avatar_url ? (
          <Image
            src={comment.author.avatar_url}
            alt=""
            width={32}
            height={32}
            className="rounded-full object-cover w-8 h-8"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs">
            {initial}
          </div>
        )}
      </Link>
    );
  }

  function renderThread(comment: CommentData, depth: number): React.ReactNode {
    const kids = childrenMap.get(comment.id) ?? [];
    const hasChildren = kids.length > 0;

    return (
      <div key={comment.id}>
        {/* Comment row: avatar + content side by side */}
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-8">
            {renderAvatar(comment)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              userVote={commentVotes.get(comment.id)}
              depth={depth}
              onReport={(id) => setReportCommentId(id)}
            />
          </div>
        </div>

        {/* Threaded children with connectors */}
        {hasChildren && (
          <div style={{ marginLeft: 15 }}>
            {kids.map((child, i) => {
              const isLast = i === kids.length - 1;
              return (
                <div key={child.id} className="relative" style={{ paddingLeft: 24 }}>
                  {/* Vertical pass-through line (continues to next sibling) */}
                  {!isLast && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  {/* Curved branch connector: vertical stem + curve to child avatar */}
                  <div
                    className="absolute left-0 top-0 border-l-2 border-b-2 border-gray-200 rounded-bl-xl"
                    style={{ width: 22, height: 16 }}
                  />
                  {renderThread(child, depth + 1)}
                </div>
              );
            })}
          </div>
        )}
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
          <div className="px-6 py-4 space-y-4">
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
