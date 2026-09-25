import { describe, expect, it } from 'vitest';
import { formatMoney, minorDigits, sumMinor } from '@/lib/money';

describe('money', () => {
  it('formats two-digit currencies', () => {
    expect(formatMoney(12345, 'USD')).toBe('$123.45');
  });
  it('formats zero-digit currencies', () => {
    expect(formatMoney(12345, 'JPY')).toBe('¥12,345');
  });
  it('formats three-digit currencies', () => {
    expect(minorDigits('KWD')).toBe(3);
  });
  it('sums minor units', () => {
    expect(sumMinor([100, 250, 5])).toBe(355);
  });
});
