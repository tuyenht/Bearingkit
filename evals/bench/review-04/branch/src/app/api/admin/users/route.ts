import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { forbidden, handle, json, unauthorized } from '@/lib/http';
import { requireRole } from '@/lib/roles';

export async function GET(request: Request) {
  return handle(async () => {
    const session = await getSession(request);
    if (!session) return unauthorized();
    if (!requireRole(session, 'ADMIN')) return forbidden();
    const users = await db.user.findMany({ where: { tenantId: session.tenantId }, select: { id: true, email: true, role: true } });
    return json({ users });
  });
}
