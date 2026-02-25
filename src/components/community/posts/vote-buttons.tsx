'use client';

import { useState, useTransition } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { voteOnPost } from '@/app/(main)/community/actions';
import { formatNumber } from '@/lib/community/utils';

function voteContainerBg(
  vote: number | undefined,
  hover: 'up' | 'down' | null
): string {
  if (vote === 1 || hover === 'up') return 'bg-green-100/90 border-green-200/80';
  if (vote === -1 || hover === 'down') return 'bg-red-100/90 border-red-200/80';
  return 'bg-gray-100 border-gray-200/80';
}

interface VoteButtonsProps {
  postId: number;
  score: number;
  userVote?: number; // 1, -1, or undefined
  layout?: 'vertical' | 'horizontal';
}

/**
 * Vote Buttons Component (Client)
 *
 * Handles voting with optimistic updates.
 */
export function VoteButtons({
  postId,
  score,
  userVote,
  layout = 'vertical',
}: VoteButtonsProps) {
  const [optimisticScore, setOptimisticScore] = useState(score);
  const [optimisticVote, setOptimisticVote] = useState(userVote);
  const [hoverVote, setHoverVote] = useState<'up' | 'down' | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: 1 | -1) => {
    const previousScore = optimisticScore;
    const previousVote = optimisticVote;

    // Optimistic update
    if (optimisticVote === value) {
      // Removing vote
      setOptimisticScore(optimisticScore - value);
      setOptimisticVote(undefined);
    } else if (optimisticVote) {
      // Changing vote direction
      setOptimisticScore(optimisticScore + value * 2);
      setOptimisticVote(value);
    } else {
      // New vote
      setOptimisticScore(optimisticScore + value);
      setOptimisticVote(value);
    }

    startTransition(() => {
      voteOnPost(postId, value).catch(() => {
        // Revert on error
        setOptimisticScore(previousScore);
        setOptimisticVote(previousVote);
      });
    });
  };

  if (layout === 'horizontal') {
    const containerBg = voteContainerBg(optimisticVote, hoverVote);
    return (
      <div
        className={`inline-flex items-center gap-0.5 text-sm rounded-full px-2 py-1 border transition-colors ${containerBg}`}
      >
        <button
          onClick={() => handleVote(1)}
          disabled={isPending}
          onMouseEnter={() => setHoverVote('up')}
          onMouseLeave={() => setHoverVote(null)}
          className={`p-0.5 transition-colors ${
            optimisticVote === 1 ? 'text-green-700' : 'text-gray-400 hover:text-green-700'
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium text-green-950 min-w-[2rem] text-center text-xs tabular-nums">
          {formatNumber(optimisticScore)}
        </span>
        <button
          onClick={() => handleVote(-1)}
          disabled={isPending}
          onMouseEnter={() => setHoverVote('down')}
          onMouseLeave={() => setHoverVote(null)}
          className={`p-0.5 transition-colors ${
            optimisticVote === -1 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4 px-3 bg-gray-50 rounded-l-xl">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`p-1 transition-colors ${
          optimisticVote === 1
            ? 'text-green-700'
            : 'text-gray-400 hover:text-green-700'
        }`}
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      <span className="font-semibold text-green-950 my-1">
        {formatNumber(optimisticScore)}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`p-1 transition-colors ${
          optimisticVote === -1
            ? 'text-red-500'
            : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
}
