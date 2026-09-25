// A voided invoice gets exactly one credit note, numbered after the invoice, for what the customer had paid on it.

export function creditNoteNumber(invoiceNumber: string): string {
  return `CN-${invoiceNumber}`;
}

export function creditAmountMinor(payments: { amountMinor: number }[]): number {
  return payments.reduce((sum, p) => sum + p.amountMinor, 0);
}
