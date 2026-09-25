// Amounts are stored in minor units (cents) and formatted for display only.
export function formatMoney(amountMinor: number, currency = 'USD'): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

export function sumMinor(amounts: number[]): number {
  return amounts.reduce((a, b) => a + b, 0);
}
