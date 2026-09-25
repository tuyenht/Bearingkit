import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { handle, json, notFound, unauthorized } from '@/lib/http';
import * as invoices from '@/repos/invoices';
import * as payments from '@/repos/payments';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const invoice = await invoices.getForTenant(session.tenantId, params.id);
    if (!invoice) return notFound();
    await db.$transaction([
      payments.record(session.tenantId, invoice.id, invoice.amountMinor),
      invoices.markPaid(session.tenantId, invoice.id),
    ]);
    return json({ ok: true });
  });
}
