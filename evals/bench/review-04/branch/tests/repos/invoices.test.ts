import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.fn();
const findFirst = vi.fn();
const updateMany = vi.fn();
vi.mock('@/lib/db', () => ({ db: { invoice: { findMany, findFirst, updateMany } } }));

const repo = await import('@/repos/invoices');

describe('invoice repository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists only the tenant’s invoices', async () => {
    await repo.listForTenant('t1', { status: 'OPEN' });
    expect(findMany.mock.calls[0][0].where).toEqual({ tenantId: 't1', status: 'OPEN' });
  });

  it('reads one invoice within the tenant', async () => {
    await repo.getForTenant('t1', 'inv_1');
    expect(findFirst.mock.calls[0][0].where).toEqual({ id: 'inv_1', tenantId: 't1' });
  });

  it('marks paid within the tenant', async () => {
    await repo.markPaid('t1', 'inv_1');
    expect(updateMany.mock.calls[0][0].where).toEqual({ id: 'inv_1', tenantId: 't1' });
  });
});
