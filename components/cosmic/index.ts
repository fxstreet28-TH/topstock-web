/**
 * The six cosmic layers, in depth order.
 *
 *   1 Starfield        page-level, fixed behind everything
 *   2 NebulaClouds     per act, CSS-composited
 *   3 OrbitalCluster   per act, desktop only
 *   4 CursorTrail      page-level, desktop only
 *   5 SectionBurst     per act, one-shot
 *   6 Constellation    per figure, SVG
 *
 * `CosmicSection` composes 2, 3 and 5 for one act of the homepage.
 */
export { Starfield } from '@/components/cosmic/starfield';
export { NebulaClouds } from '@/components/cosmic/nebula-clouds';
export { OrbitalCluster } from '@/components/cosmic/orbital-cluster';
export { CursorTrail } from '@/components/cosmic/cursor-trail';
export { SectionBurst } from '@/components/cosmic/section-burst';
export { Constellation } from '@/components/cosmic/constellation';
export { CosmicSection } from '@/components/cosmic/cosmic-section';
