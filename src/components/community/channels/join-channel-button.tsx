'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { joinChannel, leaveChannel } from '@/app/(main)/community/actions';
import { cn } from '@/lib/utils';

interface JoinChannelButtonProps {
  channelId: number;
  isJoined: boolean;
  isLoggedIn: boolean;
}

/**
 * Join Channel Button (Client Component)
 *
 * Handles join/leave channel actions with optimistic UI.
 * Redirects to login if user is not authenticated.
 */
export function JoinChannelButton({
  channelId,
  isJoined,
  isLoggedIn,
}: JoinChannelButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    startTransition(() => {
      const action = isJoined ? leaveChannel(channelId) : joinChannel(channelId);
      action.catch((error) => {
        console.error('Failed to update channel membership:', error);
      });
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0',
        isPending && 'opacity-50 cursor-not-allowed',
        isJoined
          ? 'border border-green-700 text-green-700 hover:bg-green-50'
          : 'bg-green-700 text-white hover:bg-green-800'
      )}
    >
      {isPending ? '...' : isJoined ? 'Joined' : 'Join'}
    </button>
  );
}
