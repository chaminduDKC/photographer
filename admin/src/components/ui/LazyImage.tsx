import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  objectFit?: 'cover' | 'contain';
}

export function LazyImage({ src, alt, className, skeletonClassName, objectFit = 'cover' }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setInView(true);
    }
  }, []);

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', skeletonClassName)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      )}
      <img
        ref={imgRef}
        src={inView ? src : undefined}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' ? 'object-cover' : 'object-contain',
          className
        )}
      />
    </div>
  );
}
