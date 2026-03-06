'use client';

import { useCallback } from 'react';
import { Icon } from '@/components/Icon';
import { useCareGuideActiveSection } from './care-guide-active-section-context';

/** Product category slugs in the Product Guide section */
export type ProductCategorySlug =
  | 'enclosure'
  | 'lighting-uvb'
  | 'heating-temp'
  | 'filtration'
  | 'food'
  | 'substrate';

interface CareGuideShopButtonProps {
  /** Slug of the product category to open in the Product Guide (e.g. enclosure, lighting-uvb) */
  productCategorySlug: ProductCategorySlug;
  className?: string;
}

const PRODUCT_SECTION_ID = 'shopping-checklist';

/**
 * Shop button for care guide sections. Scrolls to the Product Guide immediately
 * and opens the corresponding category via context (no URL navigation delay).
 */
export function CareGuideShopButton({
  productCategorySlug,
  className = '',
}: CareGuideShopButtonProps) {
  const { setRequestedProductCategory } = useCareGuideActiveSection();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const el = document.getElementById(PRODUCT_SECTION_ID);
      if (el) {
        setRequestedProductCategory(productCategorySlug);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [productCategorySlug, setRequestedProductCategory]
  );

  return (
    <a
      href={`#${PRODUCT_SECTION_ID}`}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-warm px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-green-800 hover:text-white hover:border-green-800 ${className}`}
    >
      <Icon name="shop" style="line" size="sm" className="[color:inherit]" />
      Shop
    </a>
  );
}
