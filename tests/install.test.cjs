'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { install, uninstall } = require('../scripts/install.cjs');

const REPO = path.resolve(__dirname, '..');
const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `bk-${p}-`));
const fwd = (p) => path.resolve(p).replace(/\\/g, '/');
const quiet = async (fn) => { const w = process.stdout.write; let out = ''; process.stdout.write = (s) => { out += s; return true; }; try { return [await fn(), out]; } finally { process.stdout.write = w; } };

function tmpKit() {
  const kit = tmp('kit');
  const skip = (src) => /[\\/]adapters[\\/]antigravity[\\/](skills|hooks\.json|mcp_config\.json|rules)([\\/]|$)/.test(src) || /[\\/]adapters[\\/]claude[\\/](skills|agents)([\\/]|$)/.test(src);
  for (const dir of ['core', 'adapters']) fs.cpSync(path.join(REPO, dir), path.join(kit, dir), { recursive: true, filter: (src) => !skip(src) });
  return kit;
}
function dirs() {
  return { kit: tmpKit(), claude: tmp('claude'), gemini: tmp('gemini'), backups: tmp('backups') };
}
const argsFor = (d, extra = []) => ['--dev', d.kit, '--config-dir', d.claude, '--antigravity-dir', d.gemini, '--backups-dir', d.backups, ...extra];

test('dry run writes nothing and reports the links, hooks and import line', async () => {
  const d = dirs();
  fs.writeFileSync(path.join(d.claude, 'settings.json'), JSON.stringify({ theme: 'dark' }));
  const [report] = await quiet(() => install(argsFor(d, ['--dry-run'])));
  const text = report.join('\n');
  assert.match(text, /\(dry-run\) \+ link .*skills\/bk-spec/);
  assert.match(text, /\+ hook UserPromptSubmit/);
  assert.match(text, /\+ import @.*\/core\/AGENTS\.md/);
  assert.ok(!fs.existsSync(path.join(d.claude, 'skills')));
  assert.ok(!fs.existsSync(path.join(d.claude, 'CLAUDE.md')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(d.claude, 'settings.json'), 'utf8')).hooks, undefined);
  assert.equal(fs.readdirSync(d.backups).length, 0);
});

