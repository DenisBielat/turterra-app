'use client';

import { useState, useTransition } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { voteOnComment } from '@/app/(main)/community/actions';
import { formatNumber } from '@/lib/community/utils';

interface CommentVoteButtonsProps {
  commentId: number;
  score: number;
  userVote?: number;
}

export function CommentVoteButtons({
  commentId,
  score,
  userVote,
}: CommentVoteButtonsProps) {
  const [optimisticScore, setOptimisticScore] = useState(score);
  const [optimisticVote, setOptimisticVote] = useState(userVote);
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: 1 | -1) => {
    const previousScore = optimisticScore;
    const previousVote = optimisticVote;

    if (optimisticVote === value) {
      setOptimisticScore(optimisticScore - value);
      setOptimisticVote(undefined);
    } else if (optimisticVote) {
      setOptimisticScore(optimisticScore + value * 2);
      setOptimisticVote(value);
    } else {
      setOptimisticScore(optimisticScore + value);
      setOptimisticVote(value);
    }

    startTransition(() => {
      voteOnComment(commentId, value).catch(() => {
        setOptimisticScore(previousScore);
        setOptimisticVote(previousVote);
      });
    });
  };

  return (
    <div className="flex items-center gap-0.5 text-sm">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`p-0.5 transition-colors ${
          optimisticVote === 1
            ? 'text-green-700'
            : 'text-gray-400 hover:text-green-700'
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span className="font-medium text-green-950 min-w-[1.5rem] text-center text-xs">
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
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
