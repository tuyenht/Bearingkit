// Amounts are stored in minor units and formatted for display only. Most currencies have two minor digits; the ones
// listed here differ (ISO 4217).
const MINOR_DIGITS: Record<string, number> = { JPY: 0, KRW: 0, VND: 0, BHD: 3, KWD: 3, TND: 3 };

export function minorDigits(currency: string): number {
  return MINOR_DIGITS[currency.toUpperCase()] ?? 2;
}

export function formatMoney(amountMinor: number, currency = 'USD', locale = 'en-US'): string {
  const digits = minorDigits(currency);
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits })
    .format(amountMinor / 10 ** digits);
}

export function sumMinor(amounts: number[]): number {
  return amounts.reduce((a, b) => a + b, 0);
}
