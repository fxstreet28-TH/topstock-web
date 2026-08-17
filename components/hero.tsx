import { useTranslations } from 'next-intl';
import { ArrowRight, MessagesSquare, Target, Wallet } from 'lucide-react';

import { Link } from '@/lib/navigation';
import { siteConfig } from '@/lib/site';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TRUST = [
  { key: 'built', Icon: Target },
  { key: 'price', Icon: Wallet },
  { key: 'consult', Icon: MessagesSquare },
] as const;

export function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative overflow-hidden border-b border-surface-border">
      {/* Blueprint grid + gold bloom, both purely decorative. */}
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge>{t('badge', { version: siteConfig.version })}</Badge>

          <h1 className="mt-6 text-display-xl text-ink-primary">
            {t.rich('title', {
              gold: (chunks) => <span className="text-gradient-gold">{chunks}</span>,
            })}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
            {t('subtitle')}
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/trial">
                {t('ctaPrimary')}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#how-it-works">{t('ctaSecondary')}</a>
            </Button>
          </div>

          <ul className="mt-12 grid w-full gap-x-8 gap-y-4 text-left sm:grid-cols-3">
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
