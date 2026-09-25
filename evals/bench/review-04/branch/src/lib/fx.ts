// Reference exchange rates from the central bank feed, used to show report totals in one currency. The rates are the
// same for every tenant, so one process-wide cache keyed by the base currency serves all of them.
import { minorDigits } from './money';

type Rates = { base: string; rates: Record<string, number>; fetchedAt: number };

const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, Rates>();

export async function getRates(base: string): Promise<Rates> {
  const key = base.toUpperCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.fetchedAt < TTL_MS) return hit;
  const res = await fetch(`${process.env.FX_API_URL}/latest?base=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`fx feed answered ${res.status}`);
  const body = (await res.json()) as { rates: Record<string, number> };
  const rates = { base: key, rates: body.rates, fetchedAt: Date.now() };
  cache.set(key, rates);
  return rates;
}

// `rates` are units of each currency per one unit of the base, as the feed returns them for `getRates(to)`.
export function convertMinor(amountMinor: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amountMinor;
  const rate = rates[from];
  if (!rate) throw new Error(`no ${from} rate against ${to}`);
  return Math.round((amountMinor / 10 ** minorDigits(from) / rate) * 10 ** minorDigits(to));
}
