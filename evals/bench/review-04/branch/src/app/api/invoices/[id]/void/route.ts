import { getSession } from '@/lib/auth';
import { creditAmountMinor, creditNoteNumber } from '@/lib/credit-notes';
import { db } from '@/lib/db';
import { badRequest, handle, json, notFound, unauthorized } from '@/lib/http';
import { logger } from '@/lib/logger';
import * as invoices from '@/repos/invoices';

// Voids an invoice and issues its credit note, so the ledger shows what was refunded.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const invoice = await invoices.getForTenant(session.tenantId, params.id);
    if (!invoice) return notFound();
    if (invoice.status === 'VOID') return badRequest('invoice is already void');

    try {
      await invoices.markVoid(session.tenantId, invoice.id);
      await db.creditNote.create({
        data: {
          tenantId: session.tenantId,
          invoiceId: invoice.id,
          number: creditNoteNumber(invoice.number),
          amountMinor: creditAmountMinor(invoice.payments),
        },
      });
    } catch (e) {
      logger.error('voiding invoice failed', { invoiceId: invoice.id, error: e instanceof Error ? e.message : String(e) });
    }

    return json({ ok: true, number: creditNoteNumber(invoice.number) });
  });
}
