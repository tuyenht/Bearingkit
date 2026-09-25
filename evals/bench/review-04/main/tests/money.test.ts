import { describe, expect, it } from 'vitest';
import { formatMoney, sumMinor } from '@/lib/money';

describe('money', () => {
  it('formats minor units', () => {
    expect(formatMoney(12345)).toBe('USD 123.45');
  });
  it('sums minor units', () => {
    expect(sumMinor([100, 250, 5])).toBe(355);
  });
});
