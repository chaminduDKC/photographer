'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAlbums, type PaginatedResponse, type Album } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import LazyImage from '@/components/LazyImage';
import ScrollReveal from '@/components/ScrollReveal';

interface Props {
  categorySlug: string;
  initialData: PaginatedResponse<Album>;
}

export default function CategoryAlbumsGrid({ categorySlug, initialData }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.albums.list({ categorySlug }),
    queryFn: ({ pageParam }) =>
      getAlbums({ categorySlug, page: pageParam, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialData: {
      pages: [initialData],
      pageParams: [1],
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
      rootMargin: '200px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const albums = data?.pages.flatMap((p) => p.albums) ?? [];

  if (albums.length === 0) {
    return (
      <div className="text-center py-16 text-brand-400">
        <p>No albums in this category yet. Explore Other Albums</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <ScrollReveal key={album.id}>
            <Link
              href={`/album/${album.slug}`}
              prefetch={true}
              className="group block rounded-sm overflow-hidden bg-white border border-brand-100 hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[3/4]">
                <LazyImage
                  src={album.thumbnailUrl}
                  alt={album.name}
                  fill
                  containerClassName="w-full h-full relative"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-brand-900 truncate">{album.name}</h3>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-300 border-t-brand-700 rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
