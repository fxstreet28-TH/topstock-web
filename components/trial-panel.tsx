'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';

import { CONTACT } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { TrialForm } from '@/components/trial-form';

/**
 * Owns the submitted/not-submitted state for /trial.
 *
 * Success is rendered in place rather than at a separate route: a standalone
 * /trial/success URL would be reachable without ever submitting, and the
 * visitor would lose the page context. `qrSlot` carries the server-rendered
 * LINE QR down into the success view.
 */
export function TrialPanel({ qrSlot }: { qrSlot: React.ReactNode }) {
  const t = useTranslations('trial');
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation so screen reader and keyboard users are
  // told the submission landed, instead of being left on a vanished form.
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  if (!submitted) return <TrialForm onSuccess={() => setSubmitted(true)} />;

  return (
    <div
      ref={successRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-6 rounded-xl border border-brand-gold/25 bg-brand-gold/[0.04] p-8 text-center outline-none md:p-12"
    >
      <span className="inline-flex size-14 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10">
        <CheckCircle2 className="size-7 text-brand-gold" aria-hidden="true" />
      </span>

      <div className="space-y-3">
        <h2 className="text-display-sm text-ink-primary">{t('success.title')}</h2>
        <p className="mx-auto max-w-md text-[0.9375rem] leading-relaxed text-ink-secondary">
          {t('success.body')}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 pt-2">
        <p className="text-sm font-medium text-ink-primary">{t('success.qrLabel')}</p>
        {qrSlot}
        <p className="font-mono text-sm text-brand-gold">{CONTACT.line}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href={CONTACT.lineUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" />
            {t('success.addLine')}
          </a>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <a href={CONTACT.telegramUrl} target="_blank" rel="noopener noreferrer">
            <Send aria-hidden="true" />
            {t('success.telegram')}
          </a>
        </Button>
      </div>

      <p className="text-xs text-ink-tertiary">
        {t('success.supportHours', { hours: CONTACT.supportHours })}
      </p>
    </div>
  );
}
