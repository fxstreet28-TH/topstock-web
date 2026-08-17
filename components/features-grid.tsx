import { useTranslations } from 'next-intl';
import { Gauge, ShieldCheck, Target } from 'lucide-react';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';

const ITEMS = [
  { key: 'native', Icon: Target },
  { key: 'trail', Icon: Gauge },
  { key: 'cent', Icon: ShieldCheck },
] as const;

export function FeaturesGrid() {
  const t = useTranslations('home.solution');

  return (
    <section className="section border-b border-surface-border">
      <div className="container">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ITEMS.map(({ key, Icon }) => (
            <Card key={key} className="flex flex-col gap-4">
              <span className="inline-flex size-11 items-center justify-center rounded-lg border border-brand-gold/25 bg-brand-gold/10">
                <Icon className="size-5 text-brand-gold" aria-hidden="true" />
              </span>
              <CardTitle>{t(`items.${key}.title`)}</CardTitle>
              <CardDescription>{t(`items.${key}.body`)}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
