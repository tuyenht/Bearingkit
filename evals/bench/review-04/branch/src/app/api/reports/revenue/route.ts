import { Prisma } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { convertMinor, getRates } from '@/lib/fx';
import { badRequest, handle, json, unauthorized } from '@/lib/http';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// Paid revenue per currency for one month, and the total in the tenant's reporting currency.
export async function GET(request: Request) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    const url = new URL(request.url);
    const month = url.searchParams.get('month') ?? '';
    if (!MONTH.test(month)) return badRequest('month must be YYYY-MM');
    const reportCurrency = (url.searchParams.get('currency') ?? 'USD').toUpperCase();
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    // A grouped sum over payments joined to their invoices; Prisma's groupBy cannot group across the relation.
    const rows = await db.$queryRaw<{ currency: string; total: bigint }[]>(Prisma.sql`
      SELECT i."currency" AS currency, SUM(p."amountMinor") AS total
      FROM "Payment" p JOIN "Invoice" i ON i."id" = p."invoiceId"
      WHERE p."tenantId" = ${session.tenantId} AND p."paidAt" >= ${start} AND p."paidAt" < ${end}
      GROUP BY i."currency"
      ORDER BY i."currency"`);

    const { rates } = await getRates(reportCurrency);
    const byCurrency = rows.map((r) => ({ currency: r.currency, totalMinor: Number(r.total) }));
    const totalMinor = byCurrency.reduce((sum, r) => sum + convertMinor(r.totalMinor, r.currency, reportCurrency, rates), 0);
    return json({ month, reportCurrency, byCurrency, totalMinor });
  });
}
