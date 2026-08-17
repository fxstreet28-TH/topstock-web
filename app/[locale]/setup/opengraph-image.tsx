import { OG_CONTENT_TYPE, OG_SIZE, ogResponse } from '@/lib/og';
import { routing } from '@/lib/routing';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Topstock EA — NASDAQ 100 & US 30';

/** Prerender both locales so a social crawler never pays a cold start. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return ogResponse(locale, 'setup');
}
