'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { savePost, unsavePost } from '@/app/(main)/community/actions';

interface SavePostButtonProps {
  postId: number;
  isSaved: boolean;
}

export function SavePostButton({ postId, isSaved: initialSaved }: SavePostButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const prev = isSaved;
    setIsSaved(!isSaved);

    startTransition(() => {
      const action = prev ? unsavePost(postId) : savePost(postId);
      action.catch(() => {
        setIsSaved(prev);
      });
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        isSaved
          ? 'text-green-700 font-medium'
          : 'text-gray-500 hover:text-green-700'
      }`}
    >
      <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}
