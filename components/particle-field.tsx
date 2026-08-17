'use client';

import { useEffect, useRef } from 'react';

/**
 * Hero backdrop: a drifting field of gold particles on a 2D canvas.
 *
 * Vanilla canvas rather than three.js — this is a few hundred bytes of logic
 * against ~150KB gzipped for a WebGL runtime, for an effect that is two dozen
 * moving dots.
 *
 * It refuses to run at all unless the device can afford it:
 *   · viewport >= 1024px (never on mobile)
 *   · a fine pointer, so it does not run on large touch screens
 *   · prefers-reduced-motion not set
 *   · at least 4 logical cores, which excludes low-end hardware without
 *     ruling out the ordinary 4-core laptop
 *
 * When it does not run, nothing renders and the hero keeps the static gradient
 * and grid underneath. The canvas is decorative, absolutely positioned, and
 * never affects layout, so it cannot move LCP or contribute to CLS.
 */

const PARTICLE_COUNT = 46;
const DRIFT = 0.06; // px per frame at 60fps — deliberately slow
const MOUSE_PULL = 0.012; // how strongly particles lean toward the cursor

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const affordable =
      window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      (navigator.hardwareConcurrency ?? 8) >= 4;

    if (!affordable) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    const particles: Particle[] = [];
    // Cursor target and its eased follower, both normalised to -1..1.
    const pointer = { x: 0, y: 0, ex: 0, ey: 0 };

    // Cap DPR at 2: beyond that the pixel cost doubles for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * DRIFT,
          vy: -Math.random() * DRIFT - DRIFT * 0.4, // a gentle upward bias
          r: Math.random() * 1.6 + 0.5,
          alpha: Math.random() * 0.4 + 0.12,
        });
      }
    }

    function draw() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);

      // Ease the pointer so motion feels weighted rather than twitchy.
      pointer.ex += (pointer.x - pointer.ex) * 0.05;
      pointer.ey += (pointer.y - pointer.ey) * 0.05;

      for (const p of particles) {
        p.x += p.vx + pointer.ex * MOUSE_PULL * (p.r * 2);
        p.y += p.vy + pointer.ey * MOUSE_PULL * (p.r * 2);

        // Wrap rather than respawn, so density stays constant.
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(212, 160, 23, ${p.alpha})`;
        ctx!.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    }

    function start() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    seed();
    canvas.style.opacity = '1';
    frame = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      seed();
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    // Stop burning frames once the hero has scrolled away.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      // Starts transparent and is revealed only once the effect actually
      // runs, so devices that skip it never show an empty canvas flash.
      style={{ opacity: 0, transition: 'opacity 1.2s ease-out' }}
      aria-hidden="true"
    />
  );
}
