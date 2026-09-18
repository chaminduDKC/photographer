'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import LazyImage from '@/components/LazyImage';
import ScrollReveal from '@/components/ScrollReveal';

export default function CategoriesSection() {
  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <section id="categories" className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-brand-900 text-center mb-10">
            Our Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] skeleton rounded-sm" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section id="categories" className="py-10 sm:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-2">
            Explore
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-brand-900">
            Our Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <ScrollReveal key={cat.id}>
              <Link
                href={`/category/${cat.slug}`}
                prefetch={true}
                className="group block relative aspect-[4/5] rounded-md overflow-hidden"
              >
                <LazyImage
                  src={cat.thumbnailUrl}
                  alt={cat.name}
                  fill
                  containerClassName="w-full h-full relative"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Label */}
              <div className="absolute bottom-0 top-0 left-0 right-0 p-5 flex flex-col justify-end text-center ">
                <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                <p className="text-sm text-white/70 mt-0.5">
                  {cat._count.albums} {cat._count.albums === 1 ? 'album' : 'albums'}
                </p>
              </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
