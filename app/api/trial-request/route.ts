import { NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { notifyAdminOfLead } from '@/lib/notify';
import {
  RATE_LIMIT_PER_EMAIL,
  RATE_LIMIT_WINDOW_MS,
  toRequestType,
  trialRequestSchema,
} from '@/lib/trial-request';

export const runtime = 'nodejs';
/** Lead capture must never be served from a cache. */
export const dynamic = 'force-dynamic';

/** Error codes the client maps to localised copy. */
type ErrorCode = 'invalid' | 'rate_limited' | 'unavailable' | 'server_error';

function fail(code: ErrorCode, status: number) {
  return NextResponse.json({ ok: false, code }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('invalid', 400);
  }

  const parsed = trialRequestSchema.safeParse(body);
  if (!parsed.success) return fail('invalid', 400);

  const input = parsed.data;
  const requestType = toRequestType(input);

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase not provisioned yet. Say so plainly rather than silently
    // dropping the lead — the client shows the LINE fallback.
    console.error('[trial-request] Supabase is not configured; lead not persisted');
    return fail('unavailable', 503);
  }

  // Rate limit by email against the database rather than in memory: serverless
  // instances do not share memory, so an in-process counter would not hold.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error: countError } = await supabase
    .from('trial_requests')
    .select('id', { count: 'exact', head: true })
    .eq('email', input.email)
    .gte('created_at', since);

  if (countError) {
    console.error('[trial-request] Rate limit check failed', countError);
    return fail('server_error', 500);
  }
  if ((count ?? 0) >= RATE_LIMIT_PER_EMAIL) {
    return fail('rate_limited', 429);
  }

  const { data, error } = await supabase
    .from('trial_requests')
    .insert({
      request_type: requestType,
      name: input.name,
      email: input.email,
      line_id: input.lineId || null,
      telegram_id: input.telegramId || null,
      broker: input.broker,
      symbol: input.symbol,
      timeframe: input.timeframe,
      experience: input.experience,
      message: input.message || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[trial-request] Insert failed', error);
    return fail('server_error', 500);
  }

  // The lead is safely stored at this point, so a notification failure is
  // logged but not surfaced — it must not cost the visitor their submission.
  const notified = await notifyAdminOfLead({
    requestType,
    name: input.name,
    email: input.email,
    lineId: input.lineId || undefined,
    telegramId: input.telegramId || undefined,
    broker: input.broker,
    symbol: input.symbol,
    timeframe: input.timeframe,
    experience: input.experience,
    message: input.message || undefined,
  });

  if (!notified) {
    console.warn(`[trial-request] Lead ${data.id} stored but admin notification did not send`);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
