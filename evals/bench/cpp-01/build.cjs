'use strict';
// Fixture of benchmark task cpp-01 (designed in docs/specs/2026-10-08-stack-c-cpp-design.md): a small CMake C++20
// project, asked for a `total` command that reads a readings file and prints the sum and the peak. Scored after the
// session by the scorer's own builds of the session's final tree, never by reading its source: H1 the sources compile
// under -Wall -Wextra -Wpedantic -Werror, H2 a sum past 32 bits (built with UBSan in trap mode), H3 an empty file
// (built with libstdc++'s assertions), H5 a line that cannot be read, each a sentence of stacks/c-cpp.md; O1 the happy
// path, O2 the project's own CTest run, X a meter id with spaces (the control). H4 of the design (a resource released
// on a failure) is not built: a leak is invisible after the process ends.
// The toolchain directory is process.env.BENCH_CPP_BIN, else the task's pathPrepend.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { commitAttempts, reach } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/cpp-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/cpp-01';
const APP = path.join(__dirname, 'app');
const BIN = path.resolve(process.env.BENCH_CPP_BIN || require('./task.json').pathPrepend);
const EXE = process.platform === 'win32' ? 'meterstat.exe' : 'meterstat';
// Each configure or build killed at buildMs, each run of the program at runMs, the CTest run at suiteMs.
const DEFAULTS = { buildMs: 180000, runMs: 20000, suiteMs: 120000 };
const WARN = '-Wall -Wextra -Wpedantic -Werror';
const UB = '-O2 -fsanitize=undefined -fsanitize-undefined-trap-on-error -D_GLIBCXX_ASSERTIONS';

const gitAt = (dir) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Quang Le', '-c', 'user.email=quang@meterlog.dev', '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  const git = gitAt(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'meterstat: count the lines of a readings file');
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

// What the session left, from git: [status, path] relative to the fixture root. `build/` is ignored by the fixture.
function status(dst) {
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: dst, encoding: 'utf8' });
  return r.stdout.split('\n').filter(Boolean).map((l) => [l.slice(0, 2), l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop()]);
}

// A bare environment with the toolchain first on PATH: the compiler, CMake, Ninja, and the runtime DLLs the built
// programs load. No secrets, no parent test context.
function toolEnv() {
  const env = {};
  for (const k of ['PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'SystemDrive', 'TEMP', 'TMP', 'windir', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'ProgramData', 'ComSpec']) if (process.env[k] !== undefined) env[k] = process.env[k];
  const rest = process.env.PATH || process.env.Path || '';
  return { ...env, PATH: `${BIN}${path.delimiter}${rest}` };
}
const missing = (what) => { const e = new Error(`${what} not found in ${BIN}; set BENCH_CPP_BIN to the toolchain's bin directory`); e.code = 'ENOENT'; return e; };

function tool(name, args, cwd, killMs) {
  const r = spawnSync(path.join(BIN, name), args, { cwd, env: toolEnv(), encoding: 'utf8', timeout: killMs, windowsHide: true });
  if (r.error && r.error.code === 'ENOENT') throw missing(name);
  return { code: r.status, killed: !!r.error || r.signal !== null, stdout: r.stdout || '', stderr: r.stderr || '' };
}

// The session's tree configured and built in a directory of the scorer's own, with the compiler flags given; the
// project's own build files decide everything else. Returns the directory, or null when it does not build.
function compile(src, dir, flags, target, killMs) {
  const conf = tool('cmake', ['-S', src, '-B', dir, '-G', 'Ninja', `-DCMAKE_CXX_FLAGS=${flags}`], src, killMs);
  if (conf.code !== 0 || conf.killed) return null;
  const made = tool('cmake', ['--build', dir, ...(target ? ['--target', target] : [])], src, killMs);
  return made.code === 0 && !made.killed ? dir : null;
}

// The built program, wherever the project's build files put it.
function findExe(dir) {
  if (!dir) return null;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) stack.push(path.join(d, e.name));
      else if (e.name === EXE) return path.join(d, e.name);
    }
  }
  return null;
}

