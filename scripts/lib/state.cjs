'use strict';
// Session state shared by hooks and skills. One JSON file per host session under ~/.bearingkit/state/,
// never inside the project. Writes are atomic (temp file + rename). Files older than seven days are pruned.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DEFAULTS = () => ({
  schema: 1,
  stackHash: '',
  lastInjectionHash: '',
  branch: '',
  dirty: false,
  activePlan: null,
  codeFilesChanged: [],
  guardrailRuns: [],
  hotPathTouched: false,
  independentReview: null,
  tempBypassMarkers: [],
  handoffPresent: false,
});

const norm = (p) => String(p || '').replace(/\\/g, '/');

function defaultDir() {
  return process.env.BEARINGKIT_STATE_DIR || path.join(os.homedir(), '.bearingkit', 'state');
}

class State {
  constructor({ host, sessionId, cwd, baseDir }) {
    this.dir = baseDir || defaultDir();
    fs.mkdirSync(this.dir, { recursive: true });
    this.file = path.join(this.dir, `${host}-${String(sessionId).replace(/[^A-Za-z0-9_.-]/g, '_')}.json`);
    if (!fs.existsSync(this.file)) {
      this._write({ ...DEFAULTS(), host, sessionId, cwd: norm(cwd), updatedAt: new Date().toISOString() });
    }
  }

  read() {
    return JSON.parse(fs.readFileSync(this.file, 'utf8'));
  }

  update(patch) {
    const next = { ...this.read(), ...patch, updatedAt: new Date().toISOString() };
    this._write(next);
    return next;
  }

  _write(data) {
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  prune(maxAgeDays = 7) {
    const cutoff = Date.now() - maxAgeDays * 86400000;
    for (const f of fs.readdirSync(this.dir)) {
      if (!f.endsWith('.json')) continue;
      const p = path.join(this.dir, f);
      try { if (fs.statSync(p).mtimeMs < cutoff) fs.rmSync(p); } catch { /* another process may have removed it */ }
    }
  }

  static fromFile(file) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const s = Object.create(State.prototype);
    s.dir = path.dirname(file);
    s.file = file;
    return Object.assign(s, { host: data.host, sessionId: data.sessionId });
  }

  // Newest state file whose cwd matches; used by skills that run outside a hook (record-guardrail).
  static latest({ cwd, baseDir }) {
    const dir = baseDir || defaultDir();
    if (!fs.existsSync(dir)) return null;
    const want = norm(cwd);
    let best = null;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      const p = path.join(dir, f);
      let data;
      try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
      if (norm(data.cwd) !== want) continue;
      const m = fs.statSync(p).mtimeMs;
      if (!best || m > best.m) best = { p, m };
    }
    return best ? State.fromFile(best.p) : null;
  }
}

module.exports = { State, DEFAULTS };
