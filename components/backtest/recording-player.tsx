'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { VIDEO, formatDuration, type VideoCut } from '@/lib/backtest-data';
import { cn } from '@/lib/utils';

const CUTS: readonly VideoCut[] = ['full', 'highlights'];

/**
 * The Strategy Tester recording, in either of the two cuts that were captured.
 *
 * Controls are the browser's own. A custom skin would mean re-implementing
 * keyboard handling, captions and the fullscreen affordance for no gain, and
 * the native player is the one the reader's assistive tech already knows.
 *
 * `key` on the <video> is deliberate: swapping the `src` attribute alone does
 * not reload an already-initialised media element, so the element is remounted
 * instead of asking React to mutate it in place.
 */
export function RecordingPlayer() {
  const t = useTranslations('backtestResults.video');
  const [cut, setCut] = useState<VideoCut>('full');
  const active = VIDEO[cut];

  return (
    <div className="mx-auto max-w-4xl">
      <div
        className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-surface-border bg-surface-elevated p-1.5 sm:w-fit sm:mx-auto"
        role="group"
        aria-label={t('cutsLabel')}
      >
        {CUTS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={cut === key}
            onClick={() => setCut(key)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors sm:flex-none',
              cut === key
                ? 'bg-brand-gold text-surface'
                : 'text-ink-secondary hover:bg-white/5 hover:text-ink-primary',
            )}
          >
            {t(`cuts.${key}`)}
            <span className="ml-2 font-mono text-xs opacity-70">
              {formatDuration(VIDEO[key].duration)}
            </span>
          </button>
        ))}
      </div>

      <figure className="mt-6">
        <div className="overflow-hidden rounded-xl border border-surface-border bg-black shadow-elevated">
          <video
            key={cut}
            className="block h-auto w-full"
            controls
            /*
             * The recording is the product's proof, so it is watch-only: the
             * native download and cast buttons are suppressed, picture-in-
             * picture is off, and the right-click menu (which offers "Save
             * video as…") never opens. Chromium and Safari honour all of it;
             * a few Firefox builds still show the download item, which the
             * watermarks on the footage are there to cover.
             */
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            playsInline
            preload="metadata"
            poster={VIDEO.poster}
            width={VIDEO.width}
            height={VIDEO.height}
            aria-label={t('label')}
          >
            <source src={active.src} type="video/mp4" />
            <p className="p-6 text-sm text-ink-secondary">{t('unsupported')}</p>
          </video>
        </div>

        <figcaption className="mt-4 text-center text-sm leading-relaxed text-ink-secondary">
          {t('note')}
        </figcaption>
      </figure>
    </div>
  );
}
