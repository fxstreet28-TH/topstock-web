'use client';

import { useEffect, useRef, useState } from 'react';

import { acquire, makeDotSprite } from '@/lib/canvas';
import { hasFinePointer, prefersReducedMotion, renderScale } from '@/lib/motion';
import { COSMOS } from '@/lib/palette';
import { onTick } from '@/lib/ticker';

/**
 * Layer 4 — the cursor trail.
 *
 * Gold sparks shed from the pointer as it moves, denser while it is over a
 * call to action. Desktop pointers only: this is the layer with the least
 * reason to exist on a touch screen, where there is no pointer to trail.
 *
 * Companion to `components/cursor.tsx`, not a replacement — that one owns the
 * dot, the ring and the magnetism, and this one only paints. They are separate
 * because the cursor is on every page and this is not: the homepage is the
 * only place that wants sparks.
 *
 * The trail is capped at 20 live sparks (40 over a CTA) and the render loop
 * unsubscribes itself the moment the last one dies, so a still pointer costs
 * nothing at all.
 */

interface CursorTrailProps {
  /** Live sparks allowed at rest, and while over a CTA. */
  cap?: number;
  ctaCap?: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  c: 0 | 1;
}

const CTA_SELECTOR = 'a, button, [role="button"], [data-magnetic]';
/** Minimum pointer travel between emissions, in px. */
const EMIT_DISTANCE = 7;
const LIFE_MS = 800;

export function CursorTrail({ cap = 20, ctaCap = 40 }: CursorTrailProps) {
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Decided on the client: matchMedia is not available during render, and
  // painting the canvas on the server would put it on touch devices too.
  useEffect(() => {
    setEnabled(hasFinePointer() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;

    const surface = acquire(canvas);
    if (!surface) return;
    const { ctx } = surface;
    const dpr = renderScale();

    const sprites = [
      makeDotSprite(COSMOS.solar, dpr),
      makeDotSprite('#D4A017', dpr),
    ] as const;

    const sparks: Spark[] = [];
    let lastX = -9999;
    let lastY = -9999;
    let overCta = false;
    let unsubscribe: (() => void) | null = null;

    function resize() {
      surface!.width = window.innerWidth;
      surface!.height = window.innerHeight;
      canvas!.width = Math.floor(surface!.width * dpr);
      canvas!.height = Math.floor(surface!.height * dpr);
      canvas!.style.width = `${surface!.width}px`;
      canvas!.style.height = `${surface!.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(delta: number) {
      ctx.clearRect(0, 0, surface!.width, surface!.height);
      ctx.globalCompositeOperation = 'lighter';

      const step = delta / 16.7;
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i]!;
        s.life += delta;
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.vy -= 0.02 * step; // sparks rise as they cool
        s.x += s.vx * step;
        s.y += s.vy * step;

        const sprite = sprites[s.c];
        if (!sprite) continue;
        const progress = s.life / s.maxLife;
        const size = s.size * (1 - progress * 0.5) * 7;
        ctx.globalAlpha = (1 - progress) ** 1.6;
        ctx.drawImage(sprite, s.x - size / 2, s.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Nothing left to draw — stop asking for frames until the pointer moves.
      if (sparks.length === 0) halt();
    }

    function run() {
      if (!unsubscribe) unsubscribe = onTick(draw);
    }

    function halt() {
      unsubscribe?.();
      unsubscribe = null;
      ctx.clearRect(0, 0, surface!.width, surface!.height);
    }

    function emit(x: number, y: number, n: number) {
      const limit = overCta ? ctaCap : cap;
      for (let i = 0; i < n && sparks.length < limit; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 0.9 + 0.15;
        sparks.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          size: Math.random() * 0.9 + 0.35,
          life: 0,
          maxLife: LIFE_MS * (0.6 + Math.random() * 0.5),
          c: Math.random() > 0.55 ? 1 : 0,
        });
      }
      run();
    }

    function onPointerMove(event: PointerEvent) {
      // A hover-capable device can still deliver touch events; those should
      // not paint a trail.
      if (event.pointerType === 'touch') return;

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (dx * dx + dy * dy < EMIT_DISTANCE * EMIT_DISTANCE) return;
      lastX = event.clientX;
      lastY = event.clientY;
      emit(event.clientX, event.clientY, overCta ? 3 : 1);
    }

    function onPointerOver(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      overCta = Boolean(target?.closest?.(CTA_SELECTOR));
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });

    return () => {
      halt();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
    };
  }, [enabled, cap, ctaCap]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      aria-hidden="true"
    />
  );
}
