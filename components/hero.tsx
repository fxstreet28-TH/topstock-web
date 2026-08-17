import { useTranslations } from 'next-intl';
import { MessagesSquare, Target, Wallet } from 'lucide-react';

import { siteConfig } from '@/lib/site';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineCta, LineCtaFormLink } from '@/components/line-cta';
import { ParticleField } from '@/components/particle-field';

const TRUST = [
  { key: 'built', Icon: Target },
  { key: 'price', Icon: Wallet },
  { key: 'consult', Icon: MessagesSquare },
] as const;

export function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden border-b border-surface-border">
      {/* Decorative backdrop, in depth order. All pointer-events-none. */}
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[120px]"
        aria-hidden="true"
      />
      {/* Desktop only, and only when the device can afford it — see the
          component for the full set of conditions. */}
      <ParticleField className="pointer-events-none absolute inset-0 size-full" />

      <div className="container relative py-16 md:py-20 lg:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Badge>{t('badge', { version: siteConfig.version })}</Badge>

          <h1 className="mt-6 text-display-hero font-extrabold text-ink-primary">
            <span className="text-gradient-ink">
              {t.rich('title', {
                gold: (chunks) => <span className="text-gradient-gold">{chunks}</span>,
              })}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <LineCta label={t('ctaPrimary')} formLink={false} />
              <Button asChild size="lg" variant="secondary">
                <a href="#how-it-works">{t('ctaSecondary')}</a>
              </Button>
            </div>
            <LineCtaFormLink />
          </div>

          <ul className="mt-10 grid w-full gap-x-8 gap-y-4 text-left sm:grid-cols-3">
            {TRUST.map(({ key, Icon }) => (
              <li key={key} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <span className="text-sm leading-snug text-ink-secondary">{t(`trust.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
