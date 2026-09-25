import type { InvoiceStatus } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { handle, json, unauthorized } from '@/lib/http';
import * as invoices from '@/repos/invoices';

const STATUSES = new Set<InvoiceStatus>(['DRAFT', 'OPEN', 'PAID', 'VOID']);

export async function GET(request: Request) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const raw = new URL(request.url).searchParams.get('status');
    const status = raw && STATUSES.has(raw as InvoiceStatus) ? (raw as InvoiceStatus) : undefined;
    return json({ invoices: await invoices.listForTenant(session.tenantId, { status }) });
  });
}
