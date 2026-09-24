import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await db.invoice.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!invoice) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(invoice);
}
