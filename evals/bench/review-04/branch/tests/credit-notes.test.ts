import { describe, expect, it } from 'vitest';
import { creditAmountMinor, creditNoteNumber } from '@/lib/credit-notes';

describe('credit notes', () => {
  it('numbers the note after the invoice', () => {
    expect(creditNoteNumber('INV-2026-0042')).toBe('CN-INV-2026-0042');
  });
  it('credits what was paid', () => {
    expect(creditAmountMinor([{ amountMinor: 5000 }, { amountMinor: 2500 }])).toBe(7500);
  });
  it('credits nothing on an unpaid invoice', () => {
    expect(creditAmountMinor([])).toBe(0);
  });
});
