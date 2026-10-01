'use strict';
// Fixture of benchmark task shell-01 (registered in docs/specs/2026-10-01-stack-shell-design.md): a small repository of
// release scripts for Windows PowerShell 5.1, with no manifest, asked for a script that exports a repository's commits
// as JSON for another program. Scored after the session by running its own
// `scripts\Export-ReleaseNotes.ps1 -RepoPath <dir> -OutFile <file>` on git repositories the scorer builds: H1 a failing
// native command, H2 a file without a byte-order mark, H3 non-ASCII text, H4 nested JSON, H5 a list of one, H6 a path
// with brackets, each a sentence of stacks/shell.md; O1 the happy path, O2 the suite, X a subject with a quote and a
// backslash (the control). The interpreter is process.env.BENCH_POWERSHELL, else `powershell` on the PATH.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { commitAttempts, reach } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/shell-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/shell-01';
const APP = path.join(__dirname, 'app');
const PS = process.env.BENCH_POWERSHELL || 'powershell';
const SCRIPT = 'scripts/Export-ReleaseNotes.ps1';
// Each run killed at runMs; the suite at suiteMs.
const DEFAULTS = { runMs: 60000, suiteMs: 180000 };

const gitAt = (dir, who = ['Minh Pham', 'minh@release-ops.dev'], env = {}) => (...args) => {
  const r = spawnSync('git', ['-c', `user.name=${who[0]}`, '-c', `user.email=${who[1]}`, '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8', env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  const git = gitAt(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'release scripts: repository summary');
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

// A bare environment: what PowerShell and git need to start on Windows, no secrets, no parent test context. No git
// repository above the scorer's temporary directory is ever consulted.
function bareEnv(extra = {}) {
  const env = {};
  for (const k of ['PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'SystemDrive', 'TEMP', 'TMP', 'windir', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'ProgramData', 'ProgramFiles', 'ProgramFiles(x86)', 'ComSpec', 'PSModulePath']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return { ...env, GIT_CEILING_DIRECTORIES: os.tmpdir(), GIT_CONFIG_NOSYSTEM: '1', ...extra };
}
const missing = (err) => { const e = new Error(`${PS} not found (${err.code}); set BENCH_POWERSHELL to the interpreter`); e.code = 'ENOENT'; return e; };

// `powershell -File <script> <args>` in dir, killed at killMs. Arguments go straight to argv, no shell.
function runPs(dir, script, args, env, killMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(PS, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, ...args], { cwd: dir, env, windowsHide: true });
    let stdout = '';
    let stderr = '';
    let killed = false;
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => { killed = true; child.kill('SIGKILL'); }, killMs);
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, killed, ms: Date.now() - started, stdout, stderr }); });
    child.on('error', (err) => { clearTimeout(timer); if (err.code === 'ENOENT') reject(missing(err)); else resolve({ code: null, killed, ms: Date.now() - started, stdout, stderr }); });
  });
}

// The repositories the scorer exports. Commits oldest first: [author name, author email, subject].
const PLAIN = [
  ['Minh Pham', 'minh@release-ops.dev', 'Add invoice export'],
  ['Lan Vu', 'lan@release-ops.dev', 'Fix the uploader retry'],
  ['Minh Pham', 'minh@release-ops.dev', 'Bump the build number'],
];
const QUOTED = [
  ['Lan Vu', 'lan@release-ops.dev', 'Fix "quoted" path C:\\temp\\x in the uploader'],
  ['Minh Pham', 'minh@release-ops.dev', 'Tidy up'],
];
const VIET = [
  ['Trần Thị Hồng', 'hong@release-ops.dev', 'Sửa lỗi xuất báo cáo tháng'],
  ['Nguyễn Văn Đức', 'duc@release-ops.dev', 'Thêm kiểm tra số dư'],
];
const ONE = [['Lan Vu', 'lan@release-ops.dev', 'Initial import']];

// A repository at dir with those commits; returns them newest first, as the export must list them.
function makeRepo(dir, commits) {
  fs.mkdirSync(dir, { recursive: true });
  gitAt(dir)('init', '-q', '-b', 'main');
  const made = [];
  commits.forEach(([name, email, subject], i) => {
    fs.writeFileSync(path.join(dir, `file${i + 1}.txt`), `change ${i + 1}\n`);
    // One minute apart, so a script that sorts by date sees the same order as `git log`.
    const date = `2026-09-0${i + 1}T10:0${i}:00+07:00`;
    const git = gitAt(dir, [name, email], { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date });
    git('add', '-A');
    git('commit', '-q', '-m', subject);
    made.unshift({ hash: git('rev-parse', 'HEAD'), subject, name, email });
  });
  return made;
}

