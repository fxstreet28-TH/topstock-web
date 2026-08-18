/**
 * Shared motion capability checks.
 *
 * Every cinematic layer on this site is opt-in per device rather than
 * opt-out: the baseline render (gradients, static type, plain text) is the
 * product, and motion is added on top only where the device can carry it.
 * Centralising the checks keeps that contract consistent — and keeps a single
 * place to look when a section misbehaves on a given device class.
 *
 * All helpers are browser-only. Guard calls with a mount effect.
 */

/** The user asked for less motion. Everything decorative must stop. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A real mouse — not a touch screen, not a TV remote. */
export function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Phone-sized. Particle counts drop and bursts switch off below this. */
export function isCompactViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
}

/**
 * Low-end hardware. `hardwareConcurrency` is a coarse proxy, but it is the only
 * signal available without a benchmark, and it reliably separates a modern
 * laptop from a budget tablet. Unknown values are treated as capable so we do
 * not punish browsers that withhold the field for fingerprinting reasons.
 */
export function hasSpareCores(min = 4): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator.hardwareConcurrency ?? 8) >= min;
}

/**
 * Should a decorative canvas run at all?
 *
 * Unlike the previous hero-only field this does not require a desktop: the
 * cinematic pass wants a (thinner) particle layer on phones too. What it still
 * refuses is reduced-motion and genuinely weak hardware.
 */
export function canRunCanvasEffects(): boolean {
  return !prefersReducedMotion() && hasSpareCores(4);
}

/** Cap the device pixel ratio: past 2x the fill cost doubles for no visible gain. */
export function renderScale(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Scale a particle budget to the device. Phones take a 60% cut, as the brief
 * specifies; mid-range machines take a smaller one.
 */
export function scaleCount(count: number): number {
  if (isCompactViewport()) return Math.round(count * 0.4);
  if (!hasSpareCores(8)) return Math.round(count * 0.7);
  return count;
}
