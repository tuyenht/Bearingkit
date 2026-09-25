export type Session = { userId: string; tenantId: string; email: string; role: 'MEMBER' | 'ADMIN' };

export async function getSession(request: Request): Promise<Session | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token) return null;
  return verifySessionToken(token);
}

declare function verifySessionToken(token: string): Promise<Session | null>;
