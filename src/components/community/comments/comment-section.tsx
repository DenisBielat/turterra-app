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
      <ThreadRow
        key={comment.id}
        comment={comment}
        depth={depth}
        hasChildren={hasChildren}
        kids={kids}
        renderAvatar={renderAvatar}
        commentVotes={commentVotes}
        currentUserId={currentUserId}
        setReportCommentId={setReportCommentId}
        renderThread={renderThread}
      />
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

/** Reddit structure: main thread line in its own container (flex justify-center items-center, w-[1px] h-full); curve lives in the "hidden threadline" container that also covers the stem below. */
const AVATAR_COLUMN_PX = 32; // w-8 in Tailwind
const GAP_PX = 12; // gap-3
const HIDDEN_THREADLINE_WIDTH_PX = 44; // w-11
/** Curve left: center of avatar column so the curve's vertical edge aligns with the main thread line. */
const CURVE_LEFT_PX = AVATAR_COLUMN_PX / 2;

function ThreadRow({
  comment,
  depth,
  hasChildren,
  kids,
  renderAvatar,
  commentVotes,
  currentUserId,
  setReportCommentId,
  renderThread,
}: {
  comment: CommentData;
  depth: number;
  hasChildren: boolean;
  kids: CommentData[];
  renderAvatar: (c: CommentData) => React.ReactNode;
  commentVotes: Map<number, number>;
  currentUserId?: string;
  setReportCommentId: (id: number) => void;
  renderThread: (comment: CommentData, depth: number) => React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {/* Avatar column: main thread line in its own container (Reddit: absolute top-0 start-0 bottom-0, flex justify-center items-center, w-[1px] h-full) */}
      <div className="flex flex-col flex-shrink-0 w-8 relative">
        {renderAvatar(comment)}
        {hasChildren && (
          <div
            aria-hidden
            className="mt-2 flex-1 flex justify-center items-center min-h-0 relative z-10"
          >
            <div className="w-px h-full bg-gray-200" data-testid="main-thread-line" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="pb-1">
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            userVote={commentVotes.get(comment.id)}
            depth={depth}
            onReport={(id) => setReportCommentId(id)}
          />
        </div>

        {hasChildren && (
          <div>
            {kids.map((child) => (
              <div key={child.id} className="relative">
                {/* Hidden threadline container (Reddit): holds the curve and covers parent stem below via bg */}
                <div
                  aria-hidden
                  className="absolute top-0 bottom-0 left-0 bg-white z-0"
                  style={{
                    marginLeft: -HIDDEN_THREADLINE_WIDTH_PX,
                    width: HIDDEN_THREADLINE_WIDTH_PX,
                  }}
                  data-testid="hidden-threadline"
                >
                  <div
                    className="absolute top-0 w-4 h-4 border-0 border-gray-200 border-l-[0.75px] border-b-[0.75px] rounded-bl-xl box-border"
                    style={{ left: CURVE_LEFT_PX }}
                    data-testid="branch-line"
                  />
                </div>
                {renderThread(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
