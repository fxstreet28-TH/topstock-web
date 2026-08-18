'use client';

import { renderScale } from '@/lib/motion';

export interface CanvasSurface {
  ctx: CanvasRenderingContext2D;
  /** CSS pixels, not device pixels — all drawing is done in CSS px. */
  width: number;
  height: number;
  dpr: number;
}

/**
 * Size a canvas to its parent at the device pixel ratio and scale the context
 * so callers can keep working in CSS pixels.
 *
 * Returns false when the parent has no box yet (a common first-paint state
 * inside a section that has not laid out), so callers can bail rather than
 * seed a field into a zero-sized world.
 */
export function fitToParent(canvas: HTMLCanvasElement, surface: CanvasSurface): boolean {
  const parent = canvas.parentElement;
  if (!parent) return false;

  const width = parent.clientWidth;
  const height = parent.clientHeight;
  if (width === 0 || height === 0) return false;

  surface.width = width;
  surface.height = height;
  canvas.width = Math.floor(width * surface.dpr);
  canvas.height = Math.floor(height * surface.dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  surface.ctx.setTransform(surface.dpr, 0, 0, surface.dpr, 0, 0);
  return true;
}

/** Acquire a 2D context and the DPR the layers should render at. */
export function acquire(canvas: HTMLCanvasElement): CanvasSurface | null {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;
  return { ctx, width: 0, height: 0, dpr: renderScale() };
}

/** Pick an index from cumulative-weighted buckets. Weights must sum to 1. */
export function pickWeighted(weights: readonly number[]): number {
  let roll = Math.random();
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i]!;
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

const SPRITE_SIZE = 32;

/**
 * A soft radial dot, rasterised once and blitted thereafter.
 *
 * `drawImage` of a cached sprite beats `arc()` + `fill()` per particle by a
 * wide margin at a few hundred particles, and the gradient gives every dot a
 * glow that would otherwise cost a shadow blur.
 */
export function makeDotSprite(color: string, dpr: number): CanvasImageSource | null {
  const size = SPRITE_SIZE * dpr;
  const canvas: HTMLCanvasElement | OffscreenCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(size, size)
      : Object.assign(document.createElement('canvas'), { width: size, height: size });
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return null;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.38, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();
  return canvas as CanvasImageSource;
}

/** Mix two `#rrggbb` colours. `t` runs 0 (from) to 1 (to). */
export function mixHex(from: string, to: string, t: number): string {
  const parse = (hex: string) => {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const [r1, g1, b1] = parse(from) as [number, number, number];
  const [r2, g2, b2] = parse(to) as [number, number, number];
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}
