'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Fade-and-lift a block as it scrolls into view.
 *
 * IntersectionObserver plus a CSS transition rather than an animation library:
 * this is under a kilobyte against ~50KB gzipped for the same two properties,
 * and the JS budget for this page is a hard limit.
 *
 * `delay` staggers siblings — pass index * 80 or so.
 *
 * Reduced motion is honoured by revealing immediately, and a <noscript> rule
 * in globals.css keeps the content visible when scripting is unavailable.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'section';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // Fire a little before the block is fully on screen.
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // The union of element types makes a shared ref awkward to type; the
      // runtime value is always the rendered element.
      ref={ref as never}
      className={cn('reveal', shown && 'reveal-in', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
