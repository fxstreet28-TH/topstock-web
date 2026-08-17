/**
 * Pre-renders the Open Graph cards to assets/og/*.png.
 *
 * Why not next/og: Satori does not apply GPOS mark-to-mark positioning, so
 * stacked Thai marks collide — "ที่" and "เพื่อ" render as blobs rather than a
 * tone mark sitting above its vowel. On a Thai-primary site that reads as
 * broken, so the cards are shaped by a real engine (Chromium/HarfBuzz) ahead
 * of time and served as static PNGs.
 *
 * Run after changing any OG title, kicker, or the price:
 *
 *   npx playwright install chromium     # once
 *   node scripts/generate-og.mjs
 *
 * Playwright is deliberately NOT a dependency of this project — it would add a
 * browser download to every Vercel build for a script the build never runs.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'og');

/** Keep in step with app/[locale]/**\/opengraph-image.tsx. */
const PAGES = [
  { slug: 'home', title: 'metadata.ogTitle', kicker: 'metadata.ogKicker' },
  { slug: 'how-it-works', title: 'howItWorks.title', kicker: 'howItWorks.eyebrow' },
  { slug: 'backtest-results', title: 'backtestResults.title', kicker: 'backtestResults.eyebrow' },
  { slug: 'brokers', title: 'brokersPage.title', kicker: 'brokersPage.eyebrow' },
  { slug: 'setup', title: 'setup.title', kicker: 'setup.eyebrow' },
  { slug: 'pricing', title: 'pricingPage.title', kicker: 'pricingPage.eyebrow' },
  { slug: 'faq', title: 'faqPage.title', kicker: 'faqPage.eyebrow' },
  { slug: 'support', title: 'support.title', kicker: 'support.eyebrow' },
  { slug: 'trial', title: 'trial.title', kicker: 'trial.eyebrow' },
];

const LOCALES = ['th', 'en'];
const PRICE = '฿4,900';
const DOMAIN = 'topstock.aurumtech.co';

const pick = (source, path) => path.split('.').reduce((node, key) => node?.[key], source) ?? '';

const titleSize = (t) => (t.length > 78 ? 52 : t.length > 52 ? 62 : t.length > 32 ? 74 : 86);

const b64 = (p) => readFileSync(join(ROOT, 'assets', 'fonts', p)).toString('base64');
const manrope = b64('Manrope-ExtraBold.ttf');
const thai = b64('NotoSansThai-Bold.ttf');

function html({ kicker, title }) {
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:M;src:url(data:font/ttf;base64,${manrope}) format('truetype');font-weight:800}
@font-face{font-family:T;src:url(data:font/ttf;base64,${thai}) format('truetype');font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0A0A0A;font-family:M,T;color:#fff;overflow:hidden}
.card{position:relative;width:1200px;height:630px;display:flex;flex-direction:column;
      justify-content:space-between;padding:64px 72px}
.bloom{position:absolute;top:-280px;left:240px;width:720px;height:520px;border-radius:9999px;
       background:radial-gradient(circle,rgba(212,160,23,.22) 0%,rgba(10,10,10,0) 70%)}
.rule{position:absolute;top:0;right:0;width:10px;height:100%;
      background:linear-gradient(180deg,#F5C518 0%,#D4A017 45%,#A67C0F 100%)}
.brand{display:flex;align-items:center;gap:18px;position:relative}
.brand .name{font-size:30px;letter-spacing:-.5px}
.brand .ea{font-size:17px;color:#D4A017;letter-spacing:3px;margin-left:10px}
.block{position:relative;display:flex;flex-direction:column;gap:20px;max-width:1000px}
.kicker{font-size:21px;color:#D4A017;letter-spacing:3px;text-transform:uppercase}
.title{font-size:${titleSize(title)}px;line-height:1.14;letter-spacing:-1.5px}
.foot{position:relative;display:flex;align-items:center;justify-content:space-between;
      border-top:1px solid #262626;padding-top:26px;font-size:24px}
.facts{display:flex;align-items:center;gap:26px}
.muted{color:#A3A3A3}.sep{color:#404040}.gold{color:#D4A017}.dom{color:#737373;font-size:22px}
</style>
<div class="card">
  <div class="bloom"></div><div class="rule"></div>
  <div class="brand">
    <svg width="46" height="46" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#141414"/>
      <path d="M7 21.5L12.5 16L17 19L25 10" stroke="#D4A017" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="25" cy="10" r="2.6" fill="#F5C518"/>
    </svg>
    <div style="display:flex;align-items:baseline"><span class="name">Topstock</span><span class="ea">EA</span></div>
  </div>
  <div class="block">
    <div class="kicker">${kicker}</div>
    <div class="title">${title}</div>
  </div>
  <div class="foot">
    <div class="facts">
      <span class="muted">NASDAQ 100 · US 30</span><span class="sep">|</span><span class="gold">${PRICE}</span>
    </div>
    <span class="dom">${DOMAIN}</span>
  </div>
</div>`;
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await (
  await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
).newPage();

let count = 0;
for (const locale of LOCALES) {
  const messages = JSON.parse(readFileSync(join(ROOT, 'messages', `${locale}.json`), 'utf8'));
  for (const p of PAGES) {
    const title = escapeHtml(pick(messages, p.title));
    const kicker = escapeHtml(pick(messages, p.kicker));
    if (!title) throw new Error(`Missing OG title ${p.title} for ${locale}`);

    await page.setContent(html({ kicker, title }), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
    writeFileSync(join(OUT, `${locale}-${p.slug}.png`), buf);
    count += 1;
    console.log(`  ${locale}-${p.slug}.png  ${(buf.length / 1024).toFixed(0)} KB`);
  }
}

await browser.close();
console.log(`\n${count} Open Graph cards written to assets/og/`);
