import { useTranslations } from 'next-intl';
import { LineCta } from '@/components/line-cta';

export function FinalCta() {
  const t = useTranslations('home.finalCta');

  return (
    <section className="section relative overflow-hidden">
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[44rem] -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-gold/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="container relative">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-display-md text-ink-primary">{t('title')}</h2>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary md:text-lg">
            {t('description')}
          </p>

          <LineCta label={t('ctaPrimary')} className="mt-9 w-full sm:w-auto" />
        </div>
        {/*
          The footer's compact risk disclaimer renders directly below this
          section on every page, so a block copy here would repeat the same
          legal text twice in one screen. The full prominent version lives on
          /legal/risk.
        */}
      </div>
    </section>
  );
}
