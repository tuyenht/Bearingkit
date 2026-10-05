'use strict';
// Fixture of benchmark task plan-01 (registered in docs/specs/2026-10-03-bk-plan-design.md): the helpdesk service of
// spec-01 with an approved input spec (docs/specs/csat-rating.md: a satisfaction rating, and a rename of assignee_id
// "while we are here") and a third nightly job whose export another team's job reads. The session is asked for an
// implementation plan under docs/plans/, not for code. The plan is read by two blind readers against rubric.md
// (evals/analysis/plan-readers.cjs); this file only says what the session left: O1 (a plan exists), O2 (nothing
// built, the suite green), reach, and the plan's text, kept for the readers.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { events } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/plan-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/plan-01';
const APP = path.join(__dirname, 'app');
const PLANS = 'docs/plans';
const MIN_CHARS = 400;
const REFERENCES = ['writing-plans', 'vertical-slices'];
const DEFAULTS = { suiteMs: 120000 };

const gitAt = (dir) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Mai Do', '-c', 'user.email=mai@helpdesk.example', '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  const git = gitAt(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'helpdesk: tickets, portal, nightly jobs');
  git('update-ref', TAG, 'HEAD');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitAt(dst);
  git('checkout', '-q', '-f', 'main');
  git('reset', '-q', '--hard', TAG);
  git('clean', '-q', '-fdx');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

// What the session left, from git: [status, path] relative to the fixture root.
function status(dst) {
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: dst, encoding: 'utf8' });
  return r.stdout.split('\n').filter(Boolean).map((l) => [l.slice(0, 2), l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop()]);
}

// Every file under docs/plans/, as paths relative to the fixture root with forward slashes, in path order.
function planFiles(dst) {
  const out = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(dst, rel), { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${rel}/${e.name}`);
      else if (e.isFile()) out.push(`${rel}/${e.name}`);
    }
  };
  if (fs.existsSync(path.join(dst, PLANS))) walk(PLANS);
  return out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

// The plan as one text for the readers: each file in path order, opened by one line that names it.
function planText(dst) {
  const files = planFiles(dst).map((rel) => ({ rel, text: fs.readFileSync(path.join(dst, rel), 'utf8') }));
  return {
    files: files.map((f) => f.rel),
    chars: files.reduce((n, f) => n + f.text.trim().length, 0),
    plan: files.map((f) => `===== ${f.rel} =====\n${f.text.replace(/\r\n?/g, '\n').replace(/\n*$/, '\n')}`).join('\n'),
  };
}

// Whether the session entered through bk-plan, and which of its references it opened.
function reach(raw) {
  const out = { skill: false, opened: [] };
  for (const e of events(raw)) for (const c of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
    if (c.type !== 'tool_use') continue;
    const i = c.input || {};
    if (c.name === 'Skill' && /(^|:)bk-plan$/.test(String(i.skill || i.name || i.command || '').trim().replace(/^\//, '').split(/\s/)[0])) out.skill = true;
    if (!['Read', 'Grep', 'Bash', 'PowerShell'].includes(c.name)) continue;
    const input = JSON.stringify(i).replace(/\\\\/g, '/');
    for (const name of REFERENCES) if (new RegExp(`bk-plan/references/${name}\\.md\\b`).test(input) && !out.opened.includes(name)) out.opened.push(name);
  }
  return out;
}

// What the session left, and, with its stream, how it got there. Ids follow the registration's table.
function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const p = planText(dst);
  const out = { O1: p.files.length > 0 && p.chars >= MIN_CHARS, planFiles: p.files, planChars: p.chars };
  // The plan itself, kept with the checks: the fixture is reset before the next session, and the readers need it.
  out.plan = p.plan;
  // Uncommitted changes, and anything a session committed on top of the fixture's own commit.
  const committed = spawnSync('git', ['diff', '--name-only', '--no-renames', TAG, 'HEAD'], { cwd: dst, encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
  const outside = [...new Set([...status(dst).map(([, f]) => f), ...committed])].filter((f) => !/^docs\//.test(f));
  // Without the parent's test context: under `node --test` a nested run would otherwise report itself to the parent
  // and exit 0 whatever the fixture's tests do.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const suite = spawnSync('node', ['--test'], { cwd: dst, encoding: 'utf8', timeout: o.suiteMs, env });
  out.suite = suite.status === 0;
  out.outside = outside.length;
  out.O2 = out.suite && outside.length === 0;
  if (raw !== null) {
    const r = reach(raw);
    out.Rskill = r.skill;
    for (const name of REFERENCES) out[`R_${name}`] = r.opened.includes(name);
  }
  return out;
}

module.exports = { build, reset, check, planFiles, planText, reach, DST, TAG, PLANS, MIN_CHARS, REFERENCES };

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
