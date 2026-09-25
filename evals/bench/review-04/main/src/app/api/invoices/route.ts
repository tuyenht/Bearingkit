import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { handle, json, unauthorized } from '@/lib/http';

export async function GET(request: Request) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const status = new URL(request.url).searchParams.get('status') ?? undefined;
    const invoices = await db.invoice.findMany({
      where: { tenantId: session.tenantId, ...(status ? { status: status as never } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return json({ invoices });
  });
}
