import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { handle, unauthorized } from '@/lib/http';
import { requireRole } from '@/lib/roles';

// Full export of the tenant's invoices with customer contact details, for the finance team.
export async function GET(request: Request) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    requireRole(session, 'ADMIN');
    const invoices = await db.invoice.findMany({ where: { tenantId: session.tenantId }, include: { customer: true, payments: true } });
    const header = 'number,customer,email,currency,amount_minor,status,due_date';
    const lines = invoices.map((i) => [i.number, i.customer.name, i.customer.email, i.currency, i.amountMinor, i.status, i.dueDate.toISOString()].join(','));
    return new Response([header, ...lines].join('\n'), { headers: { 'content-type': 'text/csv' } });
  });
}
