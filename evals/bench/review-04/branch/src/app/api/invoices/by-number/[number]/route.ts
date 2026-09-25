import { getSession } from '@/lib/auth';
import { handle, json, notFound, unauthorized } from '@/lib/http';
import * as invoices from '@/repos/invoices';

// Support looks an invoice up by the number the customer reads out.
export async function GET(request: Request, { params }: { params: { number: string } }) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const invoice = await invoices.findByNumber(session.tenantId, decodeURIComponent(params.number));
    return invoice ? json({ invoice }) : notFound();
  });
}
