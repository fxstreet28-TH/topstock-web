/**
 * Defensive reads for public environment variables.
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time, and a variable that is
 * declared but has no value for the target environment arrives as an empty
 * string rather than `undefined`. `??` does not catch `''`, so a blank value
 * flows straight through the fallback and into whatever consumes it — which
 * is how an empty NEXT_PUBLIC_LINE_QR_URL reached the QR encoder and failed
 * the build with "No input text", and how an empty NEXT_PUBLIC_SITE_URL would
 * throw from `new URL('')` on every page.
 *
 * Pass the literal member expression so Next can still inline it:
 *   readEnv(process.env.NEXT_PUBLIC_LINE_ID, '@aurumtech')
 */
export function readEnv(raw: string | undefined, fallback: string): string {
  const value = raw?.trim();
  return value ? value : fallback;
}

/**
 * As `readEnv`, but also rejects a value that is not a parseable absolute URL.
 * A misconfigured host (`topstock.aurumtech.co` with no scheme) would otherwise
 * throw at build time from `new URL()`.
 */
export function readUrlEnv(raw: string | undefined, fallback: string): string {
  const value = raw?.trim();
  if (!value) return fallback;

  try {
    new URL(value);
    return value;
  } catch {
    // Never fail a build over a malformed URL — fall back and say so.
    console.warn(`[env] Ignoring malformed URL ${JSON.stringify(value)}; using ${fallback}`);
    return fallback;
  }
}
