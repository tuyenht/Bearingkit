import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { handle, json, notFound, unauthorized } from '@/lib/http';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const invoice = await db.invoice.findFirst({ where: { id: params.id, tenantId: session.tenantId }, include: { payments: true } });
    if (!invoice) return notFound();
    return json({ invoice });
  });
}
