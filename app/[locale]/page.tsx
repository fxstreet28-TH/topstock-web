import { setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/lib/routing';
import { Hero } from '@/components/hero';
import { ProblemSection } from '@/components/problem-section';
import { FeaturesGrid } from '@/components/features-grid';
import { HowItWorks } from '@/components/how-it-works';
import { TryBeforeBuy } from '@/components/try-before-buy';
import { BacktestSection } from '@/components/backtest-chart';
import { BrokerLogos } from '@/components/broker-logos';
import { PricingCard } from '@/components/pricing-card';
import { FaqAccordion } from '@/components/faq-accordion';
import { FinalCta } from '@/components/final-cta';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <Hero />
      <ProblemSection />
      <FeaturesGrid />
      <HowItWorks />
      {/* The conversion centrepiece sits between the mechanism and the price. */}
      <TryBeforeBuy />
      <BacktestSection />
      <BrokerLogos />
      <PricingCard />
      <FaqAccordion />
      <FinalCta />
    </>
  );
}
