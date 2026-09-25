import { describe, expect, it } from 'vitest';
import { requireRole } from '@/lib/roles';

const session = (role: 'MEMBER' | 'ADMIN') => ({ userId: 'u1', tenantId: 't1', email: 'a@b.c', role });

describe('requireRole', () => {
  it('lets an admin through admin checks', () => {
    expect(requireRole(session('ADMIN'), 'ADMIN')).toBe(true);
  });
  it('refuses a member on admin checks', () => {
    expect(requireRole(session('MEMBER'), 'ADMIN')).toBe(false);
  });
  it('lets everyone through member checks', () => {
    expect(requireRole(session('MEMBER'), 'MEMBER')).toBe(true);
  });
});
