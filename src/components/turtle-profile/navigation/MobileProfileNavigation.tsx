"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, RotateCcw } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { TaxonomyData } from '@/types/turtleTypes';

interface MobileProfileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  species: string;
  imageUrl: string;
  taxonomy?: TaxonomyData | null;
}

interface TaxonomyRowProps {
  common: string;
  scientific: string;
  rank: string;
}

function TaxonomyRow({ common, scientific, rank }: TaxonomyRowProps) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex flex-col gap-0.5">
        <span className="font-heading font-bold text-base text-gray-900">{common}</span>
        <span className="italic text-gray-600 text-sm">{scientific}</span>
      </div>
      <span className="text-xs font-medium text-gray-500 italic">{rank}</span>
    </div>
  );
}

export default function MobileProfileNavigation({
  isOpen,
  onClose,
  name,
  species,
  imageUrl,
  taxonomy
}: MobileProfileNavigationProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const navItems = useMemo(() => ([
    {
      id: 'intro',
      label: 'At a Glance',
      icon: <Icon name="eyeball" style="filled" size="base" />
    },
    {
      id: 'identification',
      label: 'Identification',
      icon: <Icon name="marine-turtle" style="filled" size="base" />
    },
    {
      id: 'distribution',
      label: 'Distribution',
      icon: <Icon name="trip-map-markers" style="filled" size="base" />
    },
    {
      id: 'habitat',
      label: 'Habitat & Behavior',
      icon: <Icon name="outdoors-tree-valley" style="filled" size="base" />
    },
    {
      id: 'conservation',
      label: 'Conservation',
      icon: <Icon name="hand-shake-heart" style="filled" size="base" />
    }
  ]), []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 100;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    onClose();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClose();
  };

  const handleFlipToTaxonomy = () => {
    if (taxonomy) {
      setIsFlipped(true);
    }
  };

  const handleFlipBack = () => {
    setIsFlipped(false);
  };

  const handleClose = () => {
    setIsFlipped(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Flip Card Container */}
      <div
        className="relative w-[85%] max-w-sm"
        style={{ perspective: '1000px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Side - Navigation */}
          <div
            className="relative w-full bg-warm rounded-2xl shadow-2xl p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col gap-3 items-center justify-center text-center mb-6">
              <Image
                src={imageUrl}
                alt={`Profile image of ${name}`}
                width={120}
                height={120}
                className="rounded-full w-28 h-28 object-cover aspect-square"
                sizes="120px"
              />
              <h5 className="font-heading font-bold text-xl leading-tight">{name}</h5>
              {taxonomy ? (
                <button
                  onClick={handleFlipToTaxonomy}
                  className="italic text-gray-700 hover:text-green-800 hover:underline transition-colors cursor-pointer text-sm"
                >
                  {species}
                </button>
              ) : (
                <div className="italic text-gray-700 text-sm">{species}</div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold hover:bg-green-800 hover:text-white"
                >
                  <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                  {item.label}
                </button>
              ))}

              <button
                onClick={scrollToTop}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold hover:bg-green-800 hover:text-white"
              >
                <div className="w-5 h-5 flex items-center justify-center -rotate-90">
                  <Icon name="arrow-right" style="filled" size="base"/>
                </div>
                Back to Top
              </button>
            </div>
          </div>

          {/* Back Side - Taxonomy */}
          <div
            className="absolute top-0 left-0 w-full bg-warm rounded-2xl shadow-2xl p-6"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Flip Back Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFlipBack();
              }}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Back to navigation"
            >
              <RotateCcw className="h-5 w-5 text-gray-600" />
            </button>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Taxonomy Content */}
            <div className="pt-8">
              <h3 className="font-heading font-bold text-lg mb-4 text-center">
                Taxonomy at a Glance
              </h3>

              {taxonomy && (
                <div className="space-y-0">
                  <TaxonomyRow
                    common={taxonomy.order.common}
                    scientific={taxonomy.order.scientific}
                    rank="Order"
                  />
                  <TaxonomyRow
                    common={taxonomy.suborder.common}
                    scientific={taxonomy.suborder.scientific}
                    rank="Suborder"
                  />
                  <TaxonomyRow
                    common={taxonomy.family.common}
                    scientific={taxonomy.family.scientific}
                    rank="Family"
                  />
                  <TaxonomyRow
                    common={taxonomy.genus.common}
                    scientific={taxonomy.genus.scientific}
                    rank="Genus"
                  />
                  <TaxonomyRow
                    common={taxonomy.species.common}
                    scientific={taxonomy.species.scientific}
                    rank="Species"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
