import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 300;

export type Verdict = { ok: true } | { ok: false; reason: 'missing' | 'malformed' | 'stale' | 'mismatch' };

// The provider signs `${t}.${body}` with HMAC-SHA256 and sends the header "t=<unix seconds>,v1=<hex digest>"; while
// it rotates the secret, the header carries one v1 per secret.
export function verifySignature(body: string, header: string | null, secret: string, nowMs: number): Verdict {
  if (!header) return { ok: false, reason: 'missing' };
  let ts: string | undefined;
  const candidates: string[] = [];
  for (const part of header.split(',')) {
    const at = part.indexOf('=');
    if (at <= 0) continue;
    const key = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    if (key === 't') ts = value;
    else if (key === 'v1' && /^(?:[0-9a-f]{2})+$/i.test(value)) candidates.push(value);
  }
  if (!ts || !candidates.length || !Number.isSafeInteger(Number(ts))) return { ok: false, reason: 'malformed' };
  if (Math.abs(nowMs / 1000 - Number(ts)) > TOLERANCE_SECONDS) return { ok: false, reason: 'stale' };
  const expected = createHmac('sha256', secret).update(`${ts}.${body}`).digest();
  const matches = candidates.some((hex) => {
    const given = Buffer.from(hex, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  return matches ? { ok: true } : { ok: false, reason: 'mismatch' };
}
