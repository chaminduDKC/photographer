'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAlbumImages, type ImageItem } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import LazyImage from '@/components/LazyImage';
import ScrollReveal from '@/components/ScrollReveal';
import Lightbox from '@/components/album/Lightbox';

interface ImageGridProps {
  albumId: string;
  initialImages: ImageItem[];
}

export default function ImageGrid({ albumId, initialImages }: ImageGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.albums.images(albumId),
    queryFn: ({ pageParam }) =>
      getAlbumImages(albumId, pageParam as string | undefined, 20),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialData: {
      pages: [
        {
          images: initialImages,
          nextCursor:
            initialImages.length >= 20
              ? initialImages[initialImages.length - 1].id
              : undefined,
          hasMore: initialImages.length >= 20,
        },
      ],
      pageParams: [undefined],
    },
  });

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '300px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const allImages = data?.pages.flatMap((p) => p.images) ?? [];

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % allImages.length);
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev ?? 0) - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length === 0) {
    return (
      <div className="text-center py-20 text-brand-400">
        <p>No photos uploaded to this album yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {allImages.map((image, index) => (
          <ScrollReveal key={image.id}>
            <div
              onClick={() => handleOpenLightbox(index)}
              className="group relative aspect-[3/4] sm:aspect-square lg:aspect-[3/4] rounded-xl overflow-hidden bg-brand-50 cursor-pointer shadow-xs hover:shadow-md transition-shadow"
            >
              <LazyImage
                src={image.url}
                alt={`Photo ${index + 1}`}
                fill
                priority={index < 3}
                containerClassName="w-full h-full relative"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="group-hover:scale-104 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 p-2.5 rounded-full text-brand-900 shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-6" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-700 rounded-full animate-spin" />
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        images={allImages}
        currentIndex={lightboxIndex}
        onClose={handleCloseLightbox}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
  );
}
