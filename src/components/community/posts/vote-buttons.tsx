'use client';

import { useState, useTransition } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { voteOnPost } from '@/app/(main)/community/actions';
import { formatNumber } from '@/lib/community/utils';

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
    return (
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => handleVote(1)}
          disabled={isPending}
          className={`p-0.5 transition-colors ${
            optimisticVote === 1
              ? 'text-green-700'
              : 'text-gray-400 hover:text-green-700'
          }`}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium text-green-950 min-w-[2rem] text-center">
          {formatNumber(optimisticScore)}
        </span>
        <button
          onClick={() => handleVote(-1)}
          disabled={isPending}
          className={`p-0.5 transition-colors ${
            optimisticVote === -1
              ? 'text-red-500'
              : 'text-gray-400 hover:text-red-500'
          }`}
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
