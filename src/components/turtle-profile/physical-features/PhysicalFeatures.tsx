'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import VariantModal from './VariantModal';
import { formatFeatureValue } from '@/lib/formatters';

// Import the types
import {
  FeatureVariants,
  PhysicalFeaturesProps
} from '@/types/turtleTypes';

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

  // Format category name with new format: "Carapace | Shell Top"
  const formatCategoryName = (categoryName: string) => {
    const nameMapping: Record<string, { primary: string; secondary: string }> = {
      'Shell Top': { primary: 'Carapace', secondary: 'Shell Top' },
      'Shell Bottom': { primary: 'Plastron', secondary: 'Shell Bottom' }
    };
    
    const mapped = nameMapping[categoryName];
    if (mapped) {
      return (
        <>
          <span>{mapped.primary}</span>
          <span className="text-sm text-gray-500 font-normal"> | {mapped.secondary}</span>
        </>
      );
    }
    return categoryName;
  };

  // Format attribution text (asset type and credits only)
  const formatAttribution = (metadata?: {
    asset_type?: string;
    credits_basic?: string;
  }) => {
    if (!metadata) return null;

    // Helper function to capitalize first letter
    const capitalize = (str: string) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    // Add asset type (capitalized) and credits basic
    let attributionText = "";
    if (metadata.asset_type && metadata.credits_basic) {
      const assetType = capitalize(metadata.asset_type);
      attributionText = `${assetType}: ${metadata.credits_basic}`;
    } else if (metadata.asset_type) {
      attributionText = capitalize(metadata.asset_type);
    } else if (metadata.credits_basic) {
      attributionText = metadata.credits_basic;
    }
    
    return attributionText || null;
  };

  const scrollToSection = (element: HTMLElement) => {
    const yOffset = -100;
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleCategoryClick = (e: React.MouseEvent, categoryName: string, isOpen: boolean) => {
    e.preventDefault();
    onCategoryClick(categoryName, isOpen);

    // Only scroll when opening a category
    if (!isOpen) {
      const header = e.currentTarget as HTMLElement;
      // Use requestAnimationFrame to wait for the DOM update, then scroll after animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToSection(header);
        }, 550); // Slightly longer than the 500ms animation duration
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
                <span className="text-base md:text-lg font-bold">{formatCategoryName(category.name)}</span>
                <Icon
                  name="chevron-down"
                  size="sm"
                  style="line"
                  className={`transition-transform duration-500 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Animated content wrapper using CSS Grid for smooth height animation */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  {/* Category Image Container */}
                  <div
                    className={`transition-opacity duration-500 ease-in-out ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {category.image && (
                      <div className="p-4 bg-white">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={category.image.url}
                            alt={`${category.name} features`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        {category.image.metadata && formatAttribution(category.image.metadata) && (
                          <div className="mt-2 text-xs text-gray-500 text-right">
                            {formatAttribution(category.image.metadata)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div
                    id={`content-${categoryTag}`}
                    className={`transition-opacity duration-500 ease-in-out ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Header Row - hidden on mobile */}
                    <div className="hidden md:grid grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)] gap-8 px-4 pt-4 pb-2 bg-white border-b border-gray-200">
                      <div className="text-xs text-gray-400">Feature</div>
                      <div className="text-xs text-gray-400">Value</div>
                    </div>

                    {/* Features */}
                    {category.features.map((feature, index) => (
                      <div
                        key={feature.name}
                        className={`feature-group ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#f2f2f2]'
                        } ${index === category.features.length - 1 ? 'pb-2' : ''}`}
                      >
                        <div
                          className={`flex flex-col md:grid md:grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)] gap-1 md:gap-8 px-4 py-3 ${
                            index > 0 ? 'border-t border-gray-200' : ''
                          }`}
                        >
                          <div className="font-semibold text-sm md:text-base self-start pt-0.5">{feature.name}</div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0 text-sm md:text-base text-gray-700 md:text-black">
                              {formatFeatureValue(feature.value)}
                            </div>
                            {feature.variants && (
                              <button
                                onClick={() =>
                                  setSelectedVariant({
                                    name: feature.name,
                                    variants: feature.variants!
                                  })
                                }
                                className="p-1 flex items-center justify-center hover:bg-gray-100 rounded-sm flex-shrink-0"
                                aria-label={`View variant differences for ${feature.name}`}
                              >
                                <Icon
                                  name="split-3"
                                  size="sm"
                                  style="line"
                                  className="text-violet-800"
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sub-features */}
                        {feature.subFeatures.map((sub) => (
                          <div
                            key={sub.name}
                            className="flex flex-col md:grid md:grid-cols-[minmax(200px,1fr)_minmax(200px,2fr)] gap-1 md:gap-8 px-4 py-2"
                          >
                            <div className="pl-6 md:pl-10 relative flex items-start pt-0.5">
                              <Icon
                                name="flow-arrow-1"
                                size="base"
                                style="filled"
                                className="absolute left-0 md:left-2 top-1 text-black"
                              />
                              <span className="font-semibold text-sm md:text-base">{sub.name}</span>
                            </div>
                            <div className="flex items-start justify-between gap-2 pl-6 md:pl-0">
                              <div className="flex-1 min-w-0 text-sm md:text-base text-gray-700 md:text-black">
                                {formatFeatureValue(sub.value)}
                              </div>
                              {sub.variants && (
                                <button
                                  onClick={() =>
                                    setSelectedVariant({
                                      name: sub.name,
                                      variants: sub.variants!
                                    })
                                  }
                                  className="p-1 flex items-center justify-center hover:bg-gray-100 rounded-sm flex-shrink-0"
                                  aria-label={`View variant differences for ${sub.name}`}
                                >
                                  <Icon
                                    name="split-3"
                                    size="sm"
                                    style="line"
                                    className="text-violet-800"
                                  />
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