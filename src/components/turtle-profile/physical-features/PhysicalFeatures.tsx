'use client'

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import VariantModal from './VariantModal';
import { Variant, FeatureVariants } from '@/types/features';

interface Feature {
  name: string;
  value: string;
  variants?: FeatureVariants;  // Add this to track differences
  subFeatures: {
    name: string;
    value: string;
    variants?: FeatureVariants;  // Also for sub-features
  }[];
  images?: { url: string }[];
}

interface Category {
  name: string;
  features: Feature[];
  image?: { url: string };
}

interface PhysicalFeaturesProps {
  categories: Category[];
  openCategory: string;
  onCategoryClick: (categoryName: string, isOpen: boolean) => void;
}

function formatValue(value: any): React.ReactNode {
  // Handle null/undefined/unknown
  if (!value || value === 'Unknown') return '-';

  // Convert to string if it's not already
  const stringValue = String(value);

  // Handle boolean values
  if (stringValue.toLowerCase() === 'true' || value === true) {
    return <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600" />;
  }
  if (stringValue.toLowerCase() === 'false' || value === false) {
    return <Icon name="close" size="sm" style="filled" className="text-gray-400" />;
  }

  // Handle comma-separated values
  if (stringValue.includes(',')) {
    return stringValue
      .split(',')
      .map(item => item.trim())
      .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(', ');
  }

  // Handle single value
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
}

export default function PhysicalFeatures({ 
  categories,
  openCategory,
  onCategoryClick
}: PhysicalFeaturesProps) {
  const [selectedVariant, setSelectedVariant] = useState<{
    name: string;
    variants: FeatureVariants;
  } | null>(null);

  const toCategoryTag = (category: string) => {
    return category
      .toLowerCase()
      .replace(/\//g, '-and-')
      .replace(/\s+/g, '-');
  };

  const scrollToSection = (element: HTMLElement) => {
    const yOffset = -100;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleCategoryClick = (e: React.MouseEvent, categoryName: string, isOpen: boolean) => {
    e.preventDefault();
    onCategoryClick(categoryName, isOpen);
    
    const header = e.currentTarget;
    const content = header.nextElementSibling;
    
    if (!isOpen && content instanceof HTMLElement) {
      content.addEventListener('transitionend', function onTransitionEnd(event: TransitionEvent) {
        if (event.propertyName === 'max-height') {
          content.removeEventListener('transitionend', onTransitionEnd);
          scrollToSection(header as HTMLElement);
        }
      });
    }
  };

  return (
    <>
      <div className="space-y-2">
        {categories.map((category) => {
          const isOpen = category.name === openCategory;
          const categoryTag = toCategoryTag(category.name);

          return (
            <div
              key={category.name}
              className="border border-gray-200 rounded-lg overflow-hidden scroll-mt-24 drop-shadow-md"
              id={`feature-${categoryTag}`}
            >
              <button
                className="w-full flex justify-between items-center p-4 bg-white hover:bg-green-900/20 transition-colors"
                onClick={(e) => handleCategoryClick(e, category.name, isOpen)}
                aria-expanded={isOpen}
                aria-controls={`content-${categoryTag}`}
              >
                <span className="text-lg font-bold">{category.name}</span>
                <Icon
                  name="chevron-down"
                  size="sm"
                  style="line"
                  className={`transition-transform duration-500 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Animated content wrapper */}
              <div className="relative">
                <div className="accordion-animated-content">
                  {/* Category Image Container */}
                  <div className={`transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    {category.image && (
                      <div className="p-4 bg-white">
                        <img
                          src={category.image.url}
                          alt={`${category.name} features`}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div
                    id={`content-${categoryTag}`}
                    className={`transition-all duration-500 ease-in-out ${
                      isOpen
                        ? 'max-h-[2000px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="grid grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)] gap-8 px-4 pt-4 pb-2 bg-white border-b border-gray-200">
                      <div className="text-xs text-gray-400">Feature</div>
                      <div className="text-xs text-gray-400">Value</div>
                    </div>

                    {/* Features */}
                    {category.features.map((feature, index) => (
                      <div 
                        key={feature.name} 
                        className={`feature-group ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#f2f2f2]'
                        } ${
                          index === category.features.length - 1 ? 'pb-2' : ''
                        }`}
                      >
                        <div className={`grid grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)] gap-8 px-4 py-2 ${
                          index > 0 ? 'border-t border-gray-200' : ''
                        }`}>
                          <div className="font-semibold">
                            {feature.name}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center h-5">
                              {formatValue(feature.value)}
                            </div>
                            {feature.variants && (
                              <button
                                onClick={() => feature.variants && setSelectedVariant({
                                  name: feature.name,
                                  variants: feature.variants
                                })}
                                className="p-1 flex items-center justify-center hover:bg-gray-100 rounded-sm"
                                title="View variant differences"
                              >
                                <Icon name="split-3" size="sm" style="line" className="text-violet-800" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sub-features */}
                        {feature.subFeatures.map((sub) => (
                          <div key={sub.name} className="grid grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)] gap-8 px-4 pb-2">
                            <div className="pl-10 relative flex items-center">
                              <Icon
                                name="flow-arrow-1"
                                size="base"
                                style="filled"
                                className="absolute left-2 text-black"
                              />
                              <span className="font-semibold">{sub.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center h-5">
                                {formatValue(sub.value)}
                              </div>
                              {sub.variants && (
                                <button
                                  onClick={() => sub.variants && setSelectedVariant({
                                    name: sub.name,
                                    variants: sub.variants
                                  })}
                                  className="p-1 flex items-center justify-center hover:bg-gray-100 rounded-sm"
                                  title="View variant differences"
                                >
                                  <Icon name="split-3" size="sm" style="line" className="text-violet-800"/>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Variant Modal */}
      {selectedVariant?.variants && (
        <VariantModal
          isOpen={true}
          onClose={() => setSelectedVariant(null)}
          featureName={selectedVariant.name}
          variants={selectedVariant.variants}
        />
      )}
    </>
  );
} 