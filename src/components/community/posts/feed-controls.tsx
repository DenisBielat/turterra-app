'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Flame, Clock, TrendingUp, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'hot' | 'new' | 'top';
type ViewMode = 'rich' | 'compact';

interface FeedControlsProps {
  sort: SortOption;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Feed Controls Component (Client)
 *
 * Sort updates URL search params (triggers server re-fetch without scrolling).
 * View mode is managed client-side for instant toggling.
 */
export function FeedControls({ sort, viewMode, onViewModeChange }: FeedControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSort = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'hot') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
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
            onClick={() => updateSort(key)}
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
          onClick={() => onViewModeChange('compact')}
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
          onClick={() => onViewModeChange('rich')}
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
