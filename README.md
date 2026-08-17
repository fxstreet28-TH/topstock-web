# topstock-web

Sales site for **Topstock EA** — a MetaTrader 5 Expert Advisor for NASDAQ 100 (NAS100) and US 30 (DJ30), by AURUM TECH.

Target domain: `topstock.aurumtech.co`

## Stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 15 (App Router), React 19               |
| Language   | TypeScript, `strict` + `noUncheckedIndexedAccess` |
| Styling    | Tailwind CSS 3.4, shadcn/ui-style primitives on Radix |
| i18n       | next-intl 4 (`en` default, `th`)                |
| Icons      | lucide-react                                    |
| Motion     | framer-motion                                   |
| Charts     | Recharts                                        |
| Deployment | Vercel                                          |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in as services are provisioned
npm run dev
```

- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Routing & i18n

Locale prefixes are `as-needed`: English lives on clean paths (`/pricing`) and Thai
is namespaced (`/th/pricing`). Routing is declared once in `lib/routing.ts`;
always import `Link` / `useRouter` / `usePathname` from `lib/navigation.ts` so
locale prefixes are handled automatically.

All copy lives in `messages/en.json` and `messages/th.json` — no strings in components.

## Design system

Tokens are defined in `tailwind.config.ts` and `app/globals.css`.

- `brand.gold` `#D4A017` (primary), `brand.gold-light` `#F5C518`, `brand.gold-dark` `#A67C0F`
- `surface` `#0A0A0A` / `surface.elevated` `#141414` / `surface.overlay` `#1F1F1F`
- `ink.primary` `#F5F5F5` / `ink.secondary` `#A3A3A3` / `ink.tertiary` `#737373`
- Fonts: Manrope (display), Inter (body), JetBrains Mono (numerics/labels), Noto Sans Thai (Thai coverage)

Dark mode is the default and currently the only theme — `.dark` is applied on `<html>`.
The light palette is already defined in `globals.css` so a toggle can be added later
without a re-theme.

## Build order

- [x] **Phase 1 — Foundation:** scaffold, design tokens, i18n, nav/footer/language toggle
- [ ] **Phase 2 — Landing page**
- [ ] **Phase 3 — Supporting pages**
- [ ] **Phase 4 — Commerce** (Stripe, Supabase, Resend, license activation)
- [ ] **Phase 5 — Polish** (Thai copy pass, OG images, sitemap, analytics, a11y audit)
- [ ] **Phase 6 — Deploy**

## Content rules

Two areas are **not** to be edited without sign-off:

1. **Strategy mechanics** (entry counts, point thresholds, grid counts, exit maths).
   These come from the EA source. Paraphrasing them risks describing a product
   that does not exist.
2. **Risk disclaimer wording** (`messages/*.json` → `legal.riskWarning`).
   Legal-sensitive; the Thai rendering is a translation of the approved English
   and should be reviewed by a Thai-speaking reviewer before launch.

The site also deliberately contains no testimonials, no fabricated performance
figures, no countdown timers, and no guarantee language.

## Pending inputs

These are stubbed and need real values before launch:

- AURUM TECH logo (SVG) and a Topstock wordmark — currently a generated mark in `components/logo.tsx`
- Real backtest data (Strategy Tester export) — metrics are placeholders
- EA panel screenshots
- Confirmed pricing ($49 / $249 / $799 assumed — `lib/site.ts`)
- Support handles: Telegram username, Discord invite (`lib/site.ts`)
- Registered company name, address and jurisdiction for the legal pages
- Stripe price IDs
