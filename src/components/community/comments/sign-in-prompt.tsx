'use client';

import { useAuthModal } from '@/components/auth/auth-modal-provider';

export function SignInPrompt() {
  const { openModal } = useAuthModal();

  return (
    <button
      onClick={() => openModal('login')}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 text-left hover:border-green-300 hover:bg-white transition-colors cursor-text"
    >
      Join the conversation.
    </button>
  );
}
