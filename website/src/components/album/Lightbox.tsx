'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ImageItem } from '@/lib/api';

interface LightboxProps {
  images: ImageItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < images.length;
  const currentImage = isOpen ? images[currentIndex] : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [isOpen, onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-sm select-none transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between text-white/80 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs sm:text-sm font-medium tracking-wide">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex-1 w-full max-h-[85vh] flex items-center justify-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
          <Image
            src={currentImage.url}
            alt={`Photo ${currentIndex + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer backdrop-blur-xs"
            aria-label="Previous photo"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer backdrop-blur-xs"
            aria-label="Next photo"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom info/spacer */}
      <div className="text-center text-xs text-white/50 py-1">
        Use arrow keys or buttons to navigate • Press ESC to close
      </div>
    </div>
  );
}
