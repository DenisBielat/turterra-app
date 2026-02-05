'use client';

import { FileText, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityTabsProps {
  activeTab: 'posts' | 'channels';
  onTabChange: (tab: 'posts' | 'channels') => void;
}

/**
 * Community Tabs Component
 *
 * Toggle between Posts and Channels views.
 * This is a client component for interactivity.
 */
export function CommunityTabs({ activeTab, onTabChange }: CommunityTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => onTabChange('posts')}
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
        onClick={() => onTabChange('channels')}
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
