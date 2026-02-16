'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { MoreHorizontal, Bookmark, Flag } from 'lucide-react';
import { savePost, unsavePost } from '@/app/(main)/community/actions';
import { ReportDialog } from './report-dialog';

interface PostMenuButtonProps {
  postId: number;
  isSaved: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
}

export function PostMenuButton({
  postId,
  isSaved: initialSaved,
  isLoggedIn,
  isAuthor,
}: PostMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const [showReport, setShowReport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleToggleSave = () => {
    const prev = isSaved;
    setIsSaved(!isSaved);
    setOpen(false);

    startTransition(() => {
      const action = prev ? unsavePost(postId) : savePost(postId);
      action.catch(() => {
        setIsSaved(prev);
      });
    });
  };

  const handleReport = () => {
    setOpen(false);
    setShowReport(true);
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-20">
            <button
              onClick={handleToggleSave}
              disabled={isPending}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Unsave' : 'Save'}
            </button>
            {!isAuthor && (
              <button
                onClick={handleReport}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
            )}
          </div>
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
