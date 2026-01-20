"use client";

import { Search, ChevronDown } from 'lucide-react';
import Icon from '@/components/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFamily: string;
  onFamilyChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  families: Array<{ common: string; scientific: string }>;
  regions: string[];
  onFilterClick?: () => void;
}

// Common classes for select items with proper hover/highlight contrast
const selectItemClasses = "text-white hover:!bg-green-800 focus:!bg-green-800 focus:!text-white data-[highlighted]:!bg-green-800 data-[highlighted]:!text-white";

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedFamily,
  onFamilyChange,
  selectedRegion,
  onRegionChange,
  families,
  regions,
  onFilterClick,
}: FilterBarProps) {
  return (
    <div className="bg-green-900/80 backdrop-blur-sm rounded-full p-2 flex flex-col lg:flex-row lg:items-center">
      {/* Mobile: Search Input + Filter Button */}
      <div className="flex items-end gap-2 lg:hidden">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <label className="text-gray-400 text-xs font-medium mb-1">
              Turtle Name
            </label>
            <Input
              type="text"
              placeholder="All Turtles"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 bg-transparent text-white placeholder:text-gray-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
            />
          </div>
        </div>

        {/* Filter Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 bg-green-800/50 hover:bg-green-800 text-white rounded-lg flex-shrink-0"
          onClick={onFilterClick}
          title="Filter"
        >
          <Icon name="filter-settings" style="line" size="lg" />
        </Button>
      </div>

      {/* Desktop: Full Filter Bar */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:w-full">
        {/* Search Input - takes more space, rounded left on desktop */}
        <div className="flex-[2] min-w-0 px-2 lg:px-4 py-2 lg:py-0">
          <div className="flex flex-col">
            <label className="text-gray-400 text-xs font-medium mb-1">
              Turtle Name
            </label>
            <Input
              type="text"
              placeholder="All Turtles"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 bg-transparent text-white placeholder:text-gray-500 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-12 bg-green-700/50" />

        {/* Family Filter */}
        <div className="flex-1 min-w-0 px-2 lg:px-4 py-2 lg:py-0">
          <div className="flex flex-col">
            <label className="text-gray-400 text-xs font-medium mb-1">
              Family
            </label>
            <Select value={selectedFamily} onValueChange={onFamilyChange}>
              <SelectTrigger className="h-8 bg-transparent text-white border-0 focus:ring-0 p-0 text-base [&>svg]:hidden">
                <div className="flex items-center gap-1">
                  <SelectValue placeholder="All" />
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                </div>
              </SelectTrigger>
              <SelectContent
                className="bg-green-950 border-green-800 max-h-[300px]"
                position="popper"
                sideOffset={8}
                align="start"
                avoidCollisions={true}
                collisionPadding={16}
              >
                <SelectItem value="all" className={selectItemClasses}>
                  All
                </SelectItem>
                {families.map((family) => (
                  <SelectItem
                    key={family.scientific}
                    value={family.scientific}
                    className={selectItemClasses}
                  >
                    {family.common}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-12 bg-green-700/50" />

        {/* Region Filter */}
        <div className="flex-1 min-w-0 px-2 lg:px-4 py-2 lg:py-0">
          <div className="flex flex-col">
            <label className="text-gray-400 text-xs font-medium mb-1">
              Region
            </label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="h-8 bg-transparent text-white border-0 focus:ring-0 p-0 text-base [&>svg]:hidden">
                <div className="flex items-center gap-1">
                  <SelectValue placeholder="All" />
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                </div>
              </SelectTrigger>
              <SelectContent
                className="bg-green-950 border-green-800 max-h-[300px]"
                position="popper"
                sideOffset={8}
                align="start"
                avoidCollisions={true}
                collisionPadding={16}
              >
                <SelectItem value="all" className={selectItemClasses}>
                  All
                </SelectItem>
                {regions.map((region) => (
                  <SelectItem
                    key={region}
                    value={region}
                    className={selectItemClasses}
                  >
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button - pill shaped, orange */}
        <div className="px-2 py-2 lg:py-0 lg:pl-2">
          <Button
            className="w-full lg:w-auto h-12 px-8 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-full"
            onClick={() => {}}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
