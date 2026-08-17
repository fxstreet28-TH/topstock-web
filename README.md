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
cp .env.example .env.local   # only the four LINE/contact vars are required
npm run dev
```

**Deploying the MVP needs four environment variables** — `NEXT_PUBLIC_LINE_ID`,
`NEXT_PUBLIC_LINE_QR_URL`, `NEXT_PUBLIC_TELEGRAM_URL`, and
`NEXT_PUBLIC_SUPPORT_EMAIL`. Supabase and Resend are optional and only gate
the `/trial` form. See `.env.example`, which is split along that line.

- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Routing & i18n

Thai is the primary market and the default locale. Locale prefixes are
`as-needed`: Thai lives on clean paths (`/pricing`) and English is namespaced
(`/en/pricing`). Routing is declared once in `lib/routing.ts`;
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
- [x] **Phase 2 — Landing page:** hero → problem → solution → mechanism → try-before-buy → backtest → brokers → pricing → FAQ → final CTA
- [x] **Phase 3 — Supporting pages** + LINE-direct CTAs
- [ ] **Phase 4 — Commerce** (manual payment page, license activation) — only when volume warrants
- [ ] **Phase 5 — Polish** (Thai copy pass, OG images, sitemap, analytics, a11y audit)
- [ ] **Phase 6 — Deploy**

## Commercial model

One product, one price: **฿4,900 THB, one-time, lifetime access**. There are no
tiers and no subscription — `lib/site.ts` → `pricing` is the only place the
figure is defined.

This is a **marketing-only site**. It has no checkout, no accounts, and needs
no backend to go live. Its whole job is to explain the product well enough
that the visitor opens LINE:

```
read the site  →  message us on LINE  →  consult  →  manual payment  →  license
```

Everything after the first arrow happens in LINE, by hand. Every primary CTA
on every page opens the LINE add-friend URL in a new tab, rendered through the
single `LineCta` component so they cannot drift apart.

`/trial` is a **secondary path** for visitors who would rather not open LINE.
It is fully built and works when the optional backend env vars are set; with
them unset it returns a clear "message us on LINE instead" response. Nothing
else on the site depends on it.

## Typography note (Thai)

Thai is written without spaces between words, so per-glyph `letter-spacing`
destroys the word boundaries readers rely on. Tracked labels therefore use the
`.track-label` class rather than a raw `tracking-*` utility — the tracking is
zeroed under `html[lang='th']`. Headings and body copy also get looser leading
in Thai to clear the stacked vowel and tone marks. Keep using `.track-label`
for any new small-caps label.

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
- Real backtest data (Strategy Tester export) — the backtest section currently
  ships a deliberate empty state and publishes no figures at all
- EA panel screenshots
- Real LINE official account ID — `lib/site.ts` currently holds a placeholder
- Trial length and trial-delivery mechanics
- Registered company name, address and jurisdiction for the legal pages
- Registered payment details for the manual-payment step (bank / PromptPay)
