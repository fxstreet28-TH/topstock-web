import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, Manrope, JetBrains_Mono, Noto_Sans_Thai } from 'next/font/google';

import { routing, type Locale } from '@/lib/routing';
import { siteConfig } from '@/lib/site';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import '../globals.css';

const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Manrope({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const thai = Noto_Sans_Thai({ subsets: ['thai'], variable: '--font-thai', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    applicationName: siteConfig.name,
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages: {
        en: '/',
        th: '/th',
      },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: t('title'),
      description: t('description'),
      url: locale === routing.defaultLocale ? '/' : `/${locale}`,
      locale: locale === 'th' ? 'th_TH' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering of all messages at build time.
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <html
      lang={locale}
      className={`dark ${body.variable} ${display.variable} ${mono.variable} ${thai.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-surface">
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">
            {t('skipToContent')}
          </a>
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
