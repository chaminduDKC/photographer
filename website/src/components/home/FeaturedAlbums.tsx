'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getAlbums } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import LazyImage from '@/components/LazyImage';
import ScrollReveal from '@/components/ScrollReveal';

export default function FeaturedAlbums() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.albums.list({ featured: true }),
    queryFn: () => getAlbums({ featured: true, limit: 8 }),
  });

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 px-4 bg-brand-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-brand-900 text-center mb-2">
            Featured Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] skeleton rounded-sm" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.albums.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 px-4 bg-brand-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-4">
          <p className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-2">
            Highlights
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-brand-900">
            Featured Work
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.albums.map((album) => (
            <ScrollReveal key={album.id}>
              <Link
                href={`/album/${album.slug}`}
                prefetch={true}
                className="group block rounded-sm overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[3/4]">
                  <LazyImage
                    src={album.thumbnailUrl}
                    alt={album.name}
                    fill
                    containerClassName="w-full h-full relative"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-brand-900 truncate">
                    {album.name}
                  </h3>
                  <p className="text-xs text-brand-400 mt-0.5">{album.category.name}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
