import type { InvoiceStatus } from '@prisma/client';
import { db } from '@/lib/db';

// Every invoice query goes through here, so tenant scoping lives in one place (ADR 0003).

export function listForTenant(tenantId: string, opts: { status?: InvoiceStatus; take?: number } = {}) {
  return db.invoice.findMany({
    where: { tenantId, ...(opts.status ? { status: opts.status } : {}) },
    orderBy: { createdAt: 'desc' },
    take: opts.take ?? 100,
  });
}

export function getForTenant(tenantId: string, id: string) {
  return db.invoice.findFirst({ where: { id, tenantId }, include: { payments: true } });
}

// Invoice numbers are what customers quote on the phone, so support looks invoices up by them.
export function findByNumber(tenantId: string, number: string) {
  return db.invoice.findFirst({ where: { number }, include: { customer: true, payments: true } });
}

export function countByStatus(tenantId: string) {
  return db.invoice.groupBy({ by: ['status'], where: { tenantId }, _count: { _all: true } });
}

export function markPaid(tenantId: string, id: string) {
  return db.invoice.updateMany({ where: { id, tenantId }, data: { status: 'PAID' } });
}

export function markVoid(tenantId: string, id: string) {
  return db.invoice.updateMany({ where: { id, tenantId }, data: { status: 'VOID' } });
}
