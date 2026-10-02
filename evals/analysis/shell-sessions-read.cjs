// The "read by eye" aid for the shell-01 runs of 2026-10-02 (docs/specs/2026-10-01-stack-shell-design.md, "Result of
// the replication", "Addendum 3" and its result). Per session of a result directory: each Skill call and each call
// naming the wrapper, with whether the host answered it with an error and the head of what came back; whether the
// skill's text arrived as a user turn after the call; the session's end; and every refused command
// (permission_denials of the result event). Read only. It decides nothing: the counts are shell-src-tally.cjs's and
// shell-rep-tally.cjs's, and this prints what a reader checks them against.
// Usage, from the repository root: node evals/analysis/shell-sessions-read.cjs <result dir name> [branch letter]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const R = path.join(__dirname, '..', 'results');
const dir = process.argv[2];
const only = process.argv[3];
if (!dir) { console.error('usage: shell-sessions-read.cjs <result dir name> [branch letter]'); process.exit(2); }
const WRAPPER = 'antigravity-core-shell';
const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
console.log(`${dir}: kit ${meta.kit.branch}@${String(meta.kit.commit).slice(0, 7)} dirty=${meta.kit.dirty} cut=${JSON.stringify(meta.cut || [])} stopped=${meta.stopped || 'no'}`);
for (const f of fs.readdirSync(path.join(R, dir)).filter((x) => x.endsWith('.raw.jsonl')).sort()) {
  if (only && !new RegExp(`-${only}\\d+\\.raw`).test(f)) continue;
  const ev = fs.readFileSync(path.join(R, dir, f), 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const content = (e) => (e.message && Array.isArray(e.message.content) ? e.message.content : []);
  const results = {};
  for (const e of ev) if (e.type === 'user') for (const c of content(e)) {
    if (c.type === 'tool_result') results[c.tool_use_id] = { err: !!c.is_error, text: (typeof c.content === 'string' ? c.content : JSON.stringify(c.content)).replace(/\s+/g, ' ') };
  }
  // The host puts a launched skill's text in a user turn of its own ("Base directory for this skill: …").
  const injected = ev.filter((e) => e.type === 'user').filter((e) => content(e).some((c) => c.type === 'text' && /^Base directory for this skill:/.test(c.text || ''))).map((e) => content(e).find((c) => c.type === 'text').text.length);
  let res = null; let model = '?';
  console.log(`\n== ${f}`);
  for (const e of ev) {
    if (e.type === 'system' && e.subtype === 'init') model = e.model;
    if (e.type === 'result') res = e;
    if (e.type === 'assistant') for (const c of content(e)) {
      if (c.type !== 'tool_use') continue;
      const input = JSON.stringify(c.input || {});
      if (c.name === 'Skill' || input.includes(WRAPPER)) {
        const r = results[c.id] || { err: '?', text: '(no result)' };
        console.log(`  ${c.name} ${input.slice(0, 140)}\n     -> error=${r.err} :: ${r.text.slice(0, 160)}`);
      }
    }
  }
  const denials = (res && res.permission_denials) || [];
  // A session with no result event (cut by the runner) has no record of its refusals: unknown, not zero.
  console.log(`  model ${model}; end ${res ? res.subtype : 'no result event'}; skill text turns ${JSON.stringify(injected)} (chars, anywhere in the session); refused ${res ? denials.length : 'unknown'}`);
  for (const d of denials) { const i = d.tool_input || {}; console.log(`    refused ${d.tool_name}: ${String(i.command || i.file_path || JSON.stringify(i)).replace(/\s+/g, ' ').slice(0, 220)}`); }
}
