/**
 * 2D simplex noise — a self-contained adaptation of Stefan Gustavson's
 * public-domain reference implementation.
 *
 * The particle field uses it to steer drift direction. Straight-line velocity
 * reads as a screensaver; noise-steered velocity reads as air. It is ~1KB of
 * source and has no dependencies, which is the whole reason it is inlined here
 * rather than pulled from npm.
 *
 * Seeded so a reload produces the same field — deterministic output keeps
 * visual review meaningful across screenshots.
 */

const GRAD_2D = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/** Mulberry32 — small, fast, good enough to shuffle a permutation table. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createNoise2D(seed = 1337) {
  const random = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) p[i] = i;
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = p[i]!;
    p[i] = p[j]!;
    p[j] = tmp;
  }
  // Doubled so lookups never need a modulo.
  const perm = new Uint8Array(512);
  const permMod8 = new Uint8Array(512);
  for (let i = 0; i < 512; i += 1) {
    perm[i] = p[i & 255]!;
    permMod8[i] = perm[i]! % 8;
  }

  return function noise2D(xin: number, yin: number): number {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);

    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      const g = GRAD_2D[permMod8[ii + perm[jj]!]!]!;
      t0 *= t0;
      n += t0 * t0 * (g[0] * x0 + g[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const g = GRAD_2D[permMod8[ii + i1 + perm[jj + j1]!]!]!;
      t1 *= t1;
      n += t1 * t1 * (g[0] * x1 + g[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const g = GRAD_2D[permMod8[ii + 1 + perm[jj + 1]!]!]!;
      t2 *= t2;
      n += t2 * t2 * (g[0] * x2 + g[1] * y2);
    }

    // Scaled to roughly -1..1.
    return 70 * n;
  };
}
