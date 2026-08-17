import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { routing } from '@/lib/routing';

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/**
 * Serves a pre-rendered Open Graph card.
 *
 * The cards are shaped ahead of time by scripts/generate-og.mjs rather than
 * composed here with next/og: Satori does not apply GPOS mark-to-mark
 * positioning, so stacked Thai marks collide ("ที่" renders as a blob). The
 * generator uses Chromium, which shapes them correctly.
 *
 * Regenerate after changing an OG title, kicker, or the price.
 */
export function ogResponse(locale: string, slug: string): Response {
  const safe = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;

  const file = readFileSync(join(process.cwd(), 'assets', 'og', `${safe}-${slug}.png`));

  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': OG_CONTENT_TYPE,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
