#!/usr/bin/env node
// Reach of the stack files by entry skill: for every K session of node-01, py-01, php-01 and build-01 in
// evals/results (untracked, owner's machine only), whether a references/stacks/<stack>.md other than index.md was
// opened, and when, against the first skill the session invoked and whether a detect-stack output the session
// received listed a stack file (stackFiles non-empty). No session is run.
// Written 2026-09-30 for the php-01 reach probe (docs/specs/2026-09-28-stack-php-laravel-design.md, "Results").
// Usage: node evals/analysis/stack-reach-by-entry.cjs [resultsDir] [--rows]
'use strict';
const fs = require('fs');
const path = require('path');
const { events } = require('../../scripts/lib/bench-score.cjs');

const argv = process.argv.slice(2);
const rows = argv.includes('--rows');
const root = argv.find((a) => !a.startsWith('--')) || path.join(__dirname, '..', 'results');
const norm = (v) => JSON.stringify(v || {}).replace(/\\+/g, '/');
const totals = {};

for (const dir of fs.readdirSync(root).filter((d) => /bench-(node|py|php|build)-01/.test(d)).sort()) {
  let kit = '-';
  try { const m = JSON.parse(fs.readFileSync(path.join(root, dir, 'meta.json'), 'utf8')); if (m.kit) kit = m.kit.branch; } catch { /* runs before meta.kit */ }
  for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => /-K\d+\.raw\.jsonl$/.test(n)).sort()) {
    let model = '?'; let step = 0; let build = null; let listed = false; const skills = []; const reads = [];
    for (const e of events(fs.readFileSync(path.join(root, dir, f), 'utf8'))) {
      if (e.type === 'system' && e.subtype === 'init') model = e.model;
      if (e.type === 'user' && e.message && Array.isArray(e.message.content)) {
        for (const c of e.message.content) {
          if (c.type !== 'tool_result') continue;
          const text = typeof c.content === 'string' ? c.content : (c.content || []).map((x) => x.text || '').join('\n');
          if (/"stackFiles":\s*\[\s*"/.test(text)) listed = true; // detect-stack output with a non-empty list
        }
      }
      if (e.type !== 'assistant' || !e.message || !Array.isArray(e.message.content)) continue;
      for (const c of e.message.content) {
        if (c.type !== 'tool_use') continue;
        step++;
        const s = norm(c.input);
        if (c.name === 'Skill') {
          const name = String((c.input || {}).skill || '').replace(/^bearingkit:/, '');
          skills.push(name);
          if (/bk-build$/.test(name) && build === null) build = step;
        }
        const m = s.match(/stacks\/([a-z-]+)\.md/);
        if (m && m[1] !== 'index' && ['Read', 'Grep', 'Bash', 'PowerShell'].includes(c.name)) reads.push(step);
      }
    }
    const when = !reads.length ? 'none' : build === null ? 'no-build' : reads[0] < build ? 'before-build' : 'after-build';
    const task = dir.match(/bench-(\w+-01)/)[1];
    if (rows) console.log([dir, kit, f.replace('.raw.jsonl', ''), model, skills.join('>') || '-', `listed=${listed ? 1 : 0}`, `read=${when}`].join('  '));
    const key = `${task}  entry=${skills[0] || '-'}  listed=${listed ? 1 : 0}`;
    totals[key] = totals[key] || { n: 0, read: 0 };
    totals[key].n++;
    if (reads.length) totals[key].read++;
  }
}
for (const [k, v] of Object.entries(totals).sort()) console.log(`${k}  read ${v.read}/${v.n}`);
