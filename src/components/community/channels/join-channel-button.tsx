'use client';

import { useState, useTransition } from 'react';
import { joinChannel, leaveChannel } from '@/app/(main)/community/actions';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
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
 * Shows "Leave" on hover when already joined.
 * Opens login modal if user is not authenticated.
 */
export function JoinChannelButton({
  channelId,
  isJoined,
  isLoggedIn,
}: JoinChannelButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);
  const { openModal } = useAuthModal();

  const handleClick = () => {
    if (!isLoggedIn) {
      openModal('login');
      return;
    }

    startTransition(() => {
      const action = isJoined ? leaveChannel(channelId) : joinChannel(channelId);
      action.catch((error) => {
        console.error('Failed to update channel membership:', error);
      });
    });
  };

  const showLeave = isJoined && isHovered && !isPending;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0',
        isPending && 'opacity-50 cursor-not-allowed',
        showLeave
          ? 'border border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
          : isJoined
            ? 'border border-green-700 text-green-700 hover:bg-green-50'
            : 'bg-green-700 text-white hover:bg-green-800'
      )}
    >
      {isPending ? '...' : showLeave ? 'Leave' : isJoined ? 'Joined' : 'Join'}
    </button>
  );
}
