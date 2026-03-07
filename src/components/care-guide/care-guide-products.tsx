'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';
import type { IconNameMap } from '@/types/icons';
import { CareGuideMarkdown } from './care-guide-markdown';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

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
  /** Optional note shown at bottom (e.g. "See Diet & Nutrition section for details") */
  note?: string | null;
  setupTypes: SetupType[];
  /** Keyed by setup type id */
  categoriesBySetup: Record<string, ProductCategory[]>;
}

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */

/* Match Health & Common Issues: light bg + darker text in same color */
const priorityConfig: Record<
  ProductItem['priority'],
  { bg: string; text: string; label: string }
> = {
  essential: { bg: 'bg-red-100', text: 'text-red-700', label: 'Essential' },
  recommended: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Recommended' },
  optional: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Optional' },
};

/** Per-category icon and color (heating uses red); no container, icon only */
const categoryStyleMap: Record<
  string,
  { icon: IconNameMap['line']; iconColor: string }
> = {
  enclosure: { icon: 'enclosure', iconColor: 'text-green-800' },
  'lighting-uvb': { icon: 'lighting', iconColor: 'text-orange-800' },
  'heating-temp': { icon: 'temperature', iconColor: 'text-red-800' },
  filtration: { icon: 'water-filter-flex-line', iconColor: 'text-blue-800' },
  food: { icon: 'diet', iconColor: 'text-green-800' },
  substrate: { icon: 'substrate', iconColor: 'text-teal-800' },
  humidity: { icon: 'water-droplet', iconColor: 'text-blue-800' },
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
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {setupTypes.map((setup) => {
        const isActive = setup.id === activeSetup;
        const isDisabled = !setup.isActive;
        return (
          <button
            key={setup.id}
            disabled={isDisabled}
            onClick={() => setup.isActive && onSelect(setup.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-green-950 text-white'
                : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isDisabled && (
              <Icon name="lock" style="filled" size="sm" className="flex-shrink-0" />
            )}
            {setup.name}
            {isDisabled && (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                Soon
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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function DiyBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      <Icon name="wrench" style="line" size="xsm" className="flex-shrink-0 text-green-700" />
      DIY
    </span>
  );
}

function ProductItemCard({ item, optionsHref = '#' }: { item: ProductItem; optionsHref?: string }) {
  return (
    <a
      href={optionsHref}
      className="group flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-warm/50 px-5 py-4 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-body font-semibold text-black text-base">
            {item.name}
          </h4>
          {item.hasDiy && <DiyBadge />}
          <PriorityBadge priority={item.priority} />
        </div>
        {item.notes && (
          <p className="text-sm text-gray-700 mt-1">{item.notes}</p>
        )}
      </div>
      <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-green-800 transition-colors group-hover:bg-green-900 group-hover:bg-opacity-20">
        Options
        <Icon name="arrow-right-1" style="line" size="sm" className="text-green-800" />
      </span>
    </a>
  );
}

function CategoryAccordion({
  category,
  isOpen,
  onToggle,
}: {
  category: ProductCategory;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const style = categoryStyleMap[category.slug] ?? {
    icon: 'shop' as IconNameMap['line'],
    iconColor: 'text-gray-800',
  };
  const icon = style.icon;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-3">
              <Icon name={icon} style="line" size="base" className={`flex-shrink-0 ${style.iconColor}`} />
              <h3 className="font-heading font-bold text-black text-lg">
                {category.name}
              </h3>
            </div>
            <span className="text-sm text-gray-600 font-normal mt-0.5 pl-[calc(1rem+0.75rem)]">
              {category.items.length} {category.items.length === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          style="line"
          size="sm"
          className="text-gray-500 flex-shrink-0 transition-transform duration-200"
        />
      </button>

      {/* Animated open/close */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-gray-100 px-5 py-4 bg-white">
            <div className="flex flex-col gap-4">
              {category.items.map((item) => (
                <ProductItemCard key={item.id} item={item} />
              ))}
            </div>
            {category.categoryNote && (
              <div className="mt-4 rounded-xl bg-gray-100 px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Note:</span>{' '}
                  <CareGuideMarkdown inline>{category.categoryNote}</CareGuideMarkdown>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main component
   ------------------------------------------------------------------ */

function PriorityLegend() {
  return (
    <div className="rounded-lg bg-white px-4 py-3 mb-6">
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-800">
        <span className="font-semibold">Priority:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden />
          Essential
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
          Recommended
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden />
          Optional
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="wrench" style="line" size="xsm" className="text-green-700" />
          DIY Available
        </span>
      </div>
    </div>
  );
}

/** DIY callout after all products — styled like References disclaimer */
function SaveMoneyDiyCard() {
  return (
    <div className="mt-6 rounded-xl border border-green-200/60 bg-green-50/70 px-5 py-4">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-200">
          <Icon name="wrench" style="line" size="base" className="text-green-800" />
        </span>
        <div>
          <h3 className="font-heading font-bold text-gray-900 text-base">
            Save Money with DIY
          </h3>
          <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
            Many turtle keepers build better setups for less. Products with the DIY badge include community tutorials, videos, and build guides alongside commercial options.
          </p>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
          >
            Browse DIY guides
            <Icon name="arrow-corner-left" style="line" size="sm" className="rotate-180 text-green-700" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function CareGuideProducts({
  introText,
  note,
  setupTypes,
  categoriesBySetup,
}: CareGuideProductsProps) {
  const searchParams = useSearchParams();
  const { setRequestedProductCategory, requestedProductCategory } = useCareGuideActiveSection();
  const firstActive = setupTypes.find((s) => s.isActive);
  const [activeSetup, setActiveSetup] = useState(firstActive?.id ?? setupTypes[0]?.id ?? '');
  const categories = categoriesBySetup[activeSetup] || [];
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // First accordion open by default; reset when user changes tabs
  const firstCategoryId = categories[0]?.id ?? null;
  useEffect(() => {
    setOpenCategoryId(firstCategoryId);
  }, [activeSetup, firstCategoryId]);

  // When Shop button sets requestedProductCategory, open that accordion immediately (no URL delay)
  useEffect(() => {
    if (!requestedProductCategory || categories.length === 0) return;
    const category = categories.find((c) => c.slug === requestedProductCategory);
    if (category) setOpenCategoryId(category.id);
    setRequestedProductCategory(null);
  }, [requestedProductCategory, categories, setRequestedProductCategory]);

  // When openCategory slug is in URL (e.g. shared link), open that accordion
  useEffect(() => {
    const slug = searchParams.get('openCategory');
    if (!slug || categories.length === 0) return;
    const category = categories.find((c) => c.slug === slug);
    if (category) setOpenCategoryId(category.id);
  }, [searchParams, categories]);

  const hasContent = setupTypes.length > 0 && Object.values(categoriesBySetup).some((cats) => cats.length > 0);
  if (!hasContent) return null;

  const subtitle = introText ?? 'Equipment organized by setup type';

  return (
    <section id="shopping-checklist" className="scroll-mt-40">
      {/* Section header */}
      <div className="mb-6">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-black">
          Recommended Products
        </h2>
        <p className="mt-2 text-base text-gray-700 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Setup type tabs */}
      <SetupTabs
        setupTypes={setupTypes}
        activeSetup={activeSetup}
        onSelect={setActiveSetup}
      />

      {/* Priority legend */}
      <PriorityLegend />

      {/* Category accordions */}
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <CategoryAccordion
            key={cat.id}
            category={cat}
            isOpen={openCategoryId === cat.id}
            onToggle={() => setOpenCategoryId((prev) => (prev === cat.id ? null : cat.id))}
          />
        ))}
      </div>

      {/* Save Money with DIY — after all products */}
      <SaveMoneyDiyCard />

      {/* Note — same mini-card style as category notes */}
      {note && (
        <div className="mt-6 rounded-xl bg-gray-100 px-4 py-3 shadow-sm [&_a]:text-green-700 [&_a]:font-medium [&_a]:underline [&_a:hover]:text-green-800">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Note:</span>{' '}
            <CareGuideMarkdown inline>{note}</CareGuideMarkdown>
          </p>
        </div>
      )}
    </section>
  );
}
