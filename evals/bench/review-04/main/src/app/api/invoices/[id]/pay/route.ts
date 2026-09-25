import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { handle, json, notFound, unauthorized } from '@/lib/http';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const invoice = await db.invoice.findFirst({ where: { id: params.id, tenantId: session.tenantId } });
    if (!invoice) return notFound();
    await db.$transaction([
      db.payment.create({ data: { tenantId: session.tenantId, invoiceId: invoice.id, amountMinor: invoice.amountMinor } }),
      db.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID' } }),
    ]);
    return json({ ok: true });
  });
}
