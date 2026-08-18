/**
 * Constellation figures for the strategy pillars.
 *
 * Plain data, in `lib/` rather than beside the component, because the
 * component is a client module: a Server Component that imports a value from
 * a `'use client'` file gets a client reference proxy, not the object, so
 * `Object.keys(CONSTELLATIONS)` there comes back empty. Data that both sides
 * read has to live in a module neither directive touches.
 *
 * Hand-placed rather than generated — a random point set reads as noise, and
 * these are meant to look like something the eye could have named.
 */

export interface ConstellationShape {
  /** Star positions as fractions of the box, `[x, y]`, origin top-left. */
  points: readonly (readonly [number, number])[];
  /** Connections, as index pairs into `points`. */
  edges: readonly (readonly [number, number])[];
}

export const CONSTELLATIONS = {
  /** ENTRY — a five-point batch converging on a zone. */
  entry: {
    points: [
      [0.12, 0.24],
      [0.34, 0.12],
      [0.5, 0.38],
      [0.72, 0.2],
      [0.88, 0.46],
      [0.56, 0.78],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  /** HEDGE — a shield outline with an orbit across it. */
  hedge: {
    points: [
      [0.2, 0.18],
      [0.8, 0.18],
      [0.86, 0.54],
      [0.5, 0.9],
      [0.14, 0.54],
      [0.5, 0.46],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [5, 0],
      [5, 2],
    ],
  },
  /** EXIT — two arms converging on a single close. */
  exit: {
    points: [
      [0.1, 0.14],
      [0.36, 0.42],
      [0.62, 0.58],
      [0.9, 0.86],
      [0.86, 0.16],
      [0.5, 0.5],
    ],
    edges: [
      [0, 1],
      [1, 5],
      [5, 2],
      [2, 3],
      [4, 5],
    ],
  },
  /** SCALE — six independent nodes on a ring. */
  scale: {
    points: [
      [0.5, 0.08],
      [0.86, 0.29],
      [0.86, 0.71],
      [0.5, 0.92],
      [0.14, 0.71],
      [0.14, 0.29],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
  },
} as const satisfies Record<string, ConstellationShape>;

export type ConstellationName = keyof typeof CONSTELLATIONS;
