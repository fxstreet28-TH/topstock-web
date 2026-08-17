import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing, type Locale } from '@/lib/routing';
import { PageHeader } from '@/components/page-header';
import { LineCta } from '@/components/line-cta';
import { FAQ_GROUPS } from '@/lib/faq';
import { FaqGroups } from '@/components/faq-groups';
import { SectionHeading } from '@/components/ui/section-heading';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faqPage' });
  return {
    title: t('title'),
    description: t('summary'),
    alternates: {
      canonical: locale === routing.defaultLocale ? '/faq' : `/${locale}/faq`,
    },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'faqPage' });

  // FAQPage structured data, built from the same keys the page renders so the
  // two can never diverge.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.items.map((key) => ({
        '@type': 'Question',
        name: t(`groups.${group.key}.items.${key}.q`),
        acceptedAnswer: { '@type': 'Answer', text: t(`groups.${group.key}.items.${key}.a`) },
      })),
    ),
  };

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('summary')} />

      <script
        type="application/ld+json"
        // Serialised from our own message catalogue, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="section border-b border-surface-border">
        <div className="container">
          <FaqGroups />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title={t('cta.title')} description={t('cta.description')} />
          <div className="mt-10 flex justify-center">
            <LineCta label={t('cta.button')} />
          </div>
        </div>
      </section>
    </>
  );
}
