'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/lib/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeading } from '@/components/ui/section-heading';

const ITEMS = [
  'trial',
  'mustConsult',
  'payment',
  'included',
  'refund',
  'whyConsult',
  'priceCompare',
  'brokers',
  'minimum',
  'vps',
] as const;

export function FaqAccordion() {
  const t = useTranslations('home.faq');

  return (
    <section id="faq" className="section border-b border-surface-border scroll-mt-24">
      <div className="container">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="border-t border-surface-border">
            {ITEMS.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger>{t(`items.${key}.q`)}</AccordionTrigger>
                <AccordionContent>{t(`items.${key}.a`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 flex justify-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm text-brand-gold transition-opacity hover:opacity-80"
            >
              {t('more')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
