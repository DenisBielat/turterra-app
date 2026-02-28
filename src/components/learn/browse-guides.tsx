'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icon';

export interface CareGuide {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  category: string | null;
  sizeRange: string | null;
  lifespan: string | null;
}

interface BrowseGuidesProps {
  guides: CareGuide[];
}

const PLACEHOLDER_IMAGE = '/images/image-placeholder.png';

export function BrowseGuides({ guides }: BrowseGuidesProps) {
  const [activeTab, setActiveTab] = useState<'species' | 'topic'>('species');

  return (
    <section>
      {/* Section heading */}
      <div className="mb-2">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-green-950">
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
          Species Care Guides
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
            {guides.length} species guide{guides.length !== 1 ? 's' : ''} available
          </p>

          {/* Card grid — styled to match TurtleCard grid view */}
          {guides.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-8">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="group relative block aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-green-900 ring-1 ring-white/5 hover:ring-white/20 shadow-lg hover:shadow-2xl hover:shadow-black/40 transform-gpu will-change-transform transition-[transform,box-shadow,ring-color] duration-300 ease-out hover:scale-[1.02] cursor-pointer"
                >
                  {/* Image with parallax hover zoom */}
                  <Image
                    src={guide.imageUrl || PLACEHOLDER_IMAGE}
                    alt={guide.commonName}
                    fill
                    className="object-cover transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Stats pill — top-right, always visible */}
                  {(guide.sizeRange || guide.lifespan) && (
                    <span className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-green-950 text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                      {guide.sizeRange && (
                        <span className="flex items-center gap-0.5">
                          <Icon name="ruler" style="line" size="sm" className="text-green-800" />
                          {guide.sizeRange}
                        </span>
                      )}
                      {guide.sizeRange && guide.lifespan && (
                        <span className="w-px h-3 bg-green-950/20" />
                      )}
                      {guide.lifespan && (
                        <span className="flex items-center gap-0.5">
                          <Icon name="clock" style="line" size="sm" className="text-green-800" />
                          {guide.lifespan}
                        </span>
                      )}
                    </span>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Content at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10">
                    {/* Family eyebrow */}
                    {guide.category && (
                      <p className="hidden sm:block text-green-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                        {guide.category}
                      </p>
                    )}

                    {/* Name */}
                    <h3 className="font-heading font-bold text-white text-sm sm:text-xl drop-shadow-lg line-clamp-2">
                      {guide.commonName}
                    </h3>

                    {/* Scientific name */}
                    {guide.scientificName && (
                      <p className="hidden sm:block text-gray-400 text-sm italic mt-1">
                        {guide.scientificName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <p className="text-gray-500 text-sm">
                No published species care guides yet. Check back soon!
              </p>
            </div>
          )}

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
