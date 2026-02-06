'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityTabsProps {
  activeTab: 'posts' | 'channels';
}

/**
 * Community Tabs Component
 *
 * Toggle between Posts and Channels views via URL search params.
 */
export function CommunityTabs({ activeTab }: CommunityTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTab = (tab: 'posts' | 'channels') => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'posts') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    // Clear sort/view when switching tabs
    params.delete('sort');
    params.delete('view');
    const qs = params.toString();
    router.replace(`/community${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => setTab('posts')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          activeTab === 'posts'
            ? 'bg-green-950 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        )}
      >
        <FileText className="h-4 w-4" />
        Posts
      </button>

      <button
        onClick={() => setTab('channels')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
          activeTab === 'channels'
            ? 'bg-green-950 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        )}
      >
        <Hash className="h-4 w-4" />
        Channels
      </button>
    </div>
  );
}