test('install links skills and rules, merges settings and the import line idempotently, and backs up first', async () => {
  const d = dirs();
  fs.writeFileSync(path.join(d.claude, 'settings.json'), JSON.stringify({ theme: 'dark', permissions: { deny: ['Read(secrets/**)'] } }));
  fs.writeFileSync(path.join(d.claude, 'CLAUDE.md'), '# mine\n');
  await quiet(() => install(argsFor(d)));
  await quiet(() => install(argsFor(d)));

  const link = path.join(d.claude, 'skills', 'bk-spec');
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  assert.ok(fs.readdirSync(link).includes('SKILL.md'));
  assert.ok(fs.lstatSync(path.join(d.claude, 'rules', 'bearingkit')).isSymbolicLink());
  assert.ok(fs.existsSync(path.join(d.claude, 'rules', 'bearingkit', 'security-baseline.md')));

  const settings = JSON.parse(fs.readFileSync(path.join(d.claude, 'settings.json'), 'utf8'));
  assert.equal(settings.theme, 'dark');
  assert.equal(settings.hooks.UserPromptSubmit.length, 1, 'no duplicate hook after a second run');
  assert.match(settings.hooks.UserPromptSubmit[0].hooks[0].command, /stack-profile\.cjs/);
  assert.ok(settings.hooks.PostCompact);
  assert.ok(settings.permissions.deny.includes('Read(secrets/**)'));
  assert.ok(settings.permissions.deny.includes('Read(**/.env)'));
  assert.equal(settings.permissions.deny.filter((r) => r === 'Read(**/.env)').length, 1);

  const md = fs.readFileSync(path.join(d.claude, 'CLAUDE.md'), 'utf8');
  assert.equal(md.split('\n').filter((l) => l === `@${fwd(d.kit)}/core/AGENTS.md`).length, 1);
  assert.match(md, /^# mine/);

  const backups = fs.readdirSync(d.backups);
  assert.ok(backups.length >= 1);
  const manifest = JSON.parse(fs.readFileSync(path.join(d.backups, backups[0], 'manifest.json'), 'utf8'));
  assert.ok(manifest.files.some((f) => f.from.endsWith('settings.json')));

  const plugin = path.join(d.gemini, 'plugins', 'bearingkit');
  assert.ok(fs.lstatSync(plugin).isSymbolicLink(), 'the plugin is one junction under the global plugins root');
  assert.ok(fs.existsSync(path.join(plugin, 'plugin.json')));
  assert.ok(fs.existsSync(path.join(plugin, 'skills', 'bk-spec', 'SKILL.md')), 'skills reachable through the junction chain');
  const hooks = JSON.parse(fs.readFileSync(path.join(plugin, 'hooks.json'), 'utf8'));
  assert.ok(Array.isArray(hooks.bearingkit.PreInvocation), 'hooks.json uses the named-hook wrapper');
  assert.ok(!fs.existsSync(path.join(d.gemini, 'plugins.json')), 'no registry file is written');
  assert.ok(fs.existsSync(path.join(d.kit, 'adapters', 'antigravity', 'rules', 'AGENTS.md')));
  assert.ok(fs.readFileSync(path.join(d.kit, 'adapters', 'antigravity', 'hooks.json'), 'utf8').includes(fwd(d.kit)));
  assert.ok(fs.lstatSync(path.join(d.kit, 'adapters', 'antigravity', 'skills')).isSymbolicLink());

  await quiet(() => uninstall(argsFor(d)));
  assert.ok(!fs.existsSync(link));
  assert.ok(!fs.existsSync(path.join(d.claude, 'rules', 'bearingkit')));
  const after = JSON.parse(fs.readFileSync(path.join(d.claude, 'settings.json'), 'utf8'));
  assert.equal(after.theme, 'dark');
  assert.equal(after.hooks.UserPromptSubmit, undefined);
  assert.deepEqual(after.permissions.deny, ['Read(secrets/**)']);
  assert.equal(fs.readFileSync(path.join(d.claude, 'CLAUDE.md'), 'utf8'), '# mine\n');
  assert.ok(!fs.existsSync(path.join(d.gemini, 'plugins', 'bearingkit')), 'uninstall removes the plugin junction');
  assert.ok(!fs.existsSync(path.join(d.kit, 'adapters', 'antigravity', 'skills')));
  assert.ok(!fs.existsSync(path.join(d.kit, 'adapters', 'antigravity', 'hooks.json')));
  assert.ok(fs.existsSync(path.join(d.kit, 'core', 'skills', 'bk-spec', 'SKILL.md')), 'kit source untouched');
});

test('an existing directory not created by the kit is left alone and reported', async () => {
  const d = dirs();
  const foreign = path.join(d.claude, 'skills', 'bk-spec');
  fs.mkdirSync(foreign, { recursive: true });
  fs.writeFileSync(path.join(foreign, 'SKILL.md'), 'user content');
  const [report] = await quiet(() => install(argsFor(d, ['--claude-only'])));
  assert.match(report.join('\n'), /! skipped .*bk-spec: existing directory not created by bearingkit/);
  assert.equal(fs.readFileSync(path.join(foreign, 'SKILL.md'), 'utf8'), 'user content');
  await quiet(() => uninstall(argsFor(d, ['--claude-only'])));
  assert.equal(fs.readFileSync(path.join(foreign, 'SKILL.md'), 'utf8'), 'user content', 'uninstall keeps foreign directories');
});

test('an isolated profile skips antigravity unless its directory is given', async () => {
  const d = dirs();
  const [report] = await quiet(() => install(['--dev', d.kit, '--config-dir', d.claude, '--backups-dir', d.backups, '--dry-run']));
  assert.match(report.join('\n'), /antigravity skipped/);
});

test('backups cover only the hosts the run touches', async () => {
  const d = dirs();
  fs.writeFileSync(path.join(d.claude, 'settings.json'), '{}');
  const [report] = await quiet(() => install(argsFor(d, ['--antigravity-only', '--dry-run'])));
  const text = report.join('\n');
  assert.doesNotMatch(text, /backup .*claude-settings/, 'an antigravity-only run must not read the Claude profile');
  assert.match(text, /nothing to back up/, 'the Antigravity side modifies no existing file');
  assert.match(text, /\+ link .*plugins\/bearingkit/);
  const [report2] = await quiet(() => install(argsFor(d, ['--claude-only', '--dry-run'])));
  assert.doesNotMatch(report2.join('\n'), /plugins\/bearingkit/);
});

test('--antigravity-copy installs a real plugin directory with dereferenced skills, and uninstall removes only kit-made copies', async () => {
  const d = dirs();
  await quiet(() => install(argsFor(d, ['--antigravity-only', '--antigravity-copy'])));
  const dst = path.join(d.gemini, 'plugins', 'bearingkit');
  assert.ok(fs.lstatSync(dst).isDirectory() && !fs.lstatSync(dst).isSymbolicLink(), 'a real directory');
  assert.ok(fs.lstatSync(path.join(dst, 'skills')).isDirectory() && !fs.lstatSync(path.join(dst, 'skills')).isSymbolicLink(), 'skills copied, not linked');
  assert.ok(fs.existsSync(path.join(dst, 'skills', 'bk-spec', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(dst, 'rules', 'AGENTS.md')));
  assert.ok(!fs.existsSync(path.join(dst, 'hooks.template.json')), 'template not shipped');
  assert.equal(fs.readFileSync(path.join(dst, '.bearingkit-copy'), 'utf8').trim(), fwd(d.kit));
  // A second install refreshes the copy in place; a junction install replaces its own copy with a link and back.
  await quiet(() => install(argsFor(d, ['--antigravity-only', '--antigravity-copy'])));
  assert.ok(fs.existsSync(path.join(dst, 'skills', 'bk-spec', 'SKILL.md')));
  await quiet(() => uninstall(argsFor(d, ['--antigravity-only'])));
  assert.ok(!fs.existsSync(dst), 'kit-made copy removed');
  // A foreign directory with the same name is never touched.
  fs.mkdirSync(dst, { recursive: true });
  fs.writeFileSync(path.join(dst, 'plugin.json'), '{"name":"someone-else"}');
  const [report] = await quiet(() => install(argsFor(d, ['--antigravity-only', '--antigravity-copy'])));
  assert.match(report.join('\n'), /skipped .*existing directory not created by bearingkit/);
  await quiet(() => uninstall(argsFor(d, ['--antigravity-only'])));
  assert.ok(fs.existsSync(path.join(dst, 'plugin.json')), 'foreign directory kept');
});
