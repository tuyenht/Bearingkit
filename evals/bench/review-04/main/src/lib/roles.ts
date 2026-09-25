import type { Session } from './auth';
import { HttpError } from './http';

const rank = { MEMBER: 0, ADMIN: 1 } as const;

// Throws a 403 unless the session holds at least `role`; `handle` turns it into the response.
export function requireRole(session: Session, role: keyof typeof rank): void {
  if (rank[session.role] < rank[role]) throw new HttpError(403, 'forbidden');
}
