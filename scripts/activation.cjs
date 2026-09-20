'use strict';
// Per-project activation (D5 question 29: installed once, used only where the owner says). The payload sits in one
// store under the kit's own home; a project is switched on by one entry in the host's own configuration file:
//
//   Antigravity      <project>/.agents/plugins.json   entries[] with the store's path (the host's documented way of
//                                                     declaring a plugin kept outside its discovery roots)
//   Claude Code      <project>/.claude/settings.local.json   enabledPlugins { "bearingkit@bearingkit": true }
//
// Nothing of the kit's own lands in a project, and `deactivate` takes back exactly what `activate` wrote. Both files
// belong to the host, not to the repository, so in a git clone they are ignored through .git/info/exclude, which is
// local and equally reversible. Sources for the two mechanisms: docs/compat/2026-09-19-per-project-activation.md.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const PLUGIN_ID = 'bearingkit@bearingkit';
const AGENTS_FILE = ['.agents', 'plugins.json'];
const CLAUDE_FILE = ['.claude', 'settings.local.json'];
const EXCLUDE_HEAD = '# bearingkit: host files for this clone (bearingkit deactivate removes this block)';
const HOSTS = ['antigravity', 'claude'];

const storePath = (home = os.homedir()) => path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit');
// The path travels into a JSON file a host reads on Windows too: forward slashes, no escaping surprises.
const storeEntry = (home) => storePath(home).replace(/\\/g, '/');

// null means "no such file". A file that exists and does not parse is somebody's half-finished edit: the kit stops
// rather than replacing it, because replacing it would throw their settings away silently.
const readJson = (file) => {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Error(`${file} is not valid JSON (${e.message}); fix or move it, the kit will not overwrite it`); }
};
// A host file the kit merges into has to be a JSON object: an array or a scalar at the root would be spread into
// one and everything it held would be lost, so it is refused like a file that does not parse.
const readHostFile = (file) => {
  const doc = readJson(file);
  if (doc === null) return {};
  if (typeof doc !== 'object' || Array.isArray(doc)) throw new Error(`${file} is not a JSON object at its root; fix or move it, the kit will not overwrite it`);
  return doc;
};
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); };
const isEmpty = (o) => o && typeof o === 'object' && Object.keys(o).length === 0;

// A file left holding nothing but what the kit had put in it goes away again, and so does the folder made for it; a
// file that still holds someone else's settings stays and keeps them.
function writeOrRemove(file, value) {
  if (isEmpty(value)) {
    fs.rmSync(file, { force: true });
    const dir = path.dirname(file);
    try { if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir); } catch { /* someone else's folder */ }
    return;
  }
  writeJson(file, value);
}

function antigravityPlan(project, home, on) {
  const file = path.join(project, ...AGENTS_FILE);
  const value = readHostFile(file);
  const entries = Array.isArray(value.entries) ? value.entries : [];
  const wanted = storeEntry(home);
  const has = entries.some((e) => e && typeof e.path === 'string' && e.path.replace(/\\/g, '/') === wanted);
  if (on === has) return { host: 'antigravity', kind: '=', file, text: on ? `${file} already names the store` : `${file} does not name the store` };
  const next = { ...value, entries: on ? [...entries, { path: wanted }] : entries.filter((e) => !(e && typeof e.path === 'string' && e.path.replace(/\\/g, '/') === wanted)) };
  if (!on && next.entries.length === 0) delete next.entries;
  return { host: 'antigravity', kind: on ? '+' : '-', file, text: `${on ? 'the store' : 'the kit entry'} ${on ? 'in' : 'out of'} ${file}`, apply: () => writeOrRemove(file, next) };
}

