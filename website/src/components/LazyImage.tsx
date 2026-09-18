'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  onClick?: () => void;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  fill = false,
  sizes,
  quality = 90,
  onClick,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          'bg-brand-100 flex items-center justify-center text-brand-400',
          containerClassName
        )}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', containerClassName)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 skeleton rounded-lg" />
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : (width || 1200)}
        height={fill ? undefined : (height || 900)}
        fill={fill}
        quality={quality}
        sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className={cn(
          'transition-opacity duration-500 object-cover',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
