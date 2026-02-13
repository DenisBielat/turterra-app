'use client';

import { useState, useTransition } from 'react';
import { createComment } from '@/app/(main)/community/actions';

interface CommentFormProps {
  postId: number;
  parentCommentId?: number | null;
  onCancel?: () => void;
  onSubmitted?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  postId,
  parentCommentId,
  onCancel,
  onSubmitted,
  placeholder = 'What are your thoughts?',
  autoFocus = false,
}: CommentFormProps) {
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    startTransition(() => {
      createComment({
        postId,
        body: body.trim(),
        parentCommentId: parentCommentId ?? null,
      })
        .then(() => {
          setBody('');
          onSubmitted?.();
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to post comment');
        });
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={parentCommentId ? 3 : 4}
        maxLength={10000}
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-green-950 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 resize-y"
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      <div className="flex items-center justify-end gap-2 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="px-4 py-1.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Posting...' : parentCommentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