function claudePlan(project, home, on) {
  const file = path.join(project, ...CLAUDE_FILE);
  const value = readHostFile(file);
  const plugins = value.enabledPlugins && typeof value.enabledPlugins === 'object' && !Array.isArray(value.enabledPlugins) ? value.enabledPlugins : {};
  const has = plugins[PLUGIN_ID] === true;
  if (on === has) return { host: 'claude', kind: '=', file, text: on ? `${file} already enables ${PLUGIN_ID}` : `${file} does not enable ${PLUGIN_ID}` };
  const nextPlugins = { ...plugins };
  if (on) nextPlugins[PLUGIN_ID] = true; else delete nextPlugins[PLUGIN_ID];
  const next = { ...value, enabledPlugins: nextPlugins };
  if (!on && isEmpty(nextPlugins)) delete next.enabledPlugins;
  return { host: 'claude', kind: on ? '+' : '-', file, text: `${PLUGIN_ID} ${on ? 'on in' : 'out of'} ${file}`, apply: () => writeOrRemove(file, next) };
}

const git = (project, args) => spawnSync('git', args, { cwd: project, encoding: 'utf8' });
const isRepo = (project) => git(project, ['rev-parse', '--git-dir']).status === 0;
const excludeFile = (project) => {
  const dir = String(git(project, ['rev-parse', '--absolute-git-dir']).stdout || '').trim();
  return dir ? path.join(dir, 'info', 'exclude') : null;
};

// The two paths are ignored only for this clone, and only when the repository does not ignore them already: a
// project that has its own rule for `.claude/` keeps it, and nothing is ever written into .gitignore.
function excludePlan(project, on) {
  if (!isRepo(project)) return null;
  const file = excludeFile(project);
  if (!file) return null;
  const rels = [AGENTS_FILE, CLAUDE_FILE].map((p) => '/' + p.join('/'));
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const lines = text.split('\n');
  const start = lines.indexOf(EXCLUDE_HEAD);
  if (on) {
    if (start !== -1) return { host: 'git', kind: '=', file, text: `${file} already ignores them` };
    const missing = rels.filter((rel) => git(project, ['check-ignore', '-q', rel.slice(1)]).status !== 0);
    if (!missing.length) return null;
    const next = (text.endsWith('\n') || text === '' ? text : text + '\n') + [EXCLUDE_HEAD, ...missing, ''].join('\n');
    return { host: 'git', kind: '+', file, text: `${missing.join(', ')} ignored in this clone (${file})`, apply: () => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, next); } };
  }
  if (start === -1) return null;
  // Only the kit's own two lines go, not whatever someone wrote under them.
  let end = start + 1;
  while (end < lines.length && rels.includes(lines[end])) end++;
  const next = lines.slice(0, start).concat(lines.slice(end)).join('\n');
  return { host: 'git', kind: '-', file, text: `the ignore block out of ${file}`, apply: () => fs.writeFileSync(file, next) };
}

function plan(opts, on) {
  const project = path.resolve(opts.project || process.cwd());
  const home = opts.home || os.homedir();
  const host = opts.host || 'all';
  if (host !== 'all' && !HOSTS.includes(host)) throw new Error(`unknown host ${host}; use ${HOSTS.join(', ')} or all`);
  const wanted = host === 'all' ? HOSTS : [host];
  const steps = [];
  if (wanted.includes('antigravity')) steps.push(antigravityPlan(project, home, on));
  if (wanted.includes('claude')) steps.push(claudePlan(project, home, on));
  if (opts.gitExclude !== false) { const e = excludePlan(project, on); if (e) steps.push(e); }
  return { project, home, steps };
}

function apply(opts, on) {
  const { project, home, steps } = plan(opts, on);
  const dryRun = Boolean(opts.dryRun);
  const log = opts.log || (() => {});
  for (const step of steps) {
    log(`${step.kind} ${dryRun && step.kind !== '=' ? 'would be ' : ''}${step.text}`);
    if (!dryRun && step.apply) step.apply();
  }
  return { project, home, dryRun, actions: steps.map(({ host, kind, file, text }) => ({ host, kind, file, text })) };
}

const activate = (opts = {}) => apply(opts, true);
const deactivate = (opts = {}) => apply(opts, false);

