"use client";

import { LayoutGrid, Grid3X3, List, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ViewMode = 'grid' | 'compact' | 'list';
export type SortOption = 'name-asc' | 'name-desc' | 'status';

interface ResultsBarProps {
  resultCount: number;
  totalCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export default function ResultsBar({
  resultCount,
  totalCount,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange
}: ResultsBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
      {/* Results count */}
      <div className="text-gray-300">
        <span className="font-semibold text-white">{resultCount}</span>
        {resultCount !== totalCount && (
          <span className="text-gray-500"> of {totalCount}</span>
        )}
        {' '}turtle{resultCount !== 1 ? 's' : ''}
      </div>

      {/* Sort and View controls */}
      <div className="flex items-center gap-4">
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-32 h-9 bg-transparent text-white border-green-800 focus:border-green-600 focus:ring-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-green-800">
              <SelectItem value="name-asc" className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white">
                Name A-Z
              </SelectItem>
              <SelectItem value="name-desc" className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white">
                Name Z-A
              </SelectItem>
              <SelectItem value="status" className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white">
                Conservation
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-green-950/50 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${viewMode === 'grid' ? 'bg-green-800 text-white' : 'text-gray-400 hover:text-white hover:bg-green-900'}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${viewMode === 'compact' ? 'bg-green-800 text-white' : 'text-gray-400 hover:text-white hover:bg-green-900'}`}
            onClick={() => onViewModeChange('compact')}
            title="Compact grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${viewMode === 'list' ? 'bg-green-800 text-white' : 'text-gray-400 hover:text-white hover:bg-green-900'}`}
            onClick={() => onViewModeChange('list')}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
