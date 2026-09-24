import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { likePattern, MAX_OFFSET, parseSearchParams, SORTS } from '@/lib/search-params';

type Row = { id: string; number: string; customerName: string; amountCents: number; currency: string; status: string; dueAt: Date; paidAt: Date | null };

// Raw SQL because the "overdue" order is an expression that Prisma's orderBy cannot state.
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const parsed = parseSearchParams(new URL(request.url).searchParams);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { q, status, sort, limit, offset } = parsed.value;

  const where = [Prisma.sql`tenant_id = ${session.tenantId}`];
  if (q) {
    const pattern = likePattern(q);
    where.push(Prisma.sql`("number" ILIKE ${pattern} OR customer_name ILIKE ${pattern})`);
  }
  if (status) where.push(Prisma.sql`status = ${status}::"InvoiceStatus"`);

  const rows = await db.$queryRaw<Row[]>`
    SELECT id, "number", customer_name AS "customerName", amount_cents AS "amountCents", currency, status,
           due_at AS "dueAt", paid_at AS "paidAt"
    FROM invoices
    WHERE ${Prisma.join(where, ' AND ')}
    ORDER BY ${Prisma.raw(SORTS[sort])}, id
    LIMIT ${limit + 1} OFFSET ${offset}`;

  // No next page past the offset cap: a client following nextOffset would otherwise get the capped page again.
  const next = offset + limit;
  return NextResponse.json({ items: rows.slice(0, limit), nextOffset: rows.length > limit && next <= MAX_OFFSET ? next : null });
}
