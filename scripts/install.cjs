'use strict';
// Installer for both hosts. Dev mode links the working checkout; every host file it touches is backed up first;
// entries it writes are marked so a second run is idempotent and `uninstall` removes exactly what it added.
//
//   bearingkit install --dev <repo> [--config-dir <claude dir>] [--antigravity-dir <gemini config dir>]
//                      [--dry-run] [--mcp] [--claude-only] [--antigravity-only] [--antigravity-copy] [--backups-dir <dir>]
//   bearingkit uninstall (same options)
//
// Claude Code: junctions/symlinks for core/skills/bk-* → <claudeDir>/skills/, core/rules → <claudeDir>/rules/bearingkit,
// hook registrations and a secrets-only deny list merged into settings.json, an @import line in CLAUDE.md.
// Antigravity: adapters/antigravity/{rules/AGENTS.md (copy), hooks.json (from template), skills (link)} and one entry
// in <geminiDir>/plugins.json. When --config-dir is given without --antigravity-dir, the Antigravity side is skipped,
// because an isolated Claude profile has no Antigravity counterpart.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DENY_RULES = ['Read(**/.env)', 'Read(**/.env.*)', 'Read(**/*.pem)', 'Read(**/*.key)', 'Read(**/id_rsa*)'];
const fwd = (p) => path.resolve(p).replace(/\\/g, '/');
const readJson = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[a.slice(2)] = next; i++; } else { out[a.slice(2)] = true; }
    } else out._.push(a);
  }
  return out;
}

function resolveOptions(argv) {
  const args = parseArgs(argv);
  const home = process.env.BEARINGKIT_HOME || path.join(os.homedir(), '.bearingkit');
  const isolated = Boolean(args['config-dir']);
  return {
    kitRoot: fwd(args.dev ? String(args.dev) : path.join(__dirname, '..')),
    claudeDir: fwd(args['config-dir'] || path.join(os.homedir(), '.claude')),
    geminiDir: fwd(args['antigravity-dir'] || path.join(os.homedir(), '.gemini', 'config')),
    backupsDir: fwd(args['backups-dir'] || path.join(home, 'backups')),
    dryRun: Boolean(args['dry-run']),
    mcp: Boolean(args.mcp),
    doClaude: !args['antigravity-only'],
    doAntigravity: !args['claude-only'] && (Boolean(args['antigravity-dir']) || !isolated),
    // Antigravity's scanner may not follow a directory junction; --antigravity-copy installs a real directory
    // (a snapshot of the adapter with the skills dereferenced) that a later install refreshes.
    antigravityCopy: Boolean(args['antigravity-copy']),
  };
}

class Installer {
  constructor(opts) { this.o = opts; this.report = []; }
  log(line) { this.report.push((this.o.dryRun ? '(dry-run) ' : '') + line); }

