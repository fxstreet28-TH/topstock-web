'use client';

import { gsap } from 'gsap';

/**
 * GSAP core, configured once.
 *
 * Deliberately does *not* pull in ScrollTrigger. Core is ~23KB gzipped and is
 * enough for entrances, counters and hover timelines; ScrollTrigger adds ~11KB
 * and only the sections that pin or parallax should pay for it. Import it from
 * `lib/scroll-trigger` where it is genuinely needed.
 */
if (typeof window !== 'undefined') {
  // Defaults set once so section timelines stay terse and consistent.
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });
}

export { gsap };

/**
 * House easing, the GSAP counterpart of the cubic-bezier(0.22, 1, 0.36, 1) used
 * by the CSS transitions in globals.css: a firm start that settles without
 * overshoot.
 */
export const CINEMA_EASE = 'expo.out';
