import { getSession } from '@/lib/auth';
import { handle, json, notFound, unauthorized } from '@/lib/http';
import * as invoices from '@/repos/invoices';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const invoice = await invoices.getForTenant(session.tenantId, params.id);
    return invoice ? json({ invoice }) : notFound();
  });
}
