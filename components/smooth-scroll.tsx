'use client';

import { useEffect } from 'react';

import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';
import { onTick } from '@/lib/ticker';

/**
 * Lenis smooth scroll — desktop pointers only.
 *
 * The parallax and scrub effects on the homepage are sampled once per frame;
 * a mouse wheel delivers scroll in coarse jumps, so those effects arrive in
 * steps unless something interpolates between them. Lenis is that something.
 *
 * Deliberately not enabled on touch. Phone and trackpad scrolling is already
 * inertial and native, and overriding it costs the platform's rubber-banding,
 * its address-bar behaviour and its fling physics to gain nothing. Reduced
 * motion switches it off outright: hijacked scrolling is exactly the kind of
 * motion that setting is asking us not to do.
 *
 * Renders nothing. Mounted by the homepage rather than the layout, so no other
 * page pays for the import.
 */

export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void Promise.all([import('lenis'), import('@/lib/scroll-trigger')]).then(
      ([{ default: Lenis }, { ScrollTrigger }]) => {
        if (cancelled) return;

        const lenis = new Lenis({
          // 0.1 is a long, cinematic settle. Higher reads as lag on a wheel.
          lerp: 0.1,
          smoothWheel: true,
          // The library's own rAF would be a second loop; lib/ticker already
          // owns the one every canvas layer shares.
          autoRaf: false,
        });

        // ScrollTrigger samples window.scrollY, which Lenis writes to — but it
        // writes it from rAF, so ScrollTrigger has to be told to re-read.
        lenis.on('scroll', ScrollTrigger.update);

        const unsubscribe = onTick(() => lenis.raf(performance.now()));

        dispose = () => {
          unsubscribe();
          lenis.off('scroll', ScrollTrigger.update);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return null;
}