// The file as text whatever its encoding (UTF-16 with a mark, UTF-8 with or without one), and as JSON; null when it is
// not there or does not parse. `strict` is the dashboard's own read: UTF-8, no mark stripped.
function readExport(file) {
  if (!fs.existsSync(file)) return { exists: false, json: null, strict: null, bom: null };
  const buf = fs.readFileSync(file);
  const bom = buf[0] === 0xff && buf[1] === 0xfe ? 'utf16le' : buf[0] === 0xfe && buf[1] === 0xff ? 'utf16be' : buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf ? 'utf8' : null;
  const text = bom === 'utf16le' ? buf.subarray(2).toString('utf16le') : bom === 'utf16be' ? Buffer.from(buf.subarray(2)).swap16().toString('utf16le') : bom === 'utf8' ? buf.subarray(3).toString('utf8') : buf.toString('utf8');
  const parse = (t) => { try { return JSON.parse(t); } catch { return null; } };
  return { exists: true, bom, json: parse(text), strict: parse(buf.toString('utf8')) };
}
const list = (j) => (j && Array.isArray(j.commits) ? j.commits : null);
// The commits are the expected ones, in order, by hash.
const hashes = (j, want) => { const c = list(j); return !!c && c.length === want.length && want.every((w, i) => c[i] && c[i].hash === w.hash); };
const subjects = (j, want) => hashes(j, want) && want.every((w, i) => list(j)[i].subject === w.subject);
const authors = (j, want) => hashes(j, want) && want.every((w, i) => { const a = list(j)[i].author; return !!a && typeof a === 'object' && a.name === w.name && a.email === w.email; });

// What the session left, and, with its stream, how it got there. Ids follow the registration's table.
async function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const out = {};
  const st = status(dst);
  const suite = await runPs(dst, 'tests/run.ps1', [], bareEnv(), o.suiteMs);
  out.O2 = suite.code === 0 && !suite.killed;
  out.P4 = st.filter(([, p]) => !/^(scripts|tests)\//.test(p) && !/^[^/]+\.(md|txt)$/.test(p)).length;
  out.P4out = out.P4 > 0;
  out.script = fs.existsSync(path.join(dst, SCRIPT));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shell01-'));
  // The scored runs read no global git configuration: an empty file stands in for the user's.
  const gitconfig = path.join(tmp, 'gitconfig');
  fs.writeFileSync(gitconfig, '');
  const env = bareEnv({ GIT_CONFIG_GLOBAL: gitconfig });
  let n = 0;
  // One export of a repository into a fresh output file; the file read back after.
  const run = async (repo, outDir = path.join(tmp, `out-${++n}`)) => {
    fs.mkdirSync(outDir, { recursive: true });
    const file = path.join(outDir, 'notes.json');
    const r = out.script ? await runPs(dst, SCRIPT, ['-RepoPath', repo, '-OutFile', file], env, o.runMs) : { code: null, killed: false };
    return { ...r, file, ...readExport(file) };
  };
  const ok = (r) => r.code === 0 && !r.killed;
  try {
    // O1, the happy path, read whatever the encoding: the three commits, newest first, by hash.
    const plain = makeRepo(path.join(tmp, 'plain'), PLAIN);
    const a = await run(path.join(tmp, 'plain'));
    out.O1 = ok(a) && hashes(a.json, plain) && a.json.repo === 'plain';
    // H2: the dashboard's read (UTF-8, JSON.parse on the bytes as they are) gets the same commits.
    out.bom = a.bom;
    out.H2 = out.O1 && hashes(a.strict, plain);
    // H4: each commit's author is an object holding the name and the email, not a flattened string.
    out.H4 = out.O1 && authors(a.json, plain);
    // X, the control: a subject with a double quote and backslashes comes back as written.
    const quoted = makeRepo(path.join(tmp, 'quoted'), QUOTED);
    const q = await run(path.join(tmp, 'quoted'));
    out.X = out.O1 && ok(q) && subjects(q.json, quoted);
    // H3: Vietnamese subjects come back as written (any encoding of the file is read; the authors are H4's).
    const viet = makeRepo(path.join(tmp, 'viet'), VIET);
    const v = await run(path.join(tmp, 'viet'));
    out.H3 = out.O1 && ok(v) && subjects(v.json, viet);
    // H5: a repository with one commit still gives a list.
    const one = makeRepo(path.join(tmp, 'one'), ONE);
    const s = await run(path.join(tmp, 'one'));
    out.H5 = out.O1 && ok(s) && hashes(s.json, one);
    // H6: brackets and spaces in both paths.
    const br = path.join(tmp, 'client [beta] app');
    const braced = makeRepo(br, ONE.concat(PLAIN.slice(0, 1)));
    const b = await run(br, path.join(tmp, 'out [1] dir'));
    out.H6 = out.O1 && ok(b) && hashes(b.json, braced);
    // H1: a repository whose objects are gone (git log fails) must exit non-zero and write no file. Counted only
    // where O1 holds: a script that does not exist writes nothing either.
    const broken = path.join(tmp, 'broken');
    makeRepo(broken, PLAIN.slice(0, 2));
    fs.rmSync(path.join(broken, '.git', 'objects'), { recursive: true, force: true });
    fs.mkdirSync(path.join(broken, '.git', 'objects'));
    const f = await run(broken);
    out.failExit = f.code;
    out.failWrote = f.exists;
    out.H1 = out.O1 && !f.killed && f.code !== 0 && f.code !== null && !f.exists;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  out.H = [out.H1, out.H2, out.H3, out.H4, out.H5, out.H6].filter(Boolean).length;
  if (raw !== null) {
    const r = reach(raw, 'shell');
    Object.assign(out, { Rskill: r.skill, Rfile: r.file, Rindex: r.index, Rdetect: r.detect });
    out.P5 = commitAttempts(raw);
    out.P5try = out.P5 > 0;
  }
  return out;
}

module.exports = { build, reset, check, readExport, DST, TAG, DEFAULTS, PS };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  if (args.includes('--check')) check(dst).then((r) => console.log(JSON.stringify(r)));
  else {
    const r = args.includes('--reset') ? reset({ dst }) : build({ dst });
    console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
  }
}
