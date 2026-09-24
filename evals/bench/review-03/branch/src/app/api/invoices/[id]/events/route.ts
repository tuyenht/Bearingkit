import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await db.invoice.findUnique({ where: { id }, select: { tenantId: true } });
  if (!invoice || invoice.tenantId !== session.tenantId) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const events = await db.paymentEvent.findMany({
    where: { invoiceId: id },
    orderBy: { receivedAt: 'desc' },
    select: { providerEventId: true, amountCents: true, currency: true, receivedAt: true },
  });
  return NextResponse.json({ events });
}
