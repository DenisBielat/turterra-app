'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Icon } from '@/components/Icon';
import { TaxonomyData } from '@/types/turtleTypes';
import TaxonomyPopup from './TaxonomyPopup';

interface MobileProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  species: string;
  imageUrl: string;
  taxonomy?: TaxonomyData | null;
}

export default function MobileProfileMenu({
  isOpen,
  onClose,
  name,
  species,
  imageUrl,
  taxonomy
}: MobileProfileMenuProps) {
  const [activeSection, setActiveSection] = useState('intro');
  const [isTaxonomyOpen, setIsTaxonomyOpen] = useState(false);

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

  // Add throttle utility
  const throttle = <T extends unknown[]>(func: (...args: T) => void, limit: number) => {
    let inThrottle = false;
    return (...args: T) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  };

  // Scroll handling logic to update active section
  useEffect(() => {
    const SCROLL_OFFSET = 100;

    const getCurrentSection = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      let currentSection = '';
      let minDistance = Infinity;

      sections.forEach(section => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - SCROLL_OFFSET);

        if (distance < minDistance) {
          minDistance = distance;
          currentSection = section.id;
        }
      });

      if (window.scrollY < SCROLL_OFFSET) {
        currentSection = 'intro';
      }

      return currentSection;
    };

    const handleScroll = throttle(() => {
      const current = getCurrentSection();
      if (current) setActiveSection(current);
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const handleChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  // Navigation click handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 100;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Close the menu after navigation
    onClose();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleChange}>
        <DialogContent className="mobile-menu-content fixed left-0 top-0 h-full w-[85vw] max-w-sm translate-x-0 translate-y-0 rounded-none rounded-r-2xl bg-neutral p-0 gap-0 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>
              Profile Navigation
            </DialogTitle>
            <VisuallyHidden>
              Navigate to different sections of the turtle profile
            </VisuallyHidden>
          </DialogHeader>

          <div className="flex flex-col h-full overflow-y-auto">
            {/* Profile Header */}
            <div className="flex flex-col gap-4 items-center justify-center p-6 pt-12 text-center">
              <Image
                src={imageUrl}
                alt={`Profile image of ${name}`}
                width={120}
                height={120}
                className="rounded-full w-30 h-30 object-cover aspect-square"
                sizes="120px"
              />
              <h5 className="font-heading font-bold text-2xl">{name}</h5>
              {taxonomy ? (
                <button
                  onClick={() => setIsTaxonomyOpen(true)}
                  className="italic text-gray-700 hover:text-green-800 hover:underline transition-colors cursor-pointer"
                >
                  {species}
                </button>
              ) : (
                <div className="italic">{species}</div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-2 px-4 pb-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold
                    ${activeSection === item.id
                      ? 'bg-green-800 text-white'
                      : 'hover:bg-green-800 hover:text-white'
                    }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                  {item.label}
                </button>
              ))}

              <button
                onClick={scrollToTop}
                className="flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold hover:bg-green-800 hover:text-white"
              >
                <div className="w-5 h-5 flex items-center justify-center -rotate-90">
                  <Icon name="arrow-right" style="filled" size="base"/>
                </div>
                Back to Top
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {taxonomy && (
        <TaxonomyPopup
          isOpen={isTaxonomyOpen}
          onClose={() => setIsTaxonomyOpen(false)}
          taxonomy={taxonomy}
        />
      )}
    </>
  );
}
