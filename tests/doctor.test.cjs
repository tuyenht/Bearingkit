'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { install } = require('../scripts/antigravity.cjs');
const { fakeKit, snapshot, assertRuleComplete } = require('./fixtures/fake-kit.cjs');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'bearingkit.cjs');

function fakeHome() { return fs.mkdtempSync(path.join(os.tmpdir(), 'bk-home-')); }
function destIn(home) { return path.join(home, '.gemini', 'config', 'plugins', 'bearingkit'); }

// The invariant is about the command the owner runs, so it is measured on the command, in a home of its own: node
// resolves os.homedir() from USERPROFILE on Windows and HOME elsewhere, so both are set.
function runDoctorCli(home) {
  return spawnSync(process.execPath, [BIN, 'doctor'], { encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home } });
}

test('doctor writes not one byte into the profile it reads, on a healthy copy and on a broken one', () => {
  const home = fakeHome();
  install({ root: ROOT, dest: destIn(home) });

  const beforeOk = snapshot(home);
  const ok = runDoctorCli(home);
  assert.equal(ok.status, 0, `a current copy of this checkout is healthy\n${ok.stdout}${ok.stderr}`);
  assert.match(ok.stdout, /antigravity/i, 'the run names the checks it made, so "wrote nothing" is not vacuous');
  assert.deepEqual(snapshot(home), beforeOk, 'a passing run leaves the profile byte for byte as it found it');

  fs.rmSync(path.join(destIn(home), 'rules', 'bearingkit.md'));
  const beforeFail = snapshot(home);
  const failed = runDoctorCli(home);
  assert.notEqual(failed.status, 0, 'a copy without its rule is not healthy');
  assert.deepEqual(snapshot(home), beforeFail, 'the failing path writes nothing either, and repairs nothing');
});

// antigravity install takes --dest; doctor read only the default location, so a copy installed elsewhere read as
// absent and the repair line it printed would have installed a second copy instead of refreshing the live one.
test('doctor follows --dest, the way the installer does', () => {
  const home = fakeHome();
  const elsewhere = path.join(fakeHome(), 'plugins', 'bearingkit');
  install({ root: ROOT, dest: elsewhere });

  const blind = spawnSync(process.execPath, [BIN, 'doctor'], { encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home } });
  assert.notEqual(blind.status, 0, 'the default location holds no copy, so this run must fail');

  const aimed = spawnSync(process.execPath, [BIN, 'doctor', '--dest', elsewhere], { encoding: 'utf8', env: { ...process.env, HOME: home, USERPROFILE: home } });
  assert.equal(aimed.status, 0, `the copy at --dest is healthy\n${aimed.stdout}${aimed.stderr}`);
  assert.match(aimed.stdout, /ok {2}\s+antigravity copy present/);
});

test('doctor creates nothing in a profile where the kit was never installed', () => {
  const home = fakeHome();
  const r = runDoctorCli(home);
  assert.notEqual(r.status, 0, 'an absent copy is reported, not passed over');
  assert.deepEqual(fs.readdirSync(home), [], 'no .gemini, no .claude, nothing: doctor does not prepare the ground it checks');
  assert.match(r.stdout + r.stderr, /install --host antigravity/, 'it prints the command the owner types instead of running it');
});

// The in-process entry takes the kit and the home to read, so a drift can be staged on a throwaway pair.
function runDoctor(root, home) {
  const lines = [];
  const r = require('../scripts/doctor.cjs').run({ root, home, log: (l) => lines.push(l) });
  return { ...r, out: lines.join('\n') };
}

function stagedCopy() {
  const root = fakeKit();
  const home = fakeHome();
  const dest = destIn(home);
  install({ root, dest });
  assertRuleComplete(fs.readFileSync(path.join(dest, 'rules', 'bearingkit.md'), 'utf8'), dest);
  assert.equal(runDoctor(root, home).ok, true, 'a copy just written by the installer is healthy');
  return { root, home, dest };
}

test('a copy that dropped the Antigravity host note fails, which is the state 3d7b4eb shipped', () => {
  const { root, home, dest } = stagedCopy();
  const rule = path.join(dest, 'rules', 'bearingkit.md');
  const text = fs.readFileSync(rule, 'utf8');
  // Exactly the 3d7b4eb shape: the note gone, the protocol body and the kit-root line still in place, so nothing but
  // the note itself distinguishes this copy from a good one.
  fs.writeFileSync(rule, text.slice(0, text.indexOf('## Antigravity host note')) + text.slice(text.indexOf('Kit root')));
  const r = runDoctor(root, home);
  assert.equal(r.ok, false, 'the copy the host actually loads is missing the note, so doctor must not pass it');
  assert.ok(r.checks.some((c) => c.ok === false && /rule/i.test(c.name)), 'the rule check is the one that fails');
  assert.match(r.out, /antigravity install/, 'it prints the command that repairs it and does not run it');
});