  // ---------- primitives ----------
  writeFile(file, content) {
    this.log(`+ write ${fwd(file)}`);
    if (this.o.dryRun) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  linkTarget(link) {
    try { return fwd(fs.readlinkSync(link).replace(/^\\\\\?\\/, '')); } catch { return null; }
  }
  isKitLink(link) {
    const t = this.linkTarget(link);
    return Boolean(t && t.startsWith(this.o.kitRoot + '/'));
  }
  link(target, link) {
    let st = null;
    try { st = fs.lstatSync(link); } catch { st = null; }
    if (st && st.isSymbolicLink()) {
      if (this.linkTarget(link) === fwd(target)) { this.log(`= link ${fwd(link)} already points at the kit`); return; }
      if (this.isKitLink(link)) { this.log(`~ relink ${fwd(link)} → ${fwd(target)}`); if (!this.o.dryRun) { this.removeLink(link); fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir'); } return; }
      this.log(`! skipped ${fwd(link)}: existing link not created by bearingkit`); return;
    }
    if (st) { this.log(`! skipped ${fwd(link)}: existing directory not created by bearingkit`); return; }
    this.log(`+ link ${fwd(link)} → ${fwd(target)}`);
    if (this.o.dryRun) return;
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
  }
  removeLink(link) {
    try { fs.unlinkSync(link); } catch { fs.rmdirSync(link); }
  }
  unlink(link) {
    let st = null;
    try { st = fs.lstatSync(link); } catch { return; }
    if (!st.isSymbolicLink()) { this.log(`! kept ${fwd(link)}: not a link`); return; }
    if (!this.isKitLink(link)) { this.log(`! kept ${fwd(link)}: link not created by bearingkit`); return; }
    this.log(`- unlink ${fwd(link)}`);
    if (!this.o.dryRun) this.removeLink(link);
  }

  // ---------- backup ----------
  backup() {
    // Only the hosts this run touches are backed up; --antigravity-only never reads the Claude profile.
    const candidates = [
      this.o.doClaude && [path.join(this.o.claudeDir, 'settings.json'), 'claude-settings.json'],
      this.o.doClaude && [path.join(this.o.claudeDir, 'CLAUDE.md'), 'claude-CLAUDE.md'],
    ].filter((c) => c && fs.existsSync(c[0]));
    if (!candidates.length) { this.log('= nothing to back up'); return null; }
    const dir = path.join(this.o.backupsDir, new Date().toISOString().replace(/[:.]/g, '-'));
    const manifest = { at: new Date().toISOString(), files: [] };
    for (const [from, name] of candidates) {
      const to = path.join(dir, name);
      manifest.files.push({ from: fwd(from), to: fwd(to) });
      this.log(`+ backup ${fwd(from)} → ${fwd(to)}`);
      if (!this.o.dryRun) { fs.mkdirSync(dir, { recursive: true }); fs.copyFileSync(from, to); }
    }
    if (!this.o.dryRun) fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    return dir;
  }

  // ---------- claude ----------
  skillDirs() {
    const dir = path.join(this.o.kitRoot, 'core', 'skills');
    return fs.readdirSync(dir).filter((d) => d.startsWith('bk-') && fs.existsSync(path.join(dir, d, 'SKILL.md'))).sort();
  }
  claudeInstall() {
    for (const name of this.skillDirs()) this.link(path.join(this.o.kitRoot, 'core', 'skills', name), path.join(this.o.claudeDir, 'skills', name));
    this.link(path.join(this.o.kitRoot, 'core', 'rules'), path.join(this.o.claudeDir, 'rules', 'bearingkit'));
    this.mergeSettings();
    this.ensureImport();
    if (this.o.mcp) {
      const mcp = readJson(path.join(this.o.kitRoot, 'core', 'mcp.json'), { servers: {} });
      for (const [name, s] of Object.entries(mcp.servers)) this.log(`? mcp: run once by hand: claude mcp add ${name} -- ${s.command} ${(s.args || []).join(' ')}`);
    }
  }
  mergeSettings() {
    const file = path.join(this.o.claudeDir, 'settings.json');
    const settings = readJson(file, {});
    const template = readJson(path.join(this.o.kitRoot, 'adapters', 'claude', 'hooks', 'hooks.json'), { hooks: {} });
    settings.hooks = settings.hooks || {};
    let changed = false;
    for (const [event, groups] of Object.entries(template.hooks)) {
      const list = (settings.hooks[event] = settings.hooks[event] || []);
      for (const g of groups) {
        for (const h of g.hooks) {
          const command = h.command.replace(/<KIT>/g, this.o.kitRoot);
          const present = list.some((x) => (x.hooks || []).some((y) => y.command === command));
          if (present) { this.log(`= hook ${event} already registered`); continue; }
          list.push({ ...(g.matcher ? { matcher: g.matcher } : {}), hooks: [{ ...h, command }] });
          this.log(`+ hook ${event}: ${command}`);
          changed = true;
        }
      }
    }
    settings.permissions = settings.permissions || {};
    settings.permissions.deny = Array.isArray(settings.permissions.deny) ? settings.permissions.deny : [];
    for (const rule of DENY_RULES) {
      if (settings.permissions.deny.includes(rule)) continue;
      settings.permissions.deny.push(rule);
      this.log(`+ deny ${rule}`);
      changed = true;
    }
    if (changed || !fs.existsSync(file)) this.writeFile(file, JSON.stringify(settings, null, 2) + '\n');
  }
  importLine() { return `@${this.o.kitRoot}/core/AGENTS.md`; }
  ensureImport() {
    const file = path.join(this.o.claudeDir, 'CLAUDE.md');
    const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const line = this.importLine();
    if (text.split(/\r?\n/).includes(line)) { this.log('= import line already present in CLAUDE.md'); return; }
    this.log(`+ import ${line} into ${fwd(file)}`);
    this.writeFile(file, (text.endsWith('\n') || text === '' ? text : text + '\n') + line + '\n');
  }
  claudeUninstall() {
    for (const name of this.skillDirs()) this.unlink(path.join(this.o.claudeDir, 'skills', name));
    this.unlink(path.join(this.o.claudeDir, 'rules', 'bearingkit'));
    const file = path.join(this.o.claudeDir, 'settings.json');
    const settings = readJson(file, null);
    if (settings) {
      let changed = false;
      for (const [event, list] of Object.entries(settings.hooks || {})) {
        const kept = list.map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !String(h.command).includes(this.o.kitRoot)) })).filter((g) => g.hooks.length);
        if (kept.length !== list.length || kept.some((g, i) => g.hooks.length !== (list[i].hooks || []).length)) { changed = true; this.log(`- hook ${event}`); }
        if (kept.length) settings.hooks[event] = kept; else delete settings.hooks[event];
      }
      if (settings.permissions && Array.isArray(settings.permissions.deny)) {
        const before = settings.permissions.deny.length;
        settings.permissions.deny = settings.permissions.deny.filter((r) => !DENY_RULES.includes(r));
        if (settings.permissions.deny.length !== before) { changed = true; this.log('- deny rules'); }
      }
      if (changed) this.writeFile(file, JSON.stringify(settings, null, 2) + '\n');
    }
    const md = path.join(this.o.claudeDir, 'CLAUDE.md');
    if (fs.existsSync(md)) {
      const lines = fs.readFileSync(md, 'utf8').split(/\r?\n/);
      const kept = lines.filter((l) => l !== this.importLine());
      if (kept.length !== lines.length) { this.log('- import line from CLAUDE.md'); this.writeFile(md, kept.join('\n').replace(/\n+$/, '\n')); }
    }
  }

  // ---------- antigravity ----------
  antigravityInstall() {
    const ad = path.join(this.o.kitRoot, 'adapters', 'antigravity');
    const agents = fs.readFileSync(path.join(this.o.kitRoot, 'core', 'AGENTS.md'), 'utf8');
    const baseline = fs.readFileSync(path.join(this.o.kitRoot, 'core', 'rules', 'security-baseline.md'), 'utf8').replace(/^---[\s\S]*?---\s*/, '');
    this.writeFile(path.join(ad, 'rules', 'AGENTS.md'), `---\ntrigger: always_on\n---\n${agents.trim()}\n\n${baseline.trim()}\n`);
    const hooks = fs.readFileSync(path.join(ad, 'hooks.template.json'), 'utf8').replace(/<KIT>/g, this.o.kitRoot);
    this.writeFile(path.join(ad, 'hooks.json'), hooks);
    // Launcher: Antigravity runs hook commands with the plugin directory as working directory and resolves path-like
    // tokens against it, so the command stays relative and the kit path lives here as a string.
    const kit = JSON.stringify(this.o.kitRoot);
    this.writeFile(path.join(ad, 'hooks', 'stack-profile.cjs'), [
      "'use strict';",
      '// Generated by bearingkit install; do not edit. Runs the kit\'s stack-profile hook for Antigravity.',
      `const kit = ${kit};`,
      "const { run } = require(kit + '/core/hooks/stack-profile.cjs');",
      "const { readStdin, eventFromArgv } = require(kit + '/core/hooks/lib/host.cjs');",
      'readStdin()',
      '  .then((p) => run(p, { event: eventFromArgv(process.argv) }))',
      '  .then((out) => process.stdout.write(JSON.stringify(out)))',
      "  .catch((err) => { process.stderr.write(String(err && err.stack ? err.stack : err)); process.stdout.write('{}'); });",
      '',
    ].join('\n'));
    if (this.o.mcp) {
      const mcp = readJson(path.join(this.o.kitRoot, 'core', 'mcp.json'), { servers: {} });
      const cfg = { mcpServers: Object.fromEntries(Object.entries(mcp.servers).map(([k, v]) => [k, { command: v.command, args: v.args || [] }])) };
      this.writeFile(path.join(ad, 'mcp_config.json'), JSON.stringify(cfg, null, 2) + '\n');
    }
    this.link(path.join(this.o.kitRoot, 'core', 'skills'), path.join(ad, 'skills'));
    // Antigravity discovers plugins as subdirectories of <config>/plugins/ and enables them by default; the state
    // lives in config.json only when the user toggles it. One junction (or one copied directory) is the whole registration.
    const dst = path.join(this.o.geminiDir, 'plugins', 'bearingkit');
    if (this.o.antigravityCopy) this.copyPlugin(ad, dst); else this.link(ad, dst);
  }
  // A copied plugin directory carries a marker naming the kit it came from, so only kit-made copies are ever replaced.
  copyMarker(dst) { return path.join(dst, '.bearingkit-copy'); }
  isKitCopy(dst) {
    try { return fs.readFileSync(this.copyMarker(dst), 'utf8').trim() === this.o.kitRoot; } catch { return false; }
  }
  copyPlugin(ad, dst) {
    let st = null;
    try { st = fs.lstatSync(dst); } catch { st = null; }
    if (st && st.isSymbolicLink()) { if (!this.isKitLink(dst)) { this.log(`! skipped ${fwd(dst)}: existing link not created by bearingkit`); return; } this.log(`- unlink ${fwd(dst)} (replaced by a copy)`); if (!this.o.dryRun) this.removeLink(dst); }
    else if (st && !this.isKitCopy(dst)) { this.log(`! skipped ${fwd(dst)}: existing directory not created by bearingkit`); return; }
    this.log(`+ copy ${fwd(ad)} → ${fwd(dst)} (skills dereferenced)`);
    if (this.o.dryRun) return;
    fs.rmSync(dst, { recursive: true, force: true });
    fs.cpSync(ad, dst, { recursive: true, dereference: true, filter: (src) => !/hooks\.template\.json$/.test(src) });
    fs.writeFileSync(this.copyMarker(dst), this.o.kitRoot + '\n');
  }
  removePluginDir(dst) {
    let st = null;
    try { st = fs.lstatSync(dst); } catch { return; }
    if (st.isSymbolicLink()) { this.unlink(dst); return; }
    if (!this.isKitCopy(dst)) { this.log(`! kept ${fwd(dst)}: directory not created by bearingkit`); return; }
    this.log(`- remove copied plugin ${fwd(dst)}`);
    if (!this.o.dryRun) fs.rmSync(dst, { recursive: true, force: true });
  }
  antigravityUninstall() {
    const ad = path.join(this.o.kitRoot, 'adapters', 'antigravity');
    this.removePluginDir(path.join(this.o.geminiDir, 'plugins', 'bearingkit'));
    this.unlink(path.join(ad, 'skills'));
    for (const f of ['rules/AGENTS.md', 'hooks.json', 'mcp_config.json', 'hooks/stack-profile.cjs']) {
      const p = path.join(ad, f);
      if (fs.existsSync(p)) { this.log(`- remove ${fwd(p)}`); if (!this.o.dryRun) fs.rmSync(p); }
    }
    const hooksDir = path.join(ad, 'hooks');
    if (!this.o.dryRun && fs.existsSync(hooksDir) && fs.readdirSync(hooksDir).length === 0) fs.rmdirSync(hooksDir);
  }
}

function printReport(inst, title) {
  const lines = [`${title} · kit ${inst.o.kitRoot}`, ...inst.report];
  process.stdout.write(lines.join('\n') + '\n');
  return inst.report;
}

async function install(argv) {
  const opts = resolveOptions(argv);
  const inst = new Installer(opts);
  inst.backup();
  if (opts.doClaude) inst.claudeInstall();
  if (opts.doAntigravity) inst.antigravityInstall(); else inst.log('= antigravity skipped (isolated Claude profile; pass --antigravity-dir to include it)');
  return printReport(inst, opts.dryRun ? 'bearingkit install (dry run)' : 'bearingkit install');
}

async function uninstall(argv) {
  const opts = resolveOptions(argv);
  const inst = new Installer(opts);
  inst.backup();
  if (opts.doClaude) inst.claudeUninstall();
  if (opts.doAntigravity) inst.antigravityUninstall();
  inst.log(`= backups kept under ${opts.backupsDir}`);
  return printReport(inst, opts.dryRun ? 'bearingkit uninstall (dry run)' : 'bearingkit uninstall');
}

module.exports = { install, uninstall, resolveOptions, Installer, DENY_RULES };
