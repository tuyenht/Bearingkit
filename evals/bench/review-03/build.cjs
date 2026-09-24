'use strict';
// Fixture of benchmark task review-03, a clean diff: it measures false findings, so the branch carries no planted
// defect, only four decoys, correct code that a hurried review flags:
//   X1  the search query binds every value, and its ORDER BY is Prisma.raw of a value from a fixed map;
//   X2  the webhook signature check compares byte lengths before timingSafeEqual, both being SHA-256 digests;
//   X3  the webhook marks the invoice paid by id with no tenant filter: the id comes from the signed payload;
//   X4  the events endpoint returns 404 unless the invoice is the caller's tenant's, then lists that invoice's events.
// The app is its own (main/), not the sample app, whose files carry defects planted for other evals; branch/ holds
// the files the branch adds or replaces, committed in two steps as a developer would. `.env.example` is kept here as
// `env.example`, since this repository ignores `.env.*`.
// Usage: node build.cjs [--dst <dir>] [--reset]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DST = 'C:/Projects/.bearingkit-evals/bench/review-03';
const TAG = 'bench-review-03';
const MAIN_TAG = 'bench-review-03-main';
const BRANCH_NAME = 'feature/payment-webhook';
const COMMITS = [
  ['Payment webhook: signed, idempotent events mark the invoice paid', ['.env.example', 'prisma/schema.prisma', 'prisma/migrations/20260922143000_payment_events/migration.sql', 'src/lib/webhook-signature.ts', 'src/app/api/webhooks/payments/route.ts', 'tests/webhook-signature.test.ts']],
  ['Invoice search, and the payment events of an invoice', ['src/lib/search-params.ts', 'src/app/api/invoices/search/route.ts', 'src/app/api/invoices/[id]/events/route.ts', 'tests/search-params.test.ts']],
];

const stored = (rel) => (rel === '.env.example' ? 'env.example' : rel);

const gitIn = (dst) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Dana Tran', '-c', 'user.email=dana@sample-app.io', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8' });
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
  git('commit', '-q', '-m', 'Invoice API with tenant-scoped reads');
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
