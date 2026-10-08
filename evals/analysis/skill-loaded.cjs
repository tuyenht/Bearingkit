#!/usr/bin/env node
// Did the host deliver a kit skill's text into a measured session? The bench stream cannot say for a session
// entered by a slash command: it holds no Skill call and no prompt. The host's own transcript of the session can:
// it records the skill's text as a user message marked isMeta that starts "Base directory for this skill: <dir>".
// This reads, for every session of a results folder, the session id from the stream's init event, finds the
// transcript <profile>/projects/*/<session id>.jsonl, and prints one row per session. It runs no session.
//   node evals/analysis/skill-loaded.cjs <results folder> [--skill bk-build] [--marker "<text>"]
//                                        [--profile C:/Projects/Bearingkit/_build/profile/claude]
// loaded = an isMeta user message whose text starts with "Base directory for this skill:" and whose directory ends
// in skills/<skill>, and which contains "# <skill>" (and the marker, when one is given). A session whose transcript
// is missing, or whose stream has no init event, is printed as "unknown", never as loaded.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

function textOf(message) {
  const c = message && message.content;
  if (typeof c === 'string') return c;
  if (!Array.isArray(c)) return '';
  return c.filter((x) => x && x.type === 'text').map((x) => x.text || '').join('\n');
}
function parseLines(file) {
  const out = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch (e) { /* a cut line is not an event */ }
  }
  return out;
}
// The predicate, on the events of one transcript.
function loaded(events, skill, marker) {
  for (const e of events) {
    if (e.type !== 'user' || e.isMeta !== true) continue;
    const t = textOf(e.message);
    const m = /^Base directory for this skill: ([^\r\n]+)/.exec(t);
    if (!m) continue;
    const dir = m[1].trim().replace(/\\/g, '/').replace(/\/+$/, '');
    if (!dir.endsWith(`skills/${skill}`)) continue;
    if (!t.includes(`# ${skill}`)) continue;
    if (marker && !t.includes(marker)) continue;
    return true;
  }
  return false;
}
function sessionId(streamFile) {
  for (const e of parseLines(streamFile)) if (e.type === 'system' && e.subtype === 'init') return { id: e.session_id || null, model: e.model || null, host: e.claude_code_version || null };
  return { id: null, model: null, host: null };
}
function transcriptFor(profile, id) {
  const root = path.join(profile, 'projects');
  if (!id || !fs.existsSync(root)) return null;
  for (const d of fs.readdirSync(root)) {
    const f = path.join(root, d, `${id}.jsonl`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}
function main(argv) {
  const args = { skill: 'bk-build', marker: '', profile: path.join(__dirname, '..', '..', '_build', 'profile', 'claude') };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--skill') args.skill = argv[++i];
    else if (argv[i] === '--marker') args.marker = argv[++i];
    else if (argv[i] === '--profile') args.profile = argv[++i];
    else rest.push(argv[i]);
  }
  if (rest.length !== 1 || !fs.existsSync(rest[0])) { process.stderr.write('usage: skill-loaded.cjs <results folder> [--skill bk-build] [--marker "<text>"] [--profile <dir>]\n'); process.exit(2); }
  const dir = rest[0];
  let yes = 0; let n = 0; let unknown = 0;
  process.stdout.write(`session              model                 host      loaded  transcript\n`);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.raw.jsonl')).sort()) {
    n++;
    const s = sessionId(path.join(dir, f));
    const t = transcriptFor(args.profile, s.id);
    let verdict = 'unknown';
    if (t) { verdict = loaded(parseLines(t), args.skill, args.marker) ? 'yes' : 'no'; }
    if (verdict === 'yes') yes++;
    if (verdict === 'unknown') unknown++;
    process.stdout.write(`${f.replace('.raw.jsonl', '').padEnd(21)}${String(s.model).padEnd(22)}${String(s.host).padEnd(10)}${verdict.padEnd(8)}${t ? path.basename(t) : (s.id ? 'not found' : 'no init event')}\n`);
  }
  process.stdout.write(`\n${args.skill}${args.marker ? ` with marker` : ''}: loaded in ${yes} of ${n}; unknown ${unknown}\n`);
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { loaded, textOf };
