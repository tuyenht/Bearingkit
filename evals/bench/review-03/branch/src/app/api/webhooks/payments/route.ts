import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifySignature } from '@/lib/webhook-signature';

type PaymentSucceeded = { id: string; type: 'payment.succeeded'; data: { invoiceId: string; amount: number; currency: string } };

function isPaymentSucceeded(value: unknown): value is PaymentSucceeded {
  const e = value as Partial<PaymentSucceeded> | null;
  return typeof e?.id === 'string' && e.type === 'payment.succeeded' && typeof e.data?.invoiceId === 'string'
    && Number.isInteger(e.data.amount) && e.data.amount > 0 && e.data.amount <= 2_147_483_647 && typeof e.data.currency === 'string' && /^[A-Za-z]{3}$/.test(e.data.currency);
}

export async function POST(request: Request) {
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'webhook not configured' }, { status: 500 });
  const body = await request.text();
  const verdict = verifySignature(body, request.headers.get('x-payments-signature'), secret, Date.now());
  if (!verdict.ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  let event: unknown;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if ((event as { type?: unknown } | null)?.type !== 'payment.succeeded') return NextResponse.json({ received: true });
  if (!isPaymentSucceeded(event)) return NextResponse.json({ error: 'invalid event' }, { status: 400 });

  const { invoiceId, amount } = event.data;
  const currency = event.data.currency.toUpperCase();
  try {
    const [, applied] = await db.$transaction([
      db.paymentEvent.create({ data: { providerEventId: event.id, invoiceId, amountCents: amount, currency } }),
      db.invoice.updateMany({
        where: { id: invoiceId, status: 'open', amountCents: amount, currency },
        data: { status: 'paid', paidAt: new Date() },
      }),
    ]);
    if (applied.count === 0) console.warn('payment recorded, invoice not marked paid', { eventId: event.id, invoiceId });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      console.warn('payment for an unknown invoice', { eventId: event.id, invoiceId });
      return NextResponse.json({ received: true, unknownInvoice: true });
    }
    throw err;
  }
  return NextResponse.json({ received: true });
}
