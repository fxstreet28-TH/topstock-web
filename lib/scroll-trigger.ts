'use client';

import { gsap } from '@/lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * ScrollTrigger, registered exactly once.
 *
 * Registration has to happen on the client before any scroll-linked timeline is
 * built, and doing it here — rather than in each component — removes the
 * ordering hazard of building a timeline before `registerPlugin` has run.
 *
 * Import this module only from components that pin, scrub or parallax. Simple
 * "animate when it appears" cases should use an IntersectionObserver instead;
 * it is already in the browser and costs nothing to ship.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
