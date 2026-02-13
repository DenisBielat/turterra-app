'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Pencil, Flag } from 'lucide-react';
import { formatNumber } from '@/lib/community/utils';
import { SavePostButton } from './save-post-button';
import { ShareButton } from './share-button';
import { ReportDialog } from './report-dialog';

interface PostActionsBarProps {
  postId: number;
  commentCount: number;
  isSaved: boolean;
  isAuthor: boolean;
  isLoggedIn: boolean;
}

export function PostActionsBar({
  postId,
  commentCount,
  isSaved,
  isAuthor,
  isLoggedIn,
}: PostActionsBarProps) {
  const [showReport, setShowReport] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          {formatNumber(commentCount)} Comments
        </span>
        <ShareButton postId={postId} />
        {isLoggedIn && <SavePostButton postId={postId} isSaved={isSaved} />}
        {isAuthor && (
          <Link
            href={`/community/posts/${postId}/edit`}
            className="flex items-center gap-1.5 hover:text-green-700 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
        {isLoggedIn && !isAuthor && (
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 hover:text-red-600 transition-colors ml-auto"
          >
            <Flag className="h-4 w-4" />
            Report
          </button>
        )}
      </div>

      {showReport && (
        <ReportDialog
          contentType="post"
          contentId={postId}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
