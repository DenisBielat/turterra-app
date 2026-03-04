'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import type { IconNameMap } from '@/types/icons';

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

export interface ProductItem {
  id: string;
  name: string;
  priority: 'essential' | 'recommended' | 'optional';
  hasDiy: boolean;
  notes: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  items: ProductItem[];
  categoryNote: string | null;
}

export interface SetupType {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface CareGuideProductsProps {
  introText?: string | null;
  setupTypes: SetupType[];
  /** Keyed by setup type id */
  categoriesBySetup: Record<string, ProductCategory[]>;
}

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */

const priorityConfig: Record<
  ProductItem['priority'],
  { bg: string; text: string; label: string }
> = {
  essential: { bg: 'bg-green-100', text: 'text-green-700', label: 'Essential' },
  recommended: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recommended' },
  optional: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Optional' },
};

const categoryIconMap: Record<string, IconNameMap['line']> = {
  enclosure: 'enclosure',
  'lighting-uvb': 'lighting',
  'heating-temp': 'temperature',
  filtration: 'water-filter-flex-line',
  food: 'diet',
};

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

function SetupTabs({
  setupTypes,
  activeSetup,
  onSelect,
}: {
  setupTypes: SetupType[];
  activeSetup: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {setupTypes.map((setup) => {
        const isActive = setup.id === activeSetup;
        return (
          <button
            key={setup.id}
            disabled={!setup.isActive}
            onClick={() => setup.isActive && onSelect(setup.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-green-950 text-white'
                : setup.isActive
                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {setup.name}
            {!setup.isActive && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Coming Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: ProductItem['priority'] }) {
  const config = priorityConfig[priority];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function DiyBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      DIY
    </span>
  );
}

function ProductItemCard({ item }: { item: ProductItem }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-heading font-semibold text-black text-base">
            {item.name}
          </h4>
          {item.notes && (
            <p className="text-sm text-gray-500 mt-0.5">{item.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.hasDiy && <DiyBadge />}
          <PriorityBadge priority={item.priority} />
        </div>
      </div>
    </div>
  );
}

function CategoryAccordion({ category }: { category: ProductCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const icon = categoryIconMap[category.slug] || 'shop';

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} style="line" size="base" className="text-green-700 flex-shrink-0" />
          <h3 className="font-heading font-bold text-black text-lg">
            {category.name}
          </h3>
          <span className="text-sm text-gray-400 font-medium">
            {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          style="line"
          size="sm"
          className="text-gray-400 flex-shrink-0"
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-4">
          <div className="flex flex-col gap-3">
            {category.items.map((item) => (
              <ProductItemCard key={item.id} item={item} />
            ))}
          </div>
          {category.categoryNote && (
            <p className="mt-4 text-sm text-gray-500 italic">
              {category.categoryNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

export function CareGuideProducts({
  introText,
  setupTypes,
  categoriesBySetup,
}: CareGuideProductsProps) {
  const firstActive = setupTypes.find((s) => s.isActive);
  const [activeSetup, setActiveSetup] = useState(firstActive?.id ?? setupTypes[0]?.id ?? '');

  const hasContent = setupTypes.length > 0 && Object.values(categoriesBySetup).some((cats) => cats.length > 0);
  if (!hasContent) return null;

  const categories = categoriesBySetup[activeSetup] || [];

  return (
    <section id="shopping-checklist" className="scroll-mt-40">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Recommended Products
        </h2>
        {introText && (
          <p className="mt-3 text-base text-gray-700 leading-relaxed">
            {introText}
          </p>
        )}
      </div>

      {/* Setup type tabs */}
      <SetupTabs
        setupTypes={setupTypes}
        activeSetup={activeSetup}
        onSelect={setActiveSetup}
      />

      {/* Category accordions */}
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <CategoryAccordion key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
}
