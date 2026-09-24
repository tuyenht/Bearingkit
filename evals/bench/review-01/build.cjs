'use strict';
// Fixture of benchmark task review-01: the sample-app
// without its README, a `main` where invoices are tenant-scoped and a nightly job reminds customers of overdue
// invoices, and a branch `feature/invoice-export` whose one commit carries three defects and one decoy:
//   D1  DELETE checks the tenant of the invoice in the URL, then deletes the ids from the body with no tenant scope;
//   D2  the export route accepts a logo URL on a bare startsWith against the CDN host, then fetches it server-side;
//   D3  the branch adds the status `void`, and the reminder job on main (not in the diff) selects every status but
//       `paid` and `draft`, so voided invoices get payment reminders;
//   X1  the export route sums line items with Prisma's tagged-template $queryRaw, a prepared statement: not a defect.
// Built outside the checkout, like every measured fixture, so no memory file of this repository sits above it.
// Usage: node build.cjs [--dst <dir>] [--reset]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SRC = path.join(__dirname, '..', '..', 'fixtures', 'sample-app');
const DST = 'C:/Projects/.bearingkit-evals/bench/review-01';
const TAG = 'bench-review-01';

const gitIn = (dst) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Dana Tran', '-c', 'user.email=dana@sample-app.io', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

const ROUTE_GET = `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const invoice = await db.invoice.findFirst({ where: { id: params.id, tenantId: session.tenantId } });
  if (!invoice) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(invoice);
}
`;

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
  'src/lib/email.ts': `export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await fetch(process.env.MAILER_URL ?? 'http://localhost:8025/send', { method: 'POST', body: JSON.stringify({ to, subject, body }) });
}
`,
  'src/lib/invoice-status.ts': `export const INVOICE_STATUSES = ['draft', 'sent', 'paid'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
`,
  'src/jobs/payment-reminders.ts': `import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Nightly: remind customers of invoices past their due date.
export async function sendPaymentReminders(now = new Date()) {
  const overdue = await db.invoice.findMany({
    where: { status: { notIn: ['paid', 'draft'] }, dueDate: { lt: now } },
  });
  for (const invoice of overdue) {
    await sendEmail(invoice.customerEmail, 'Payment reminder', \`Invoice \${invoice.number} is overdue.\`);
  }
  return overdue.length;
}
`,
  'src/app/api/invoices/[id]/route.ts': ROUTE_GET,
};

const BRANCH = {
  'src/app/api/invoices/[id]/route.ts': `${ROUTE_GET}
// Deletes the invoice, or a selection of invoices when the list page sends several ids.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const invoice = await db.invoice.findFirst({ where: { id: params.id, tenantId: session.tenantId } });
  if (!invoice) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) && body.ids.length ? body.ids : [params.id];
  const result = await db.invoice.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ deleted: result.count });
}
`,
  'src/app/api/invoices/[id]/export/route.ts': `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { renderInvoicePdf } from '@/lib/pdf';

const LOGO_HOST = 'https://cdn.sample-app.io';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const invoice = await db.invoice.findFirst({ where: { id: params.id, tenantId: session.tenantId } });
  if (!invoice) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { logoUrl } = await request.json().catch(() => ({ logoUrl: undefined }));
  if (logoUrl && !String(logoUrl).startsWith(LOGO_HOST)) {
    return NextResponse.json({ error: 'logo must be hosted on our CDN' }, { status: 400 });
  }
  const logo = logoUrl ? Buffer.from(await (await fetch(logoUrl)).arrayBuffer()) : undefined;

  const [{ total }] = await db.$queryRaw<{ total: number }[]>\`SELECT COALESCE(SUM(amount), 0) AS total FROM "LineItem" WHERE "invoiceId" = \${invoice.id}\`;

  const pdf = await renderInvoicePdf(invoice, { logo, total });
  return new NextResponse(pdf, { headers: { 'content-type': 'application/pdf' } });
}
`,
  'src/app/api/invoices/[id]/void/route.ts': `import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// Voids a sent invoice: it stays on record for the audit trail but is no longer owed.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const updated = await db.invoice.updateMany({
    where: { id: params.id, tenantId: session.tenantId, status: 'sent' },
    data: { status: 'void' },
  });
  if (updated.count === 0) return NextResponse.json({ error: 'not found or not voidable' }, { status: 404 });
  return NextResponse.json({ id: params.id, status: 'void' });
}
`,
  'src/lib/invoice-status.ts': `export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'void'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
`,
  'src/lib/pdf.ts': `export async function renderInvoicePdf(invoice: unknown, options: { logo?: Buffer; total: number }): Promise<Uint8Array> {
  return new TextEncoder().encode(JSON.stringify({ invoice, total: options.total, hasLogo: Boolean(options.logo) }));
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
  git('commit', '-q', '-m', 'Invoice detail endpoint scoped to the tenant; nightly payment reminders');
  git('checkout', '-q', '-b', 'feature/invoice-export');
  writeAll(dst, BRANCH);
  git('add', '-A');
  git('commit', '-q', '-m', 'Invoice export to PDF with a custom logo and totals; bulk delete from the list page; void an invoice');
  git('tag', '-f', TAG);
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

// Between sessions: back to the branch and its commit, nothing untracked, main untouched.
function reset({ dst = DST } = {}) {
  const git = gitIn(dst);
  git('checkout', '-q', '-f', 'feature/invoice-export');
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
