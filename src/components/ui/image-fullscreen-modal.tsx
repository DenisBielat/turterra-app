"use client";

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Icon from '@/components/Icon';

interface ImageFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  images?: { url: string; alt: string }[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export function ImageFullscreenModal({
  isOpen,
  onClose,
  imageUrl,
  alt,
  images,
  currentIndex,
  onNavigate
}: ImageFullscreenModalProps) {
  const canNavigate = images && images.length > 1 && currentIndex !== undefined && onNavigate;

  const goToPrevious = useCallback(() => {
    if (!canNavigate) return;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  }, [canNavigate, currentIndex, images, onNavigate]);

  const goToNext = useCallback(() => {
    if (!canNavigate) return;
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(nextIndex);
  }, [canNavigate, currentIndex, images, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, goToPrevious, goToNext]);

  if (!isOpen) return null;

  const displayUrl = canNavigate ? images[currentIndex].url : imageUrl;
  const displayAlt = canNavigate ? images[currentIndex].alt : alt;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-green-950/80 hover:bg-green-950 transition-colors z-10 flex items-center justify-center"
        aria-label="Close fullscreen"
      >
        <X className="h-5 w-5 text-white" />
      </button>

      {/* Previous Button */}
      {canNavigate && (
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-green-950/80 hover:bg-green-950 transition-colors z-10 flex items-center justify-center"
          aria-label="Previous image"
        >
          <Icon name="arrow-left-1" style="line" size="lg" className="text-white" />
        </button>
      )}

      {/* Next Button */}
      {canNavigate && (
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-green-950/80 hover:bg-green-950 transition-colors z-10 flex items-center justify-center"
          aria-label="Next image"
        >
          <Icon name="arrow-right-1" style="line" size="lg" className="text-white" />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt={displayAlt}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Image Counter */}
      {canNavigate && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
