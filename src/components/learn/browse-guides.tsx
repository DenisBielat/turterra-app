'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icon';

/* ------------------------------------------------------------------ */
/*  Placeholder data — will be replaced with Supabase queries later   */
/* ------------------------------------------------------------------ */

interface GuideCard {
  id: number;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isPopular: boolean;
  sizeRange: string;
  lifespan: string;
}

const PLACEHOLDER_GUIDES: GuideCard[] = [
  {
    id: 1,
    commonName: 'Red-Eared Slider',
    scientificName: 'Trachemys scripta elegans',
    imageUrl: '/images/image-placeholder.png',
    category: 'Pond & Box Turtles',
    difficulty: 'Intermediate',
    isPopular: true,
    sizeRange: '8-12"',
    lifespan: '20-40 years',
  },
  {
    id: 2,
    commonName: 'Eastern Box Turtle',
    scientificName: 'Terrapene carolina carolina',
    imageUrl: '/images/image-placeholder.png',
    category: 'Pond & Box Turtles',
    difficulty: 'Intermediate',
    isPopular: false,
    sizeRange: '5-7"',
    lifespan: '25-40 years',
  },
  {
    id: 3,
    commonName: 'Northern Map Turtle',
    scientificName: 'Graptemys geographica',
    imageUrl: '/images/image-placeholder.png',
    category: 'Map Turtles',
    difficulty: 'Intermediate',
    isPopular: false,
    sizeRange: '7-11"',
    lifespan: '15-20 years',
  },
  {
    id: 4,
    commonName: 'Common Musk Turtle',
    scientificName: 'Sternotherus odoratus',
    imageUrl: '/images/image-placeholder.png',
    category: 'Musk & Mud Turtles',
    difficulty: 'Beginner',
    isPopular: true,
    sizeRange: '3-5"',
    lifespan: '30-50 years',
  },
  {
    id: 5,
    commonName: 'Russian Tortoise',
    scientificName: 'Testudo horsfieldii',
    imageUrl: '/images/image-placeholder.png',
    category: 'Tortoises',
    difficulty: 'Beginner',
    isPopular: false,
    sizeRange: '6-10"',
    lifespan: '40-50 years',
  },
  {
    id: 6,
    commonName: 'Painted Turtle',
    scientificName: 'Chrysemys picta',
    imageUrl: '/images/image-placeholder.png',
    category: 'Pond & Box Turtles',
    difficulty: 'Beginner',
    isPopular: false,
    sizeRange: '5-10"',
    lifespan: '25-30 years',
  },
];

/* ------------------------------------------------------------------ */
/*  Difficulty badge colour helper                                    */
/* ------------------------------------------------------------------ */

function difficultyColors(level: GuideCard['difficulty']) {
  switch (level) {
    case 'Beginner':
      return 'bg-green-600/90 text-white';
    case 'Intermediate':
      return 'bg-orange-500/90 text-white';
    case 'Advanced':
      return 'bg-red-500/90 text-white';
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function BrowseGuides() {
  const [activeTab, setActiveTab] = useState<'species' | 'topic'>('species');

  return (
    <section>
      {/* Section heading */}
      <div className="mb-2">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-950 border-l-4 border-green-600 pl-3">
          Browse Guides
        </h2>
      </div>
      <p className="text-gray-600 text-sm md:text-base max-w-2xl mb-6">
        Species-specific care guides tailored to the unique needs of each turtle
        and tortoise.
      </p>

      {/* Tab row */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('species')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'species'
              ? 'bg-green-950 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="category" style="line" size="sm" />
          Species Guides
        </button>
        <button
          onClick={() => setActiveTab('topic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'topic'
              ? 'bg-green-950 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="book-open" style="line" size="sm" />
          Topic Guides
        </button>
      </div>

      {/* Species Guides tab content */}
      {activeTab === 'species' && (
        <>
          {/* Search + filters row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="search" style="line" size="base" />
              </span>
              <input
                type="text"
                placeholder="Search species by name, scientific name, or family..."
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                disabled
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 cursor-not-allowed appearance-none pr-8"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                }}
              >
                <option>All Types</option>
              </select>
              <select
                disabled
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 cursor-not-allowed appearance-none pr-8"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                }}
              >
                <option>All Levels</option>
              </select>
            </div>
          </div>

          {/* Count */}
          <p className="text-xs text-gray-500 mb-6">
            {PLACEHOLDER_GUIDES.length} species guides available
          </p>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {PLACEHOLDER_GUIDES.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image area */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <Image
                    src={guide.imageUrl}
                    alt={guide.commonName}
                    fill
                    className="object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${difficultyColors(
                        guide.difficulty,
                      )}`}
                    >
                      {guide.difficulty}
                    </span>
                    {guide.isPopular && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400/90 text-amber-950">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Category label */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-2 px-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                      {guide.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-heading font-bold text-green-950 text-base mb-0.5">
                    {guide.commonName}
                  </h3>
                  <p className="text-xs text-gray-500 italic mb-3">
                    {guide.scientificName}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icon name="ruler" style="line" size="sm" className="text-gray-400" />
                      {guide.sizeRange}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="clock" style="line" size="sm" className="text-gray-400" />
                      {guide.lifespan}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon banner */}
          <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-green-950 font-semibold text-sm">
                More Species Guides Coming Soon
              </p>
              <p className="text-green-800/70 text-xs mt-0.5">
                We&apos;re actively working on new care guides. Have a species
                in mind?
              </p>
            </div>
            <a
              href="https://buymeacoffee.com/turterra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 font-semibold text-sm hover:text-green-900 transition-colors whitespace-nowrap"
            >
              Let us know &rarr;
            </a>
          </div>
        </>
      )}

      {/* Topic Guides tab content (placeholder) */}
      {activeTab === 'topic' && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">
            Topic guides are coming soon. Stay tuned!
          </p>
        </div>
      )}
    </section>
  );
}
