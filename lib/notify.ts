import 'server-only';

import { Resend } from 'resend';

import { CONTACT } from '@/lib/site';
import type { RequestType } from '@/lib/trial-request';

/**
 * Admin notification for a new lead.
 *
 * Delivery is best-effort: a failure here must never fail the visitor's
 * submission, because the row is already persisted and the lead is not lost.
 * The caller logs the outcome.
 */
export interface LeadNotification {
  requestType: RequestType;
  name: string;
  email: string;
  lineId?: string | undefined;
  telegramId?: string | undefined;
  broker: string;
  symbol: string;
  timeframe: string;
  experience: string;
  message?: string | undefined;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function notifyAdminOfLead(lead: LeadNotification): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.NOTIFICATION_FROM_EMAIL ?? `Topstock <noreply@topstock.aurumtech.co>`;

  if (!apiKey || !to) return false;

  const rows: Array<[string, string]> = [
    ['Request type', lead.requestType],
    ['Name', lead.name],
    ['Email', lead.email],
    ['LINE', lead.lineId || '—'],
    ['Telegram', lead.telegramId || '—'],
    ['Broker', lead.broker],
    ['Symbol', lead.symbol],
    ['Timeframe', lead.timeframe],
    ['Experience', lead.experience],
    ['Message', lead.message || '—'],
  ];

  const html = `
    <h2 style="font-family:system-ui;margin:0 0 16px">New Topstock ${escapeHtml(lead.requestType)} request</h2>
    <table style="font-family:system-ui;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
        )
        .join('')}
    </table>
    <p style="font-family:system-ui;font-size:13px;color:#666;margin-top:20px">
      Reply on LINE (${escapeHtml(CONTACT.line)}) or by email within 24 hours.
    </p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: lead.email,
      subject: `Topstock ${lead.requestType} request — ${lead.name}`,
      html,
    });
    if (error) {
      console.error('[notify] Resend rejected the lead email', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[notify] Failed to send lead email', err);
    return false;
  }
}
