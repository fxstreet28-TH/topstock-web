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
  /*
   * Cosmic steps, added by the homepage redesign. They carry a violet
   * undertone the original three do not, so they are new keys rather than a
   * redefinition — the inner pages keep the neutral blacks they were tuned on.
   */
  cosmos: '#050510',
  nebula: '#0A0A20',
  space: '#0D0D2A',
} as const;

export type SurfaceName = keyof typeof SURFACES;

/* -------------------------------------------------------------------------
 * Cosmic layer — the homepage redesign.
 *
 * The tones above still drive the inner pages. The homepage is a darker,
 * deeper world: near-black surfaces with a violet undertone, lit by three
 * accents (plasma violet, ion cyan, solar gold) rather than one per act.
 * ---------------------------------------------------------------------- */

export const COSMOS = {
  /** Pure black. The deepest background step; hero and pricing sit on it. */
  void: '#000000',
  /** Near-void with a violet hint. The default homepage surface. */
  deep: '#050510',
  /** Deep purple undertone. */
  nebula: '#0A0A20',
  /** Slightly lit space. */
  space: '#0D0D2A',
  /** Faint blue-white — starlight, not paper white. */
  starlight: '#E8E8FF',
  /** Violet accent. 4.9:1 on `deep`; use `plasmaLight` under 18px. */
  plasma: '#8B5CF6',
  plasmaLight: '#A78BFA',
  /** Electric cyan. 13.4:1 on `deep`. */
  ion: '#00E5FF',
  /** Gray-blue, for the dimmest particles. */
  dust: '#4A5568',
  /** Solar flare gold — the bright end of the Aurum brand. */
  solar: '#F5C518',
} as const;

/**
 * Starfield colour mix, as cumulative weights.
 *
 * Real starfields are overwhelmingly white; the coloured minority is what
 * makes the eye read depth rather than noise. 80 / 15 / 5, per the brief.
 */
export const STAR_COLORS = [
  { color: '255, 255, 255', alpha: 0.6, weight: 0.8 },
  { color: '0, 229, 255', alpha: 0.5, weight: 0.15 },
  { color: '212, 160, 23', alpha: 0.7, weight: 0.05 },
] as const;

/**
 * Which accents each homepage act is lit by.
 *
 * Read by the nebula and orbital layers so a section's colour story is
 * declared once, here, instead of at every call site.
 */
export const ACT_PALETTES = {
  hero: { surface: 'void', clouds: [COSMOS.plasma, COSMOS.solar, COSMOS.ion] },
  trial: { surface: 'cosmos', clouds: [COSMOS.plasma, '#6D28D9', COSMOS.ion] },
  consult: { surface: 'nebula', clouds: [COSMOS.ion, COSMOS.plasma, '#0EA5E9'] },
  pillars: { surface: 'space', clouds: [COSMOS.solar, COSMOS.plasma, '#D4A017'] },
  proof: { surface: 'cosmos', clouds: [COSMOS.solar, COSMOS.ion, COSMOS.plasma] },
  pricing: { surface: 'void', clouds: [COSMOS.plasma, '#4C1D95', COSMOS.ion] },
  close: { surface: 'nebula', clouds: [COSMOS.solar, '#D4A017', COSMOS.plasma] },
} as const;

export type ActName = keyof typeof ACT_PALETTES;

/** The constellation figures are always drawn in gold, whatever the act. */
export const CONSTELLATION_TONE = '#D4A017';
