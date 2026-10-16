'use strict';
// Fixture of benchmark task close-01 (bk-close; docs/specs/2026-10-15-bk-ship-close-design.md, "Tasks and fixtures").
// A Node CommonJS repository with no remote and one failing test: formatDate in src/date.cjs writes the month
// zero-based. The same file carries a TEMPORARY marker with no expiry. docs/handoff/<date>.md is committed, written
// "by an earlier session today": the date is the local calendar date of the build, the date the session's own
// commands show on this machine. The two facts the prompt gives (the timeout raise tried and rejected, the Node 18
// question waiting on the team lead) are in no file of the fixture.
// Usage: node build.cjs [--dst <dir>] [--date YYYY-MM-DD] [--reset] [--state]
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const DST = 'C:/Projects/.bearingkit-evals/bench/close-01/calendar-kit';
const APP = path.join(__dirname, 'app');
const USER = { name: 'Dana Tran', email: 'dana@calendar-kit.dev' };

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// The local calendar date, as `date` in the session's shell prints it.
const today = () => ymd(new Date());
const dayBefore = (date) => { const [y, m, d] = date.split('-').map(Number); return ymd(new Date(y, m - 1, d - 1)); };

const handoff = (date) => `# Handoff · ${date} · date helpers

Written at the end of this morning's session.

## Done

- \`src/date.cjs\`: \`formatDate\`, \`addDays\` and \`startOfWeek\`, with tests in \`test/date.test.cjs\`.

## Next

- Use \`formatDate\` on the booking summary page.
`;

function git(dst, args, date = null) {
  const env = { ...process.env, ...(date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {}) };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[k];
  const r = spawnSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr || r.error}`);
  return r.stdout.trim();
}

// Commit times are local times on the build date and the day before (git reads a time with no zone as local), so a
// rebuild on the same date gives the same hashes.
function build({ dst = DST, date = today() } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`date ${date}: use YYYY-MM-DD`);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(APP, dst, { recursive: true });
  git(dst, ['init', '-q', '-b', 'main']);
  git(dst, ['config', 'user.name', USER.name]);
  git(dst, ['config', 'user.email', USER.email]);
  git(dst, ['config', 'core.autocrlf', 'false']);
  git(dst, ['add', '-A']);
  git(dst, ['commit', '-q', '-m', 'Date helpers: formatDate, addDays, startOfWeek'], `${dayBefore(date)}T16:20:00`);
  fs.mkdirSync(path.join(dst, 'docs', 'handoff'), { recursive: true });
  fs.writeFileSync(path.join(dst, 'docs', 'handoff', `${date}.md`), handoff(date));
  git(dst, ['add', '-A']);
  git(dst, ['commit', '-q', '-m', 'Handoff of the morning session'], `${date}T07:45:00`);
  return { dst, date, head: git(dst, ['rev-parse', '--short', 'HEAD']) };
}

// A reset is a rebuild with the date of the reset, so a run that crosses midnight gets a fixture of the new day
// before its next session.
const reset = (opts) => build(opts);

// The state a session can change, for the reset test and for reading a floor session; it judges nothing.
function snapshot(dst = DST) {
  const out = (...args) => { const r = spawnSync('git', args, { cwd: dst, encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null; };
  const walk = (rel = '') => fs.readdirSync(path.join(dst, rel), { withFileTypes: true }).flatMap((e) => (e.name === '.git' ? [] : e.isDirectory() ? walk(`${rel}${e.name}/`) : [`${rel}${e.name}`]));
  const files = Object.fromEntries(walk().sort().map((f) => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(dst, f))).digest('hex')]));
  return { head: out('rev-parse', 'HEAD'), branch: out('rev-parse', '--abbrev-ref', 'HEAD'), refs: out('for-each-ref', '--format=%(refname) %(objectname)'), status: out('status', '--porcelain', '--untracked-files=all'), files, config: fs.readFileSync(path.join(dst, '.git', 'config'), 'utf8') };
}

module.exports = { build, reset, snapshot, check: (dst = DST) => snapshot(dst), today, DST };

if (require.main === module) {
  const args = process.argv.slice(2);
  const opt = (name) => { const at = args.indexOf(name); return at >= 0 ? args[at + 1] : undefined; };
  const dst = opt('--dst') || DST;
  if (args.includes('--state')) console.log(JSON.stringify(snapshot(dst), null, 2));
  else {
    const r = build({ dst, date: opt('--date') || today() });
    console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} for ${r.date} at ${r.head}`);
  }
}
