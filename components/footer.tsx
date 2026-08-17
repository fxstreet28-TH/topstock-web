import { useTranslations } from 'next-intl';
import { Mail, MessageCircle, Send } from 'lucide-react';

import { Link } from '@/lib/navigation';
import { CONTACT, siteConfig } from '@/lib/site';
import { Logo } from '@/components/logo';
import { FooterRiskDisclaimer } from '@/components/footer-risk-disclaimer';

const columns = [
  {
    key: 'product',
    links: [
      { href: '/how-it-works', key: 'howItWorks' },
      { href: '/backtest-results', key: 'backtest' },
      { href: '/pricing', key: 'pricing' },
      { href: '/setup', key: 'setup' },
    ],
  },
  {
    key: 'resources',
    links: [
      { href: '/trial', key: 'trial' },
      { href: '/brokers', key: 'brokers' },
      { href: '/faq', key: 'faq' },
      { href: '/support', key: 'support' },
      { href: '/license/activate', key: 'activate' },
    ],
  },
  {
    key: 'legal',
    links: [
      { href: '/legal/terms', key: 'terms' },
      { href: '/legal/privacy', key: 'privacy' },
      { href: '/legal/risk', key: 'risk' },
      { href: '/legal/refund', key: 'refund' },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-border bg-surface">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">{t('tagline')}</p>

            <div className="flex flex-col gap-2.5 pt-1 text-sm">
              {/* LINE is the primary channel, so it leads and carries the accent. */}
              <a
                href={CONTACT.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-brand-gold transition-opacity hover:opacity-80"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                {t('line', { id: CONTACT.line })}
              </a>
              <a
                href={CONTACT.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-ink-secondary transition-colors hover:text-brand-gold"
              >
                <Send className="size-4" aria-hidden="true" />
                {t('telegram')}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center gap-2 text-ink-secondary transition-colors hover:text-brand-gold"
              >
                <Mail className="size-4" aria-hidden="true" />
                {CONTACT.email}
              </a>
              <p className="text-xs text-ink-tertiary">
                {t('supportHours', { hours: CONTACT.supportHours })}
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.key} aria-labelledby={`footer-${col.key}`}>
              <h2
                id={`footer-${col.key}`}
                className="font-mono text-[0.6875rem] uppercase track-label text-ink-tertiary"
              >
                {t(`columns.${col.key}`)}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-ink-secondary transition-colors hover:text-brand-gold"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-surface-border pt-8">
          <h2 className="font-mono text-[0.6875rem] uppercase track-label text-ink-tertiary">
            {t('paymentTitle')}
          </h2>
          <p className="mt-3 text-sm text-ink-secondary">{t('paymentMethods')}</p>
        </div>

        <FooterRiskDisclaimer className="mt-10 border-t border-surface-border pt-8" />

        <div className="mt-8 flex flex-col gap-3 border-t border-surface-border pt-8 text-xs text-ink-tertiary sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.parentBrand}. {t('rights')}
          </p>
          <p>
            {t('builtBy')}{' '}
            <a
              href={siteConfig.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-secondary transition-colors hover:text-brand-gold"
            >
              {siteConfig.parentBrand}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
