import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        brand: {
          gold: '#D4A017',
          'gold-light': '#F5C518',
          'gold-dark': '#A67C0F',
        },
        /*
         * Section accents. Each act of the page owns one; see lib/palette.ts,
         * which is the source of truth these values mirror for the canvas layer.
         *
         * Contrast against the near-black surfaces, smallest first:
         *   violet 4.96:1 · green 9.1:1 · amber 7.4:1 · cyan 13.6:1
         * `violet` is the only one close to the 4.5:1 floor, so `violet-light`
         * exists for anything below 18px.
         */
        aurum: {
          cyan: '#00E5FF',
          'cyan-soft': '#7DF0FF',
          violet: '#8B5CF6',
          'violet-light': '#A78BFA',
          amber: '#FF6B35',
          'amber-light': '#FF9166',
          green: '#22C55E',
          'green-light': '#5EE68F',
          deep: '#050505',
          void: '#000000',
        },
        surface: {
          DEFAULT: '#0A0A0A',
          elevated: '#141414',
          overlay: '#1F1F1F',
          border: '#262626',
        },
        ink: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
          // #737373 failed WCAG AA on both surfaces (4.18 / 3.89).
          // #8A8A8A clears 4.5:1 on #0A0A0A and #141414 (5.73 / 5.34).
          tertiary: '#8A8A8A',
        },
        // Semantic tokens consumed by the shadcn-style primitives.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        // --font-thai carries Thai glyph coverage that Inter/Manrope lack.
        display: ['var(--font-display)', 'var(--font-thai)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'var(--font-thai)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-thai)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        /*
         * Cinematic scale. `display-cinema` and `display-section` are the
         * poster-sized steps introduced by the cinematic pass; the `display-*`
         * steps below them are unchanged and still carry the inner pages.
         *
         * The lower clamp bounds are deliberately below the brief's 4rem / 3rem:
         * at 360px the viewport-relative term has not taken over yet, and Thai
         * — which stacks vowel and tone marks — needs the extra room. The upper
         * bounds are the brief's, so wide screens get the full 176px.
         *
         * Manrope tops out at 800; `font-extrabold` is the heaviest real weight
         * and is used instead of a synthesised 900.
         */
        'display-cinema': [
          'clamp(3.25rem, 12vw, 11rem)',
          { lineHeight: '0.88', letterSpacing: '-0.04em' },
        ],
        'display-section': [
          'clamp(2.5rem, 8vw, 7.5rem)',
          { lineHeight: '0.95', letterSpacing: '-0.03em' },
        ],
        // The light counterweight under a heavy title.
        'display-declaration': [
          'clamp(1.25rem, 3vw, 2.75rem)',
          { lineHeight: '1.3', letterSpacing: '-0.01em' },
        ],
        // Hero only. Scales 48px → 104px, i.e. roughly text-6xl on mobile up
        // to a shade past text-8xl on wide screens.
        'display-hero': ['clamp(2.75rem, 7vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
        'display-xl': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.03', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.875rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.025em' }],
        'display-sm': ['clamp(1.5rem, 2.2vw, 1.875rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        'glow-gold': '0 0 0 1px rgba(212, 160, 23, 0.25), 0 12px 40px -12px rgba(212, 160, 23, 0.45)',
        // Tone-aware glow: reads --tone-rgb from the enclosing SectionShell.
        'glow-tone':
          '0 0 0 1px rgba(var(--tone-rgb, 212 160 23), 0.25), 0 16px 50px -14px rgba(var(--tone-rgb, 212 160 23), 0.5)',
        elevated: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg, #F5C518 0%, #D4A017 45%, #A67C0F 100%)',
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Scroll hint at the foot of the hero.
        'pulse-down': {
          '0%, 100%': { opacity: '0.35', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-down': 'pulse-down 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