test('a copy older than the repository skills/ fails, whether a file changed or a skill was added', () => {
  const { root, home } = stagedCopy();
  fs.writeFileSync(path.join(root, 'skills', 'bk-spec', 'SKILL.md'), '---\nname: bk-spec\ndescription: "s"\n---\nbody, revised\n');
  const changed = runDoctor(root, home);
  assert.equal(changed.ok, false, 'the copy still carries the old body');
  assert.ok(changed.checks.some((c) => c.ok === false && /skills/i.test(c.name)));

  const { root: root2, home: home2 } = stagedCopy();
  fs.mkdirSync(path.join(root2, 'skills', 'bk-ship'), { recursive: true });
  fs.writeFileSync(path.join(root2, 'skills', 'bk-ship', 'SKILL.md'), '---\nname: bk-ship\ndescription: "x"\n---\nbody\n');
  assert.equal(runDoctor(root2, home2).ok, false, 'a skill added since the copy was made is missing from it');
});

// Found 2026-09-16: after detect-stack.cjs changed, doctor still reported the copied scripts as fine, because it only
// checked that they existed. The skills inside the copy call those scripts, so a stale one is a stale kit.
test('a copy whose scripts are older than the checkout fails', () => {
  const { root, home } = stagedCopy();
  fs.writeFileSync(path.join(root, 'scripts', 'detect-stack.cjs'), '// stub, revised\n');
  const r = runDoctor(root, home);
  assert.equal(r.ok, false, 'the copy still carries the old script');
  assert.ok(r.checks.some((c) => c.ok === false && /scripts/i.test(c.name)), 'the scripts check is the one that fails');
});

// The rule check looked for five markers. A note whose wording changed, or a protocol body from an older checkout,
// keeps every marker and passed. The rule is generated, so the exact text the installer would write now is the test.
test('a rule that keeps every marker but differs from what the installer writes now fails', () => {
  const { root, home, dest } = stagedCopy();
  const rule = path.join(dest, 'rules', 'bearingkit.md');
  const text = fs.readFileSync(rule, 'utf8');
  assert.ok(text.includes('This host has no skill tool.'), 'the sentence this test edits is in the note');
  fs.writeFileSync(rule, text.replace('This host has no skill tool.', 'This host may have a skill tool.'));
  assertRuleComplete(fs.readFileSync(rule, 'utf8'), dest);
  const r = runDoctor(root, home);
  assert.equal(r.ok, false, 'every marker is still there, and the note says something else');
  assert.ok(r.checks.some((c) => c.ok === false && /rule/i.test(c.name)));
});

test('a copy made from another checkout is reported instead of silently compared', () => {
  const { home } = stagedCopy();
  const other = fakeKit();
  const r = runDoctor(other, home);
  assert.equal(r.ok, false);
  assert.ok(r.checks.some((c) => c.ok === false && /marker|kit/i.test(c.name)));
});

// Since per-project activation the copy Antigravity loads may be the store a project declares, not the global copy
// under ~/.gemini. doctor reads whichever is on disk, store first, so it and `bearingkit status` say the same thing.
test('doctor reads the store when it is there, and the global copy when it is not', () => {
  const home = fakeHome();
  const store = path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit');
  install({ root: ROOT, dest: store });
  const r = runDoctor(ROOT, home);
  assert.match(r.out, /antigravity copy present \(store\)/);
  assert.equal(r.ok, true);
  const onlyGlobal = fakeHome();
  install({ root: ROOT, dest: destIn(onlyGlobal) });
  assert.match(runDoctor(ROOT, onlyGlobal).out, /antigravity copy present \(global copy\)/);
  // With neither on disk the answer is "the store is missing", and the repair line is the command that installs
  // the store — not the older one that would put a copy in every workspace.
  const empty = runDoctor(ROOT, fakeHome());
  assert.match(empty.out, /antigravity copy present \(store\)/);
  assert.match(empty.out, /bearingkit\.cjs install --host antigravity/);
  assert.doesNotMatch(empty.out, /bearingkit\.cjs antigravity install/);
});

test('doctor never reports ok for the host listing it cannot read without the host', () => {
  const { root, home } = stagedCopy();
  const r = runDoctor(root, home);
  assert.ok(r.checks.some((c) => c.ok === null), 'what it did not run is marked as not run, not as ok');
  assert.match(r.out, /claude plugin list/, 'and the read-only command the owner can run is printed');
  assert.equal(r.ok, true, 'a check it declined to run is not a failure');
});
