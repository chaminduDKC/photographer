'use client';

import { useQuery } from '@tanstack/react-query';
import { getSliderImages } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { FALLBACK_SLIDER_IMAGES } from '@/lib/fallbacks';
import LazyImage from '@/components/LazyImage';

export default function ImageSlider() {
  const { data: sliderImages } = useQuery({
    queryKey: queryKeys.slider.images,
    queryFn: getSliderImages,
  });

  const images = sliderImages && sliderImages.length >= 5 ? sliderImages : FALLBACK_SLIDER_IMAGES;

  // Duplicate images for seamless infinite scroll
  const displayImages = [...images, ...images];

  return (
    <section className="py-12 max-w-7xl mx-auto rounded overflow-hidden">
      <div
        className="flex gap-4 animate-marquee"
        style={{
          width: 'max-content',
          // Speed scales with number of images
          ['--marquee-duration' as string]: `${images.length * 4}s`,
        }}
      >
        {displayImages.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
            className="flex-shrink-0 w-[280px] sm:w-[360px] md:w-[420px] h-[300px] sm:h-[350px] md:h-[300px] rounded-sm overflow-hidden"
          >
            <LazyImage
              src={img.url}
              alt={`Portfolio showcase ${(i % images.length) + 1}`}
              fill
              containerClassName="w-full h-full relative"
              className="hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
