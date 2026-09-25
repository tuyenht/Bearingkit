import type { Session } from './auth';

const rank = { MEMBER: 0, ADMIN: 1 } as const;
export type Role = keyof typeof rank;

// Returns whether the session holds at least `role`. Callers decide the response, so a route can answer 403 with its
// own body, or show a reduced view, instead of every caller going through the thrown-error path.
export function requireRole(session: Session, role: Role): boolean {
  return rank[session.role] >= rank[role];
}