// Three questions, answered by reading: is the store there, is it the checkout's current content, and is this project
// switched on for each host. Reading only, like doctor.
function status(opts = {}) {
  const project = path.resolve(opts.project || process.cwd());
  const home = opts.home || os.homedir();
  const root = opts.root || path.resolve(__dirname, '..');
  // The copy a host loads may be the store or, before per-project activation, the global copy under ~/.gemini;
  // doctor reads whichever is on disk, store first, and status has to agree with it or the two contradict.
  const { MARKER } = require('./antigravity.cjs');
  const candidates = opts.dest
    ? [[path.resolve(opts.dest), 'named by --dest']]
    : [[storePath(home), 'store'], [path.join(home, '.gemini', 'config', 'plugins', 'bearingkit'), 'global copy']];
  const found = candidates.find(([p]) => fs.existsSync(path.join(p, MARKER)));
  const [store, which] = found || candidates[0];
  const present = Boolean(found);
  const current = present && require('./doctor.cjs').sameTree(path.join(root, 'skills'), path.join(store, 'skills'));
  // status only reads, so a file it cannot parse is reported, not thrown: the answer is still "not switched on".
  const tryRead = (file) => { try { return { value: readJson(file) }; } catch (e) { return { value: null, unreadable: e.message }; } };
  const ag = tryRead(path.join(project, ...AGENTS_FILE));
  const cc = tryRead(path.join(project, ...CLAUDE_FILE));
  const wanted = storeEntry(home);
  return {
    project,
    store: { path: store, present, current, which },
    hosts: {
      antigravity: { activated: Boolean(ag.value && Array.isArray(ag.value.entries) && ag.value.entries.some((e) => e && typeof e.path === 'string' && e.path.replace(/\\/g, '/') === wanted)), unreadable: ag.unreadable, file: path.join(project, ...AGENTS_FILE) },
      claude: { activated: Boolean(cc.value && cc.value.enabledPlugins && cc.value.enabledPlugins[PLUGIN_ID] === true), unreadable: cc.unreadable, file: path.join(project, ...CLAUDE_FILE) },
    },
  };
}

// The six commands, one verb set for every host: install, update, activate, deactivate, status, uninstall. Each takes
// --host all|claude|antigravity, a project (positional or --project), --dry-run, and prints `+`, `-` or `=` lines.
// What only the host's own CLI may do — registering the marketplace, fetching the plugin into its cache — is printed
// for the owner to run, never run here: those write under ~/.claude.
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) { out[a.slice(2)] = next; i++; } else out[a.slice(2)] = true;
  }
  return out;
}

const USAGE = [
  'usage: bearingkit <install|update|activate|deactivate|status|uninstall> [options]',
  '  --host all|antigravity|claude   which host (default all; a host that is not set up is skipped)',
  '  --project <dir>                 the project to switch on or off (default: the working directory)',
  '  --dest <dir>                    where the store lives (default ~/.bearingkit/antigravity/plugins/bearingkit)',
  '  --dry-run                       say what would change, write nothing',
  '  --no-git-exclude                do not add the two host files to .git/info/exclude',
  '  --no-pull                       update: refresh the store without pulling the checkout first',
].join('\n') + '\n';

const CLAUDE_STEPS = (root) => [
  `  claude plugin marketplace add ${root}`,
  '  claude plugin install bearingkit@bearingkit',
  '  then, for every project that should use it: bearingkit activate',
  '  to follow the repository by itself, in ~/.claude/settings.json (documented, not run here):',
  '    "extraKnownMarketplaces": { "bearingkit": { "source": { "source": "github", "repo": "tuyenht/Bearingkit" }, "autoUpdate": true } }',
];

