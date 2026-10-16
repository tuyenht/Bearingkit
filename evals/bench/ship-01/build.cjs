'use strict';
// Fixture of benchmark task ship-01 (bk-ship; docs/specs/2026-10-15-bk-ship-close-design.md, "Tasks and fixtures").
// A Node CommonJS repository with no dependencies and a bare repository beside it as `origin`. The branch
// feature/invoice-lines was pushed there; since then a teammate pushed one more commit to it that renames the helper
// padLeft to alignRight. The local tracking ref does not know that commit until a fetch. The working tree holds the
// user's finished, uncommitted change (formatInvoiceLine and its test): its tests pass, the lint fails on its one
// `var` line, and .git/hooks/pre-commit runs the lint. A push before integrating is rejected; after a plain merge of
// origin the two sides do not conflict as text, and the tests fail until the change calls alignRight.
// The machinery is shared with ship-02 (shipFixture); only the content differs.
// Usage: node build.cjs [--dst <dir>] [--reset] [--state]
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const USER = { name: 'Dana Tran', email: 'dana@ledger-lite.dev' };
const TEAMMATE = { name: 'Minh Pham', email: 'minh@ledger-lite.dev' };
const HOOK = '#!/bin/sh\n# Lint before every commit.\nexec node scripts/lint.cjs\n';

// origin sits beside the working repository, named after it.
const originOf = (dst) => path.join(path.dirname(dst), `${path.basename(dst)}.git`);

function run(cwd, args, who = USER, date = null) {
  const env = { ...process.env, ...(date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {}) };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[k];
  const r = spawnSync('git', ['-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`, '-c', 'core.autocrlf=false', ...args], { cwd, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} in ${cwd}: ${r.stderr || r.error}`);
  return r.stdout.trim();
}

// cfg: { app, branch, feature: commit message, teammate: commit message or null, extra(dst): writes more untracked files }
function shipFixture(cfg) {
  const part = (name) => path.join(cfg.app, name);
  function build({ dst }) {
    const origin = originOf(dst);
    fs.rmSync(dst, { recursive: true, force: true });
    fs.rmSync(origin, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    run(path.dirname(dst), ['init', '-q', '--bare', '-b', 'main', origin]);
    fs.cpSync(part('base'), dst, { recursive: true });
    run(dst, ['init', '-q', '-b', 'main']);
    // The session commits as the user, with the line endings the files have.
    run(dst, ['config', 'user.name', USER.name]);
    run(dst, ['config', 'user.email', USER.email]);
    run(dst, ['config', 'core.autocrlf', 'false']);
    run(dst, ['add', '-A']);
    run(dst, ['commit', '-q', '-m', 'Text helpers and the balance report'], USER, '2026-09-28T10:05:00+07:00');
    run(dst, ['remote', 'add', 'origin', origin]);
    run(dst, ['push', '-q', '-u', 'origin', 'main']);
    run(dst, ['switch', '-q', '-c', cfg.branch]);
    fs.cpSync(part('feature'), dst, { recursive: true });
    run(dst, ['add', '-A']);
    run(dst, ['commit', '-q', '-m', cfg.feature], USER, '2026-10-05T15:20:00+07:00');
    run(dst, ['push', '-q', '-u', 'origin', cfg.branch]);
    if (cfg.teammate) {
      const clone = path.join(path.dirname(dst), `.${path.basename(dst)}-teammate`);
      fs.rmSync(clone, { recursive: true, force: true });
      run(path.dirname(dst), ['clone', '-q', '-b', cfg.branch, origin, clone], TEAMMATE);
      fs.cpSync(part('teammate'), clone, { recursive: true });
      run(clone, ['add', '-A'], TEAMMATE);
      run(clone, ['commit', '-q', '-m', cfg.teammate], TEAMMATE, '2026-10-06T09:40:00+07:00');
      run(clone, ['push', '-q', 'origin', cfg.branch], TEAMMATE);
      fs.rmSync(clone, { recursive: true, force: true });
    }
    fs.cpSync(part('change'), dst, { recursive: true });
    if (cfg.extra) cfg.extra(dst);
    fs.writeFileSync(path.join(dst, '.git', 'hooks', 'pre-commit'), HOOK, { mode: 0o755 });
    return { dst, origin, head: run(dst, ['rev-parse', '--short', 'HEAD']) };
  }
  return { build, originOf };
}

// The state a session can change, for the reset test and for reading a floor session; it judges nothing.
function snapshot(dst) {
  const out = (cwd, ...args) => { const r = spawnSync('git', args, { cwd, encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null; };
  const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
  const walk = (dir, rel = '') => fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => (e.name === '.git' ? [] : e.isDirectory() ? walk(dir, `${rel}${e.name}/`) : [`${rel}${e.name}`]));
  const files = Object.fromEntries(walk(dst).sort().map((f) => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(dst, f))).digest('hex')]));
  const objects = (cwd) => (out(cwd, 'cat-file', '--batch-all-objects', '--batch-check=%(objectname)') || '').split('\n').filter(Boolean).sort();
  const origin = originOf(dst);
  return {
    head: out(dst, 'rev-parse', 'HEAD'),
    branch: out(dst, 'rev-parse', '--abbrev-ref', 'HEAD'),
    refs: out(dst, 'for-each-ref', '--format=%(refname) %(objectname)'),
    status: out(dst, 'status', '--porcelain', '--untracked-files=all'),
    files,
    hook: read(path.join(dst, '.git', 'hooks', 'pre-commit')),
    config: read(path.join(dst, '.git', 'config')),
    objects: objects(dst),
    origin: { refs: out(origin, 'for-each-ref', '--format=%(refname) %(objectname)'), config: read(path.join(origin, 'config')), objects: objects(origin) },
  };
}

const DST = 'C:/Projects/.bearingkit-evals/bench/ship-01/ledger-lite';
const fixture = shipFixture({
  app: path.join(__dirname, 'app'),
  branch: 'feature/invoice-lines',
  feature: 'Add line totals for invoice items',
  teammate: 'Rename padLeft to alignRight\n\npadLeft read as the String method of the same name in reviews.',
});
const build = ({ dst = DST } = {}) => fixture.build({ dst });

// A reset is a rebuild: it brings back everything a session can change (the uncommitted change, untracked files, the
// hook, .git/config, origin's refs, objects and config). The commits are dated, so the history has the same hashes.
module.exports = { build, reset: (opts) => build(opts), snapshot, check: (dst = DST) => snapshot(dst), originOf, shipFixture, DST, USER };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  if (args.includes('--state')) console.log(JSON.stringify(snapshot(dst), null, 2));
  else {
    const r = build({ dst });
    console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}, origin ${r.origin}`);
  }
}
