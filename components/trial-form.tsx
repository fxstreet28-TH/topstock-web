'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import {
  BROKERS,
  EXPERIENCE,
  SYMBOLS,
  TIMEFRAMES,
  trialRequestSchema,
  type TrialRequestInput,
} from '@/lib/trial-request';
import { cn } from '@/lib/utils';

type ErrorCode = 'invalid' | 'rate_limited' | 'unavailable' | 'server_error' | 'network';

const selectClass =
  'h-12 w-full rounded-lg border border-surface-border bg-surface-elevated px-4 text-[0.9375rem] text-ink-primary transition-colors focus:border-brand-gold/50';

export function TrialForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('trial.form');
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const fd = new FormData(event.currentTarget);
    const candidate = {
      wantsBacktest: fd.get('wantsBacktest') === 'on',
      wantsConsultation: fd.get('wantsConsultation') === 'on',
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      lineId: String(fd.get('lineId') ?? ''),
      telegramId: String(fd.get('telegramId') ?? ''),
      broker: fd.get('broker'),
      symbol: fd.get('symbol'),
      timeframe: fd.get('timeframe'),
      experience: fd.get('experience'),
      message: String(fd.get('message') ?? ''),
    };

    // Validate with the same schema the API uses, so the visitor is never told
    // something is fine that the server will then reject.
    const parsed = trialRequestSchema.safeParse(candidate);
    if (!parsed.success) {
      setFieldErrors(new Set(parsed.error.issues.map((i) => String(i.path[0] ?? ''))));
      setError('invalid');
      return;
    }
    setFieldErrors(new Set());

    setPending(true);
    try {
      const res = await fetch('/api/trial-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data satisfies TrialRequestInput),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      const payload = (await res.json().catch(() => null)) as { code?: ErrorCode } | null;
      setError(payload?.code ?? 'server_error');
    } catch {
      setError('network');
    } finally {
      setPending(false);
    }
  }

  const invalid = (field: string) => fieldErrors.has(field);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {/* What the visitor is asking for */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-ink-primary">{t('requestType')}</legend>
        {(
          [
            ['wantsBacktest', 'wantBacktest'],
            ['wantsConsultation', 'wantConsultation'],
          ] as const
        ).map(([name, label]) => (
          <label
            key={name}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-border bg-surface-elevated p-4 transition-colors hover:border-brand-gold/30 has-[:checked]:border-brand-gold/50 has-[:checked]:bg-brand-gold/[0.06]"
          >
            <input
              type="checkbox"
              name={name}
              defaultChecked={name === 'wantsBacktest'}
              className="mt-0.5 size-4 shrink-0 accent-brand-gold"
            />
            <span className="text-[0.9375rem] leading-snug text-ink-secondary">{t(label)}</span>
          </label>
        ))}
        {invalid('wantsBacktest') ? (
          <p className="text-sm text-destructive">{t('errors.selectAtLeastOne')}</p>
        ) : null}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-name`}>
            {t('name')} <span className="text-brand-gold">*</span>
          </Label>
          <Input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            aria-invalid={invalid('name')}
            className={cn(invalid('name') && 'border-destructive')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-email`}>
            {t('email')} <span className="text-brand-gold">*</span>
          </Label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            aria-invalid={invalid('email')}
            className={cn(invalid('email') && 'border-destructive')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-line`}>{t('lineId')}</Label>
          <Input id={`${id}-line`} name="lineId" placeholder={t('lineIdHint')} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-telegram`}>{t('telegramId')}</Label>
          <Input id={`${id}-telegram`} name="telegramId" placeholder="@username" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-broker`}>{t('broker')}</Label>
          <select id={`${id}-broker`} name="broker" defaultValue="fbs_cent" className={selectClass}>
            {BROKERS.map((v) => (
              <option key={v} value={v}>
                {t(`options.broker.${v}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-symbol`}>{t('symbol')}</Label>
          <select id={`${id}-symbol`} name="symbol" defaultValue="nas100" className={selectClass}>
            {SYMBOLS.map((v) => (
              <option key={v} value={v}>
                {t(`options.symbol.${v}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-timeframe`}>{t('timeframe')}</Label>
          <select id={`${id}-timeframe`} name="timeframe" defaultValue="m5" className={selectClass}>
            {TIMEFRAMES.map((v) => (
              <option key={v} value={v}>
                {t(`options.timeframe.${v}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-experience`}>{t('experience')}</Label>
          <select
            id={`${id}-experience`}
            name="experience"
            defaultValue="beginner"
            className={selectClass}
          >
            {EXPERIENCE.map((v) => (
              <option key={v} value={v}>
                {t(`options.experience.${v}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-message`}>{t('message')}</Label>
        <Textarea id={`${id}-message`} name="message" placeholder={t('messageHint')} />
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-ink-secondary"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-start">
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              {t('submitting')}
            </>
          ) : (
            <>
              {t('submit')}
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
        <p className="text-xs leading-relaxed text-ink-tertiary">{t('privacyNote')}</p>
      </div>
    </form>
  );
}
