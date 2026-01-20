"use client";

import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  selectedHabitat: string;
  onHabitatChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  families: Array<{ common: string; scientific: string }>;
  habitats: string[];
  regions: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedFamily,
  onFamilyChange,
  selectedHabitat,
  onHabitatChange,
  selectedRegion,
  onRegionChange,
  families,
  habitats,
  regions,
  onClearFilters,
  hasActiveFilters
}: FilterBarProps) {
  return (
    <div className="bg-green-950/50 backdrop-blur-sm rounded-xl p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search Input - takes more space */}
        <div className="lg:col-span-4">
          <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
            Turtle Name
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="All Turtles"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-4 pr-10 h-11 bg-green-950 text-white placeholder:text-gray-500 border-green-800 focus:border-green-600 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Family Filter */}
        <div className="lg:col-span-2">
          <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
            Family
          </label>
          <Select value={selectedFamily} onValueChange={onFamilyChange}>
            <SelectTrigger className="h-11 bg-green-950 text-white border-green-800 focus:border-green-600 focus:ring-0 rounded-lg">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-green-800">
              <SelectItem value="all" className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white">
                All
              </SelectItem>
              {families.map((family) => (
                <SelectItem
                  key={family.scientific}
                  value={family.scientific}
                  className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white"
                >
                  {family.common}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Habitat Filter */}
        <div className="lg:col-span-2">
          <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
            Habitat
          </label>
          <Select value={selectedHabitat} onValueChange={onHabitatChange}>
            <SelectTrigger className="h-11 bg-green-950 text-white border-green-800 focus:border-green-600 focus:ring-0 rounded-lg">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-green-800">
              <SelectItem value="all" className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white">
                All
              </SelectItem>
              {habitats.map((habitat) => (
                <SelectItem
                  key={habitat}
                  value={habitat}
                  className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white"
                >
                  {habitat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region Filter */}
        <div className="lg:col-span-2">
          <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
            Region
          </label>
          <Select value={selectedRegion} onValueChange={onRegionChange}>
            <SelectTrigger className="h-11 bg-green-950 text-white border-green-800 focus:border-green-600 focus:ring-0 rounded-lg">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-green-800">
              <SelectItem value="all" className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white">
                All
              </SelectItem>
              {regions.map((region) => (
                <SelectItem
                  key={region}
                  value={region}
                  className="text-white hover:bg-green-900 focus:bg-green-900 focus:text-white"
                >
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button and Advanced Filters */}
        <div className="lg:col-span-2 flex items-end gap-2">
          <Button
            className="flex-1 h-11 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg"
            onClick={() => {}}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-gray-400 hover:text-white hover:bg-green-900"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 text-gray-400 hover:text-white hover:bg-green-900"
            title="Advanced filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
