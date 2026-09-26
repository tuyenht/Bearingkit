'use strict';
// Fixture of benchmark task test-01: a small pricing module with no tests, about to be refactored; the session is asked
// to pin down its current behaviour first. Scored by mutation after the session: each of twelve one-line changes to
// src/pricing.js (a boundary moved, a rounding swapped, a default dropped) is applied in turn and the session's suite
// is run against it; a mutant the suite fails on is killed. The module keeps a few quirks a test written from intent
// rather than from the code would miss: bulk pricing from 101 units, not 100; WELCOME10 floors, the bulk price rounds;
// shipping is free from the discounted amount; an unknown country is taxed at 10 %.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DST = 'C:/Projects/.bearingkit-evals/bench/test-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/test-01';
const APP = path.join(__dirname, 'app');
const TARGET = 'src/pricing.js';
const ORIGINAL_TESTS = 1;

// Each mutant changes behaviour on some input; the fixture test pins one such input per mutant.
const MUTANTS = {
  M1: ['if (item.qty > 100)', 'if (item.qty >= 100)'],
  M2: ['Math.round(total * 0.9)', 'Math.floor(total * 0.9)'],
  M3: ['subtotal >= 5000', 'subtotal > 5000'],
  M4: ['Math.floor(subtotal * 0.1)', 'Math.round(subtotal * 0.1)'],
  M5: ['Math.min(500, subtotal)', '500'],
  M6: ['const DEFAULT_TAX_RATE = 0.1;', 'const DEFAULT_TAX_RATE = 0;'],
  M7: ['if (amount >= FREE_SHIPPING_FROM)', 'if (amount > FREE_SHIPPING_FROM)'],
  M8: ['shippingFor(order.country, taxable)', 'shippingFor(order.country, subtotal)'],
  M9: ["country === 'VN' ? 3000 : 5000", "country === 'VN' ? 5000 : 5000"],
  M10: ['  if (item.qty <= 0) return 0;\n', ''],
  M11: ['Math.round(taxable * rate)', 'Math.round(subtotal * rate)'],
  M12: ['SG: 0.09', 'SG: 0.1'],
};

const CANARY = ['// Amounts are integer cents.', '// Amounts are integer cents; no floats anywhere.'];

const gitIn = (dst) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Minh Vo', '-c', 'user.email=minh@shop-pricing.io', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  const original = fs.readFileSync(path.join(APP, TARGET), 'utf8');
  for (const [id, [from]] of Object.entries({ ...MUTANTS, CANARY: CANARY })) if (original.split(from).length !== 2) throw new Error(`${id}: its text must occur once in ${TARGET}`);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  const git = gitIn(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'Order pricing: line totals, coupons, tax, shipping');
  git('update-ref', TAG, 'HEAD');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitIn(dst);
  git('checkout', '-q', '-f', 'main');
  git('reset', '-q', '--hard', TAG);
  git('clean', '-q', '-fdx');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

// The session's tests run with a bare environment: what node needs to start, no secrets, and no parent test context.
function runSuite(dst) {
  const env = {};
  for (const k of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'windir']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return spawnSync(process.execPath, ['--test', '--test-reporter=tap'], { cwd: dst, env, encoding: 'utf8', timeout: 120000 });
}

// What the session left. green: the suite passes on the original module. kept: the session left src/pricing.js as it
// was (if not, the original is put back for the mutation runs, and the session's copy restored after). added: the suite
// counts more tests than the one it had. M1..M12: the suite fails with that mutant applied. killed: how many did.
function check(dst = DST) {
  const file = path.join(dst, TARGET);
  const original = fs.readFileSync(path.join(APP, TARGET), 'utf8');
  const left = fs.readFileSync(file, 'utf8');
  const kept = left.replace(/\r\n/g, '\n') === original;
  const out = { kept };
  try {
    fs.writeFileSync(file, original);
    const base = runSuite(dst);
    out.green = base.status === 0;
    const counted = Number(((base.stdout || '').match(/^# tests (\d+)/m) || [])[1] || 0);
    out.added = counted > ORIGINAL_TESTS;
    out.tests = counted;
    // The canary changes a comment only. A suite that fails on it is locked to the file's text (a hash, a snapshot of
    // the source), not to behaviour, and would fail on any mutant; its score is withheld.
    fs.writeFileSync(file, original.replace(CANARY[0], CANARY[1]));
    out.textLocked = out.green && runSuite(dst).status !== 0;
    let killed = 0;
    for (const [id, [from, to]] of Object.entries(MUTANTS)) {
      fs.writeFileSync(file, original.replace(from, to));
      out[id] = out.green && !out.textLocked && runSuite(dst).status !== 0;
      if (out[id]) killed += 1;
    }
    out.killed = killed;
  } finally {
    fs.writeFileSync(file, left);
  }
  return out;
}

module.exports = { build, reset, check, DST, TAG, MUTANTS };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  if (args.includes('--check')) console.log(JSON.stringify(check(dst)));
  else {
    const r = args.includes('--reset') ? reset({ dst }) : build({ dst });
    console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
  }
}
