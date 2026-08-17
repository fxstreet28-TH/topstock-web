import { setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/lib/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // Phase 2 replaces this with the full landing page sections.
  return (
    <div className="container section">
      <p className="eyebrow">Phase 1 — Foundation</p>
      <h1 className="mt-4 text-display-lg text-ink-primary">
        The Expert Advisor built exclusively for{' '}
        <span className="text-gradient-gold">NASDAQ 100 &amp; US 30</span>.
      </h1>
    </div>
  );
}
