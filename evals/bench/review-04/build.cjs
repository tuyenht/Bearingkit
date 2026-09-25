'use strict';
// Fixture of benchmark task review-04, a pull request of realistic size: 29 files change over four commits, most of
// them benign (a repository refactor, multi-currency formatting, a revenue report, structured logs, docs, lint), with
// three planted defects and two decoys among them:
//   D1  requireRole now returns a boolean instead of throwing; the branch updates the users route, but the unchanged
//       export route (outside the diff) still calls it as a statement, so any member downloads the tenant's full CSV;
//   D2  the new repository's findByNumber takes the tenant id and does not use it, so the new by-number route reads
//       another tenant's invoice, customer and payments;
//   D3  voiding an invoice sets VOID and then creates the credit note, outside a transaction, inside a try whose catch
//       only logs, and the route answers 200 either way: a failed credit note leaves a void invoice with no credit;
//   X1  the revenue report is raw SQL through Prisma.sql, every value bound;
//   X2  the exchange-rate cache is process-wide with no tenant in its key, correctly: the rates are the same for all.
// The app is its own (main/), not the sample app; branch/ holds the files the branch adds or replaces. `.env.example`
// is kept here as `env.example`, since this repository ignores `.env.*`.
// Usage: node build.cjs [--dst <dir>] [--reset]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DST = 'C:/Projects/.bearingkit-evals/bench/review-04';
const TAG = 'bench-review-04';
const MAIN_TAG = 'bench-review-04-main';
const BRANCH_NAME = 'feature/billing-q4';
const COMMITS = [
  ['Move invoice and payment queries into repositories; look invoices up by number', [
    'src/repos/invoices.ts', 'src/repos/payments.ts', 'src/app/api/invoices/route.ts', 'src/app/api/invoices/[id]/route.ts',
    'src/app/api/invoices/[id]/pay/route.ts', 'src/app/api/invoices/by-number/[number]/route.ts', 'tests/repos/invoices.test.ts',
  ]],
  ['Roles return a decision; admin routes answer 403 themselves', [
    'src/lib/roles.ts', 'src/lib/auth.ts', 'src/lib/http.ts', 'src/app/api/admin/users/route.ts', 'tests/roles.test.ts',
  ]],
  ['Void an invoice with a credit note', [
    'prisma/schema.prisma', 'prisma/migrations/20260920100000_credit_notes/migration.sql', 'src/lib/credit-notes.ts',
    'src/app/api/invoices/[id]/void/route.ts', 'tests/credit-notes.test.ts',
  ]],
  ['Multi-currency amounts, revenue report, structured logs, docs and lint', [
    'src/lib/money.ts', 'src/lib/fx.ts', 'src/lib/logger.ts', 'src/app/api/reports/revenue/route.ts', 'tests/money.test.ts',
    'tests/fx.test.ts', 'README.md', 'docs/api.md', 'docs/adr/0003-repositories.md', '.eslintrc.json', 'package.json', '.env.example',
  ]],
];

const stored = (rel) => (rel === '.env.example' ? 'env.example' : rel);

const gitIn = (dst) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Linh Pham', '-c', 'user.email=linh@billing-app.io', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(path.join(__dirname, 'main'), dst, { recursive: true });
  fs.renameSync(path.join(dst, stored('.env.example')), path.join(dst, '.env.example'));
  const git = gitIn(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'Billing API: invoices, payments, admin tools');
  git('tag', '-f', MAIN_TAG);
  git('checkout', '-q', '-b', BRANCH_NAME);
  for (const [message, files] of COMMITS) {
    for (const rel of files) {
      fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true });
      fs.copyFileSync(path.join(__dirname, 'branch', stored(rel)), path.join(dst, rel));
    }
    git('add', '-A');
    git('commit', '-q', '-m', message);
  }
  git('tag', '-f', TAG);
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitIn(dst);
  git('checkout', '-q', '-f', BRANCH_NAME);
  git('reset', '-q', '--hard', TAG);
  git('branch', '-f', 'main', MAIN_TAG);
  git('clean', '-q', '-fdx');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

module.exports = { build, reset, DST, TAG, COMMITS };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  const r = args.includes('--reset') ? reset({ dst }) : build({ dst });
  console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
}
