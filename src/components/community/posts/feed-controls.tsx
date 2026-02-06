'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Flame, Clock, TrendingUp, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'hot' | 'new' | 'top';
type ViewMode = 'rich' | 'compact';

interface FeedControlsProps {
  sort: SortOption;
  viewMode: ViewMode;
}

/**
 * Feed Controls Component (Client)
 *
 * Sort and view toggle that updates URL search params.
 */
export function FeedControls({ sort, viewMode }: FeedControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(`/community${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Sort Options */}
      <div className="flex items-center gap-1 bg-white rounded-full border border-gray-200 p-1">
        {([
          { key: 'hot' as const, icon: Flame, label: 'Hot' },
          { key: 'new' as const, icon: Clock, label: 'New' },
          { key: 'top' as const, icon: TrendingUp, label: 'Top' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => updateParam('sort', key, 'hot')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              sort === key
                ? 'bg-gray-100 text-green-950'
                : 'text-gray-600 hover:text-green-950'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
        <button
          onClick={() => updateParam('view', 'compact', 'rich')}
          className={cn(
            'p-1.5 rounded transition-colors',
            viewMode === 'compact'
              ? 'bg-gray-100 text-green-950'
              : 'text-gray-400 hover:text-green-950'
          )}
          aria-label="Compact view"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => updateParam('view', 'rich', 'rich')}
          className={cn(
            'p-1.5 rounded transition-colors',
            viewMode === 'rich'
              ? 'bg-gray-100 text-green-950'
              : 'text-gray-400 hover:text-green-950'
          )}
          aria-label="Rich view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
