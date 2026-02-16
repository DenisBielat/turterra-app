'use client';

import { useState } from 'react';
import { ArrowUpFromLine, Check } from 'lucide-react';

interface ShareButtonProps {
  postId: number;
}

export function ShareButton({ postId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/community/posts/${postId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-700" />
          <span className="text-green-700">Copied!</span>
        </>
      ) : (
        <>
          <ArrowUpFromLine className="h-4 w-4" />
          Share
        </>
      )}
    </button>
  );
}
