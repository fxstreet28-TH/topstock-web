/**
 * Section palette — the single source of truth for the cinematic colour system.
 *
 * The site used to be mono-gold. The cinematic pass gives each section its own
 * accent so scrolling reads as moving through acts rather than down one page:
 *
 *   gold   → hero, brand introduction (warm, familiar)
 *   amber  → problem / final CTA (tension, then warmth)
 *   cyan   → mechanism and features (technical, precise)
 *   green  → backtest data (performance)
 *   violet → pricing (premium)
 *
 * Both the canvas particle layer and the CSS layer read from here, so a tone is
 * changed in exactly one place. Components receive a `tone` name; `SectionShell`
 * publishes the resolved values as the `--tone*` custom properties so Tailwind
 * arbitrary values (`text-[color:var(--tone)]`) stay in sync with the canvas.
 */

export type SectionTone = 'gold' | 'cyan' | 'violet' | 'amber' | 'green' | 'ink';

export interface TonePalette {
  /** Headline accent. Contrast on the near-black surfaces is >= 4.5:1. */
  hex: string;
  /** A lighter step, for small text where `hex` sits close to the AA floor. */
  soft: string;
  /** `r, g, b` — for rgba() glows in inline styles and custom properties. */
  rgb: string;
  /**
   * Particle colours, sampled per particle. Two entries give the field depth
   * without the cost of a per-particle gradient.
   */
  particles: readonly [string, string];
}

export const TONES: Record<SectionTone, TonePalette> = {
  gold: {
    hex: '#D4A017',
    soft: '#F5C518',
    rgb: '212, 160, 23',
    particles: ['#D4A017', '#F5C518'],
  },
  cyan: {
    hex: '#00E5FF',
    soft: '#7DF0FF',
    rgb: '0, 229, 255',
    particles: ['#00E5FF', '#D4A017'],
  },
  violet: {
    // 4.96:1 on #050505 — passes AA for body text, but `soft` is the safer
    // choice anywhere under 18px.
    hex: '#8B5CF6',
    soft: '#A78BFA',
    rgb: '139, 92, 246',
    particles: ['#8B5CF6', '#C4B5FD'],
  },
  amber: {
    hex: '#FF6B35',
    soft: '#FF9166',
    rgb: '255, 107, 53',
    particles: ['#FF6B35', '#F5C518'],
  },
  green: {
    hex: '#22C55E',
    soft: '#5EE68F',
    rgb: '34, 197, 94',
    particles: ['#22C55E', '#00E5FF'],
  },
  ink: {
    hex: '#F5F5F5',
    soft: '#FFFFFF',
    rgb: '245, 245, 245',
    particles: ['#F5F5F5', '#A3A3A3'],
  },
};

export function toneOf(tone: SectionTone): TonePalette {
  return TONES[tone] ?? TONES.gold;
}

/** Background steps. `void` is used for the acts, `deep` for the interstitials. */
export const SURFACES = {
  void: '#000000',
  deep: '#050505',
  base: '#0A0A0A',
} as const;

export type SurfaceName = keyof typeof SURFACES;
