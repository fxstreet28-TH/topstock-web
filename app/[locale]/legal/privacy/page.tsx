import type { Metadata } from 'next';

import { routing } from '@/lib/routing';
import { LegalPage, buildLegalMetadata } from '@/components/legal-page';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLegalMetadata('privacy', locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage doc="privacy" locale={locale} />;
}
