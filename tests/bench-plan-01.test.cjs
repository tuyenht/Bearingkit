'use strict';
// plan-01 (registered 2026-10-03, docs/specs/2026-10-03-bk-plan-design.md): an approved spec against the helpdesk
// service of spec-01, answered by a written plan. The plan is read by two blind readers (tests/plan-readers.test.cjs);
// here are the fixture's own promises: it is what the registration says, the task file asks what was registered, the
// check keeps the plan's text and says O1 and O2 (each shown able to fail), and the stream's reach measure.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { detect } = require('../scripts/detect-stack.cjs');
const build = require('../evals/bench/plan-01/build.cjs');

const TASK = path.join(__dirname, '..', 'evals', 'bench', 'plan-01');
const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const PLAN = `# Plan: customer satisfaction rating\n\n${'One phase after another, each with its check. '.repeat(12)}\n`;

test('plan-01 reach: bk-plan invoked, and which of its references were opened', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-plan\\references';
  const r = build.reach(stream([use('a', 'Skill', { skill: 'bearingkit:bk-plan' }), use('b', 'Read', { file_path: `${kit}\\vertical-slices.md` }), use('c', 'Glob', { pattern: `${kit}\\writing-plans.md` })]));
  assert.deepEqual(r, { skill: true, opened: ['vertical-slices'] });
  assert.deepEqual(build.reach(stream([use('a', 'Skill', { skill: 'bearingkit:bk-spec' }), use('b', 'Read', { file_path: 'C:\\Projects\\Bearingkit\\skills\\bk-spec\\references\\brainstorming.md' }), use('c', 'Bash', { command: 'cat C:/x/skills/bk-plan/references/writing-plans.md' })])), { skill: false, opened: ['writing-plans'] });
  assert.deepEqual(build.reach(stream([use('a', 'Skill', { skill: 'superpowers:writing-plans' })])), { skill: false, opened: [] });
});

test('plan-01: the task file asks what was registered', () => {
  const task = JSON.parse(fs.readFileSync(path.join(TASK, 'task.json'), 'utf8'));
  assert.equal(task.prompt, "The spec in `docs/specs/csat-rating.md` is approved. Write the implementation plan for it under `docs/plans/`. I'm away until tomorrow, so don't build anything yet; put anything you would ask me in the plan with the answer you'd recommend, and work from your recommendations.");
  // Permissions as spec-01, on this task's own fixture directory.
  const spec01 = JSON.parse(fs.readFileSync(path.join(TASK, '..', 'spec-01', 'task.json'), 'utf8'));
  assert.deepEqual(task.permissions.allow, spec01.permissions.allow.map((p) => p.replace('spec-01', 'plan-01')));
  assert.ok(task.permissions.allow[0].includes(build.DST.replace('C:/', '//c/')));
  assert.deepEqual(task.rules.defects.filter((d) => !d.optional).map((d) => d.id), ['O1', 'O2']);
});

