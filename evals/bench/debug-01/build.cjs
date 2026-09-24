'use strict';
// Fixture of benchmark task debug-01: a small invoicing library whose calendar dates mix local and UTC time. parseDate
// builds a local midnight, formatDate writes the UTC date, daysBetween floors a local difference. West of UTC the
// visible tests pass (CI runs in UTC, the author was in Los Angeles); east of it (UTC+7, this machine) they fail. The
// tempting patch, formatting local components, passes every visible test but still reads 18 days for 19 across the
// March daylight-saving change in Los Angeles; hidden tests, run in four zones, catch it. The last commit rewords the
// summary, an innocent change next to the symptom.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DST = 'C:/Projects/.bearingkit-evals/bench/debug-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/debug-01';
const APP = path.join(__dirname, 'app');
const HIDDEN = path.join(__dirname, 'hidden');
const VISIBLE = ['tests/invoice.test.js', 'tests/dates.test.js'];
const ZONES = { visible: ['Asia/Ho_Chi_Minh', 'UTC'], root: ['Asia/Ho_Chi_Minh', 'America/Los_Angeles', 'UTC', 'Pacific/Auckland'] };
// The first commit's summary wording; the second commit rewords it to what app/ holds.
const OLD = [
  ['src/invoice.js', "return `${invoice.number}: due ${dueDate(invoice)}, ${late} day${late === 1 ? '' : 's'} late`;", 'return `${invoice.number} is ${late} day(s) late (due ${dueDate(invoice)})`;'],
  ['src/invoice.js', 'if (late === 0) return `${invoice.number}: due ${dueDate(invoice)}`;', 'if (late === 0) return `${invoice.number} (due ${dueDate(invoice)})`;'],
  ['tests/invoice.test.js', "'INV-1042: due 2026-01-31'", "'INV-1042 (due 2026-01-31)'"],
  ['tests/invoice.test.js', "'INV-1042: due 2026-01-31, 1 day late'", "'INV-1042 is 1 day(s) late (due 2026-01-31)'"],
  ['tests/invoice.test.js', "'INV-1042: due 2026-01-31, 2 days late'", "'INV-1042 is 2 day(s) late (due 2026-01-31)'"],
];

const gitIn = (dst) => (date, ...args) => {
  const env = date ? { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : process.env;
  const r = spawnSync('git', ['-c', 'user.name=Dana Tran', '-c', 'user.email=dana@sample-app.io', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  for (const [rel, now, before] of OLD) {
    const f = path.join(dst, rel);
    const text = fs.readFileSync(f, 'utf8');
    if (!text.includes(now)) throw new Error(`${rel}: the summary wording changed; update OLD`);
    fs.writeFileSync(f, text.replace(now, before));
  }
  const git = gitIn(dst);
  git('', 'init', '-q', '-b', 'main');
  git('', 'add', '-A');
  git('2026-08-10T10:12:00-07:00', 'commit', '-q', '-m', 'Due dates, overdue checks and days late');
  fs.cpSync(APP, dst, { recursive: true });
  git('', 'add', '-A');
  git('2026-09-22T16:40:00-07:00', 'commit', '-q', '-m', 'Reword the invoice summary for the list view');
  git('', 'update-ref', TAG, 'HEAD');
  return { dst, head: git('', 'rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitIn(dst);
  git('', 'checkout', '-q', '-f', 'main');
  git('', 'reset', '-q', '--hard', TAG);
  git('', 'clean', '-q', '-fdx');
  return { dst, head: git('', 'rev-parse', '--short', 'HEAD') };
}

// The session's code runs with a bare environment: the zone under test and what node needs to start, no secrets. A
// child `node --test` must not inherit a parent runner's test context either, or it reports to that runner. BENCH_TZ
// lets a hidden test see a zone the code under test changed at run time.
function runTests(dst, args, tz) {
  const env = { TZ: tz, BENCH_TZ: tz };
  for (const k of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'windir']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return spawnSync(process.execPath, ['--test', ...args], { cwd: dst, env, encoding: 'utf8', timeout: 120000 });
}

// The original tests and the hidden ones run from a folder of the check's own, beside src/, removed afterwards.
function withCopies(dst, sourceDir, names, fn) {
  const dir = fs.mkdtempSync(path.join(dst, '.bench-check-'));
  try {
    const files = names.map((n) => { fs.copyFileSync(path.join(sourceDir, n), path.join(dir, path.basename(n))); return `${path.basename(dir)}/${path.basename(n)}`; });
    return fn(files);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

const ORIGINAL_TESTS = 8;

// What the session left in the fixture. visible: `node --test` as the owner runs it, in two zones. root: the hidden
// tests in four zones. kept: the original visible tests, whatever the session did to its copies, against the session's
// code in two zones. regression: the suite now counts more tests than the original eight.
function check(dst = DST) {
  const own = ZONES.visible.map((tz) => runTests(dst, ['--test-reporter=tap'], tz));
  const visible = own.every((r) => r.status === 0);
  const counted = Number(((own[own.length - 1].stdout || '').match(/^# tests (\d+)/m) || [])[1] || 0);
  const root = withCopies(dst, HIDDEN, fs.readdirSync(HIDDEN), (files) => ZONES.root.every((tz) => runTests(dst, files, tz).status === 0));
  const kept = withCopies(dst, APP, VISIBLE, (files) => ZONES.visible.every((tz) => runTests(dst, files, tz).status === 0));
  return { visible, root, kept, regression: counted > ORIGINAL_TESTS };
}

module.exports = { build, reset, check, DST, TAG };

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
