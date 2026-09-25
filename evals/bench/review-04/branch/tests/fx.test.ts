import { afterEach, describe, expect, it, vi } from 'vitest';
import { convertMinor, getRates } from '@/lib/fx';

describe('fx', () => {
  afterEach(() => vi.restoreAllMocks());

  it('converts between currencies with different minor digits', () => {
    expect(convertMinor(15000, 'JPY', 'USD', { JPY: 150 })).toBe(10000);
    expect(convertMinor(1000, 'EUR', 'USD', { EUR: 0.8 })).toBe(1250);
  });

  it('leaves the report currency as it is and refuses a missing rate', () => {
    expect(convertMinor(1234, 'USD', 'USD', {})).toBe(1234);
    expect(() => convertMinor(1, 'GBP', 'USD', {})).toThrow(/no GBP rate/);
  });

  it('caches rates per base currency', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ rates: { EUR: 0.9 } })));
    await getRates('usd');
    await getRates('USD');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