// One run of the program on a file with that content. A trap or an abort comes back as the status the system gave
// (on Windows an NTSTATUS such as 0xC000001D or 0xC0000409), never as a code from 0 to 255.
function runOn(exe, tmp, name, content, killMs) {
  if (!exe) return { code: null, killed: false, stdout: '', stderr: '' };
  const file = path.join(tmp, name);
  fs.writeFileSync(file, content);
  const r = spawnSync(exe, ['total', file], { cwd: tmp, env: toolEnv(), encoding: 'utf8', timeout: killMs, windowsHide: true });
  return { code: r.status, killed: !!r.error || r.signal !== null, stdout: r.stdout || '', stderr: r.stderr || '' };
}
// An exit code the program returned, as against the status of a trap, an abort or a kill.
const chose = (code) => Number.isInteger(code) && code >= 0 && code <= 255;
const lines = (s) => s.replace(/\r\n/g, '\n').trimEnd();
const prints = (r, want) => r.code === 0 && !r.killed && lines(r.stdout) === want;
// The documented failure: exit code 2 and `error: line <n>` on stderr, with that line's number.
const refuses = (r, n) => r.code === 2 && !r.killed && new RegExp(`error: line ${n}(?!\\d)`).test(r.stderr);

const PLAIN = 'M-1,100\nM-2,300\nM-3,200\n';
const SPACED = 'Unit 7 East,120\nM-2,80\n';
// Each reading fits in 32 bits signed; their sum fits neither in 32 bits signed nor unsigned.
const BIG = 'M-1,2000000000\nM-2,1999999999\nM-3,1500000000\n';
const CUT = 'M-1,100\nM-2\nM-3,5\n';
const WORDS = 'M-1,100\nM-2,200\nM-3,abc\n';

// What the session left, and, with its stream, how it got there. Ids follow the design's table.
function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  if (!fs.existsSync(path.join(BIN, process.platform === 'win32' ? 'cmake.exe' : 'cmake'))) throw missing('cmake');
  const out = {};
  const st = status(dst);
  out.P4 = st.filter(([, p]) => !/^(src|include|tests)\//.test(p) && !/^[^/]+\.(md|txt)$/.test(p)).length;
  out.P4out = out.P4 > 0;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp01-'));
  try {
    // The tree as the project builds it: the happy path, the project's tests, the control, the unreadable lines.
    const plain = compile(dst, path.join(tmp, 'plain'), '', null, o.buildMs);
    out.built = plain !== null;
    const suite = plain ? tool('ctest', ['--test-dir', plain, '--no-tests=error'], dst, o.suiteMs) : { code: null, killed: false };
    out.O2 = suite.code === 0 && !suite.killed;
    const exe = findExe(plain);
    const a = runOn(exe, tmp, 'plain.csv', PLAIN, o.runMs);
    out.O1 = prints(a, 'total 600\npeak M-2 300');
    // X, the control: a meter id with spaces comes back as written.
    out.X = out.O1 && prints(runOn(exe, tmp, 'spaced.csv', SPACED, o.runMs), 'total 200\npeak Unit 7 East 120');
    // H5: a line with no value, and a value that is not a number: exit 2 and the line's number, not a termination.
    const cut = runOn(exe, tmp, 'cut.csv', CUT, o.runMs);
    const words = runOn(exe, tmp, 'words.csv', WORDS, o.runMs);
    out.badExit = [cut.code, words.code];
    out.H5 = out.O1 && refuses(cut, 2) && refuses(words, 3);
    // H1: the same tree under the warning flags, every target.
    out.H1 = out.O1 && compile(dst, path.join(tmp, 'warn'), WARN, null, o.buildMs) !== null;
    // H2 and H3: the program built with UBSan in trap mode and the library's assertions.
    const hard = findExe(compile(dst, path.join(tmp, 'ub'), UB, 'meterstat', o.buildMs));
    const big = runOn(hard, tmp, 'big.csv', BIG, o.runMs);
    out.bigExit = big.code;
    out.H2 = out.O1 && prints(big, 'total 5499999999\npeak M-1 2000000000');
    // H3: an empty file ends with a code the program chose (0 to 255), not with a trap or an abort (an NTSTATUS).
    const empty = runOn(hard, tmp, 'empty.csv', '', o.runMs);
    out.emptyExit = empty.code;
    out.H3 = out.O1 && !empty.killed && chose(empty.code);
  } finally {
    // A built program can stay locked for a moment on Windows; a directory left in the temporary folder is not a
    // reason to lose the session's checks.
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* left behind */ }
  }
  out.H = [out.H1, out.H2, out.H3, out.H5].filter(Boolean).length;
  if (raw !== null) {
    const r = reach(raw, 'c-cpp');
    Object.assign(out, { Rskill: r.skill, Rfile: r.file, Rindex: r.index, Rdetect: r.detect });
    out.P5 = commitAttempts(raw);
    out.P5try = out.P5 > 0;
  }
  return out;
}

module.exports = { build, reset, check, chose, DST, TAG, DEFAULTS, BIN };

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
