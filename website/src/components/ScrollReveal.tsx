'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Viewport-based scroll reveal animation.
 * Uses native CSS scroll-driven animations where supported,
 * falls back to IntersectionObserver for older browsers.
 * Only animates transform: scale() (compositor-only, no jank).
 */
export default function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If native CSS scroll-driven animations are supported, the CSS class handles it
    if (CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      return;
    }

    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.transform = 'scale(1)';
      return;
    }

    // Fallback: IntersectionObserver
    el.style.transform = 'scale(0)';
    el.style.transition = 'transform 1s ease-out';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const ratio = entry.intersectionRatio;
          const scale =  ratio; 
          target.style.transform = `scale(${scale})`;
        }
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('scroll-reveal', className)}>
      {children}
    </div>
  );
}