import { db } from '@/lib/db';

export function record(tenantId: string, invoiceId: string, amountMinor: number) {
  return db.payment.create({ data: { tenantId, invoiceId, amountMinor } });
}

export function listForInvoice(tenantId: string, invoiceId: string) {
  return db.payment.findMany({ where: { tenantId, invoiceId }, orderBy: { paidAt: 'asc' } });
}
