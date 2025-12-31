'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import MobileProfileMenu from './MobileProfileMenu';
import { TaxonomyData } from '@/types/turtleTypes';

interface MobileProfileMenuWrapperProps {
  name: string;
  species: string;
  imageUrl: string;
  taxonomy?: TaxonomyData | null;
}

export default function MobileProfileMenuWrapper({
  name,
  species,
  imageUrl,
  taxonomy
}: MobileProfileMenuWrapperProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button - Only visible on mobile/tablet */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="lg:hidden fixed left-4 top-20 z-40 flex items-center justify-center w-12 h-12 bg-green-900/90 hover:bg-green-800 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
        aria-label="Open profile navigation menu"
      >
        <BookOpen className="w-5 h-5" />
      </button>

      {/* Mobile Navigation Menu */}
      <MobileProfileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        name={name}
        species={species}
        imageUrl={imageUrl}
        taxonomy={taxonomy}
      />
    </>
  );
}
