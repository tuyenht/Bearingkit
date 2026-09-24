'use strict';
// Fixture of benchmark task review-02, harder than review-01 by design: its defects are kept only if a session with no
// plugin misses them. The sample-app without its README; on `main` every invoice route calls a tenant check that
// throws, and a small in-process memo cache exists; the branch `feature/invoice-stats` carries three candidate
// defects and one decoy:
//   H1  assertTenant now returns null instead of throwing; the branch updates GET, but the unchanged pay route (not in
//       the diff) still awaits it and ignores the result, so any tenant can mark any invoice paid;
//   H2  the new stats endpoint memoizes tenant data under the key 'invoice-stats', with no tenant in the key;
//   H3  its error branch logs every request header, the bearer token included;
//   X1  the same endpoint memoizes exchange rates under 'fx-rates', with no tenant in the key: global data, correct.
// Usage: node build.cjs [--dst <dir>] [--reset]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SRC = path.join(__dirname, '..', '..', 'fixtures', 'sample-app');
const DST = 'C:/Projects/.bearingkit-evals/bench/review-02';
const TAG = 'bench-review-02';
const BRANCH_NAME = 'feature/invoice-stats';

const gitIn = (dst) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Dana Tran', '-c', 'user.email=dana@sample-app.io', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

const MAIN = {
  'src/lib/auth.ts': `export type Session = { userId: string; tenantId: string; email: string };

export async function getSession(request: Request): Promise<Session | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token) return null;
  return verifySessionToken(token);
}

declare function verifySessionToken(token: string): Promise<Session | null>;
`,
  'src/lib/db.ts': `import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();
`,
  'src/lib/tenancy.ts': `import { db } from '@/lib/db';
import type { Session } from '@/lib/auth';

export class ForbiddenError extends Error {}

// Throws unless the invoice belongs to the caller's tenant.
export async function assertTenant(session: Session, invoiceId: string) {
  const invoice = await db.invoice.findFirst({ where: { id: invoiceId, tenantId: session.tenantId } });
  if (!invoice) throw new ForbiddenError('invoice not found for this tenant');
  return invoice;
}
`,
  'src/lib/memo.ts': `const store = new Map<string, { at: number; value: unknown }>();

// In-process cache for values that are expensive to compute and may be a little stale.
export async function memo<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlSeconds * 1000) return hit.value as T;
  const value = await load();
  store.set(key, { at: Date.now(), value });
  return value;
}
`,
  'src/app/api/invoices/[id]/route.ts': `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { assertTenant, ForbiddenError } from '@/lib/tenancy';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const invoice = await assertTenant(session, params.id);
    return NextResponse.json(invoice);
  } catch (err) {
    if (err instanceof ForbiddenError) return NextResponse.json({ error: 'not found' }, { status: 404 });
    throw err;
  }
}
`,
  'src/app/api/invoices/[id]/pay/route.ts': `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertTenant } from '@/lib/tenancy';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await assertTenant(session, params.id);
  await db.invoice.update({ where: { id: params.id }, data: { status: 'paid', paidAt: new Date() } });
  return NextResponse.json({ id: params.id, status: 'paid' });
}
`,
};

const BRANCH = {
  'src/lib/tenancy.ts': `import { db } from '@/lib/db';
import type { Session } from '@/lib/auth';

// The invoice when it belongs to the caller's tenant, null otherwise, so each route picks its own status code.
export async function assertTenant(session: Session, invoiceId: string) {
  return db.invoice.findFirst({ where: { id: invoiceId, tenantId: session.tenantId } });
}
`,
  'src/app/api/invoices/[id]/route.ts': `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { assertTenant } from '@/lib/tenancy';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const invoice = await assertTenant(session, params.id);
  if (!invoice) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(invoice);
}
`,
  'src/lib/fx.ts': `export type FxRates = { base: string; rates: Record<string, number> };

export async function fetchFxRates(): Promise<FxRates> {
  const res = await fetch('https://api.frankfurter.app/latest?from=USD');
  if (!res.ok) throw new Error(\`fx rates: HTTP \${res.status}\`);
  return (await res.json()) as FxRates;
}
`,
  'src/app/api/invoices/stats/route.ts': `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { fetchFxRates } from '@/lib/fx';
import { memo } from '@/lib/memo';

// Totals per status for the dashboard, with the day's exchange rates so the client can show other currencies.
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const [stats, fx] = await Promise.all([
      memo('invoice-stats', 60, () =>
        db.invoice.groupBy({ by: ['status'], where: { tenantId: session.tenantId }, _sum: { amount: true }, _count: true })),
      memo('fx-rates', 3600, () => fetchFxRates()),
    ]);
    return NextResponse.json({ stats, fx });
  } catch (err) {
    console.error('invoice stats failed', { err, headers: Object.fromEntries(request.headers) });
    return NextResponse.json({ error: 'stats unavailable' }, { status: 500 });
  }
}
`,
};

function writeAll(dst, files) {
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(dst, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  }
}

function build({ dst = DST, src = SRC } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, { recursive: true });
  fs.rmSync(path.join(dst, 'README.md'), { force: true });
  const git = gitIn(dst);
  writeAll(dst, MAIN);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'Invoice routes check the tenant; in-process memo cache');
  git('checkout', '-q', '-b', BRANCH_NAME);
  writeAll(dst, BRANCH);
  git('add', '-A');
  git('commit', '-q', '-m', 'Invoice stats endpoint for the dashboard; tenant check returns the invoice or null');
  git('tag', '-f', TAG);
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitIn(dst);
  git('checkout', '-q', '-f', BRANCH_NAME);
  git('reset', '-q', '--hard', TAG);
  git('branch', '-f', 'main', `${TAG}~1`);
  git('clean', '-q', '-fdx');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

module.exports = { build, reset, DST, TAG };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  const r = args.includes('--reset') ? reset({ dst }) : build({ dst });
  console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
}