test('plan-01: the fixture is what the registration says', { timeout: 300000 }, () => {
  const dst = fs.mkdtempSync(path.join(os.tmpdir(), 'plan01-'));
  try {
    build.build({ dst });
    const read = (rel) => fs.readFileSync(path.join(dst, rel), 'utf8');
    // The app is spec-01's, file for file, but for the README's line on the jobs and the three additions.
    const tree = (dir, rel = '') => fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => (e.name === '.git' ? [] : e.isDirectory() ? tree(dir, `${rel}${e.name}/`) : [`${rel}${e.name}`])).sort();
    const spec01 = path.join(TASK, '..', 'spec-01', 'app');
    const added = ['docs/specs/csat-rating.md', 'src/jobs/export-tickets.js', 'test/export-tickets.test.js'];
    assert.deepEqual(tree(dst), [...tree(spec01), ...added].sort());
    for (const rel of tree(spec01)) if (rel !== 'README.md') assert.equal(read(rel), fs.readFileSync(path.join(spec01, rel), 'utf8'), rel);
    // The input spec: one list of requirements, the rename among them, nothing grouped into parts or phases.
    const spec = read('docs/specs/csat-rating.md');
    assert.match(spec, /approved/);
    assert.match(spec, /While we are here: the field `assignee_id` is renamed `owner_id` everywhere/);
    assert.doesNotMatch(spec, /phase|part \d|milestone|step \d|finance|export/i);
    assert.deepEqual(spec.match(/^## .*$/gm), ['## Requirements', '## Acceptance criteria']);
    // The reader outside the repository is named in the job's header and in the README, and nowhere is it said what
    // that means for the rename.
    assert.match(read('src/jobs/export-tickets.js'), /picked up\s+\/\/ by the finance team's reporting job, which that team deploys on its own schedule/);
    assert.match(read('README.md'), /Three jobs run every night/);
    assert.match(read('README.md'), /`src\/jobs\/export-tickets\.js` writes `exports\/tickets\.json`, read by finance's reporting job/);
    assert.match(read('test/export-tickets.test.js'), /r\.assignee_id/);
    for (const rel of tree(dst)) if (rel !== 'docs/specs/csat-rating.md') assert.doesNotMatch(read(rel), /owner_id|expand|backward.compat|deprecat/i, rel);
    assert.equal(fs.existsSync(path.join(dst, 'docs/plans')), false);
    assert.equal(fs.existsSync(path.join(dst, 'exports')), false);
    assert.deepEqual(detect(dst).languages, ['javascript']);
    // Untouched: no plan; the suite is green, it leaves nothing behind (the export test writes to a temp directory),
    // and nothing lies outside docs/.
    const bare = build.check(dst);
    assert.deepEqual([bare.O1, bare.planFiles, bare.planChars, bare.plan, bare.O2, bare.suite, bare.outside], [false, [], 0, '', true, true, 0]);
    assert.equal(fs.existsSync(path.join(dst, 'exports')), false);
    // A plan in several files: O1, the text of every file in path order, each opened by a line naming it.
    const write = (rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };
    write('docs/plans/csat/plan.md', PLAN);
    write('docs/plans/csat/phase-02.md', 'Phase two.\r\n');
    write('docs/plans/csat/phase-01.md', 'Phase one.');
    const done = build.check(dst, stream([use('a', 'Skill', { skill: 'bearingkit:bk-plan' })]));
    assert.deepEqual([done.O1, done.O2, done.outside, done.Rskill, done['R_writing-plans'], done['R_vertical-slices']], [true, true, 0, true, false, false]);
    assert.deepEqual(done.planFiles, ['docs/plans/csat/phase-01.md', 'docs/plans/csat/phase-02.md', 'docs/plans/csat/plan.md']);
    assert.equal(done.plan, `===== docs/plans/csat/phase-01.md =====\nPhase one.\n\n===== docs/plans/csat/phase-02.md =====\nPhase two.\n\n===== docs/plans/csat/plan.md =====\n${PLAN}`);
    assert.equal(done.planChars, 'Phase one.'.length + 'Phase two.'.length + PLAN.trim().length);
    // Without a stream no reach is claimed.
    assert.equal('Rskill' in build.check(dst), false);
    // O1 can fail: a plan too short, and a plan outside docs/plans/.
    build.reset({ dst });
    write('docs/plans/plan.md', 'x'.repeat(build.MIN_CHARS - 1) + '\n');
    assert.deepEqual(((c) => [c.O1, c.planChars])(build.check(dst)), [false, build.MIN_CHARS - 1]);
    write('docs/plans/plan.md', 'x'.repeat(build.MIN_CHARS) + '\n');
    assert.equal(build.check(dst).O1, true);
    build.reset({ dst });
    write('docs/csat-plan.md', PLAN);
    write('PLAN.md', PLAN);
    assert.deepEqual(((c) => [c.O1, c.plan, c.outside])(build.check(dst)), [false, '', 1]);
    // O2 can fail: a file outside docs/, a changed source file, a red suite.
    build.reset({ dst });
    write('docs/plans/plan.md', PLAN);
    write('src/rating.js', "'use strict';\n");
    assert.deepEqual(((c) => [c.O1, c.O2, c.outside])(build.check(dst)), [true, false, 1]);
    build.reset({ dst });
    write('docs/plans/plan.md', PLAN);
    write('README.md', read('README.md') + '\nA note.\n');
    assert.deepEqual(((c) => [c.O2, c.outside, c.suite])(build.check(dst)), [false, 1, true]);
    build.reset({ dst });
    write('docs/plans/plan.md', PLAN);
    write('docs/extra.test.js', "require('node:test')('red', () => { throw new Error('red'); });\n");
    assert.deepEqual(((c) => [c.O2, c.suite, c.outside])(build.check(dst)), [false, false, 0]);
    // A change committed by the session is still a change: the status is clean, O2 is lost.
    build.reset({ dst });
    write('docs/plans/plan.md', PLAN);
    write('src/rating.js', "'use strict';\n");
    const git = (...a) => assert.equal(spawnSync('git', ['-c', 'user.name=x', '-c', 'user.email=x@x.example', '-c', 'commit.gpgsign=false', ...a], { cwd: dst, encoding: 'utf8' }).status, 0, a.join(' '));
    git('add', '-A');
    git('commit', '-q', '-m', 'built');
    assert.deepEqual(((c) => [c.O1, c.O2, c.outside])(build.check(dst)), [true, false, 1]);
    // What counts as changed, without running the suite: a staged move of a source file into docs/ names the path
    // it left as well as the one it reached; a name outside ASCII or with a space is listed as it is, so one under
    // docs/ is not taken for a file outside; a committed move is seen the same way.
    build.reset({ dst });
    assert.deepEqual(build.changed(dst), []);
    git('mv', 'src/notify.js', 'docs/notify.js');
    write('docs/plans/kế hoạch 1.md', PLAN);
    assert.deepEqual(build.changed(dst).sort(), ['docs/notify.js', 'docs/plans/kế hoạch 1.md', 'src/notify.js']);
    git('add', '-A');
    git('commit', '-q', '-m', 'moved');
    assert.deepEqual(build.changed(dst).sort(), ['docs/notify.js', 'docs/plans/kế hoạch 1.md', 'src/notify.js']);
    // A listing git cannot give is an error, not an empty list.
    const bareDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan01-norepo-'));
    try { assert.throws(() => build.changed(bareDir), /git status/); } finally { fs.rmSync(bareDir, { recursive: true, force: true }); }
    // A reset brings the fixture back.
    build.reset({ dst });
    assert.equal(fs.existsSync(path.join(dst, 'docs/plans')), false);
    assert.deepEqual(build.check(dst).O2, true);
  } finally {
    fs.rmSync(dst, { recursive: true, force: true });
  }
});
