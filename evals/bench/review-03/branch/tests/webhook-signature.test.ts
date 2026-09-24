import { createHmac } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { verifySignature } from '../src/lib/webhook-signature';

const secret = 'whsec_test';
const body = JSON.stringify({ id: 'evt_1', type: 'payment.succeeded', data: { invoiceId: 'inv_1', amount: 1200, currency: 'EUR' } });
const now = 1_790_000_000;
const sign = (b: string, t = now) => `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${b}`).digest('hex')}`;

describe('verifySignature', () => {
  test('accepts the provider signature', () => {
    expect(verifySignature(body, sign(body), secret, now * 1000)).toEqual({ ok: true });
  });
  test('refuses a changed body', () => {
    expect(verifySignature(body.replace('1200', '12'), sign(body), secret, now * 1000)).toEqual({ ok: false, reason: 'mismatch' });
  });
  test('refuses a signature older than five minutes', () => {
    expect(verifySignature(body, sign(body), secret, (now + 301) * 1000)).toEqual({ ok: false, reason: 'stale' });
  });
  test('refuses a truncated signature without throwing', () => {
    expect(verifySignature(body, sign(body).slice(0, -2), secret, now * 1000)).toEqual({ ok: false, reason: 'mismatch' });
  });
  test('accepts any of the signatures sent while the secret rotates', () => {
    const other = createHmac('sha256', 'whsec_old').update(`${now}.${body}`).digest('hex');
    expect(verifySignature(body, `t=${now},v1=${other},v1=${sign(body).split('v1=')[1]}`, secret, now * 1000)).toEqual({ ok: true });
  });
  test('refuses a signature with characters that are not hex', () => {
    expect(verifySignature(body, `${sign(body)}zz`, secret, now * 1000)).toEqual({ ok: false, reason: 'malformed' });
  });
  test('refuses a header without a timestamp, and no header at all', () => {
    expect(verifySignature(body, 'v1=abc', secret, now * 1000)).toEqual({ ok: false, reason: 'malformed' });
    expect(verifySignature(body, null, secret, now * 1000)).toEqual({ ok: false, reason: 'missing' });
  });
});