function cli(cmd, argv = []) {
  const args = parseArgs(argv);
  const out = (l) => process.stdout.write(l + '\n');
  const host = args.host === undefined ? 'all' : String(args.host);
  if (host !== 'all' && !HOSTS.includes(host)) { process.stderr.write(`unknown host ${host}\n` + USAGE); process.exitCode = 2; return; }
  const root = path.resolve(__dirname, '..');
  const home = os.homedir();
  const dest = args.dest ? path.resolve(String(args.dest)) : storePath(home);
  const dryRun = Boolean(args['dry-run']);
  const project = path.resolve(String(args.project || args._[0] || process.cwd()));
  const wants = (h) => host === 'all' || host === h;
  const antigravity = require('./antigravity.cjs');

  if (cmd === 'activate' || cmd === 'deactivate') {
    const r = (cmd === 'activate' ? activate : deactivate)({ project, home, host, dryRun, gitExclude: args['git-exclude'] !== false && !args['no-git-exclude'], log: out });
    const wrote = r.actions.filter((a) => a.kind !== '=').length;
    out(`${dryRun ? 'dry run: ' : ''}${project}: ${wrote ? `${wrote} change${wrote === 1 ? '' : 's'}` : 'nothing to change'}`);
    if (cmd === 'activate' && wants('antigravity') && !fs.existsSync(path.join(dest, '.bearingkit-copy'))) out(`! the store is not installed yet: run  bearingkit install`);
    return;
  }

  if (cmd === 'status') {
    const s = status({ project, home, root, dest: args.dest ? dest : undefined });
    out(`store: ${s.store.present ? (s.store.current ? `installed and current, ${s.store.which} (${s.store.path})` : `installed but older than this checkout, ${s.store.which} (${s.store.path}) — run  bearingkit update`) : `not installed (${s.store.path}) — run  bearingkit install`}`);
    out(`project ${s.project}`);
    for (const h of HOSTS) out(`  ${h}: ${s.hosts[h].activated ? 'on' : 'off'}  (${s.hosts[h].file})${s.hosts[h].unreadable ? '  ! not valid JSON, fix it before activating' : ''}`);
    return;
  }

  if (cmd === 'install' || cmd === 'update') {
    if (cmd === 'update' && !args['no-pull'] && !dryRun) {
      const repo = spawnSync('git', ['rev-parse', '--git-dir'], { cwd: root, encoding: 'utf8' }).status === 0;
      const dirty = repo && String(spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout || '').trim();
      if (!repo) out('= installed from a package, not a git checkout: update it with your package manager, then run this again');
      else if (dirty) out('= checkout has changes, not pulling; commit or stash first, or pass --no-pull');
      else {
        const pull = spawnSync('git', ['pull', '--ff-only'], { cwd: root, encoding: 'utf8' });
        out(`${pull.status === 0 ? '=' : '!'} ${String(pull.stdout || pull.stderr || '').trim().split('\n')[0] || 'pull done'}`);
      }
    }
    if (wants('antigravity')) {
      const r = antigravity.install({ root, dest, dryRun, log: out });
      out(`${dryRun ? 'dry run: ' : ''}store ${cmd === 'install' ? 'installed' : 'refreshed'} at ${r.dest}`);
    }
    if (wants('claude')) {
      out('for Claude Code, run these yourself (they write under ~/.claude):');
      for (const l of cmd === 'install' ? CLAUDE_STEPS(root) : ['  claude plugin update bearingkit@bearingkit', '  or let it follow the repository by itself with "autoUpdate": true on the marketplace (see  bearingkit install)']) out(l);
    }
    if (wants('antigravity') && cmd === 'install') out('then, in each project that should use the kit:  bearingkit activate');
    return;
  }

  if (cmd === 'uninstall') {
    if (wants('antigravity')) { antigravity.uninstall({ dest, dryRun, log: out }); out('projects you activated keep their entry; run  bearingkit deactivate  in each of them'); }
    if (wants('claude')) { out('for Claude Code, run this yourself:'); out('  claude plugin uninstall bearingkit@bearingkit'); }
    return;
  }

  process.stderr.write(USAGE);
  process.exitCode = 2;
}

module.exports = { activate, deactivate, status, storePath, storeEntry, plan, cli, USAGE, PLUGIN_ID, AGENTS_FILE, CLAUDE_FILE, EXCLUDE_HEAD, HOSTS };
