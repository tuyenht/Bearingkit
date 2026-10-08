#!/usr/bin/env node
// Re-reads the K sessions of node-01 and py-01 that opened their stack file and asks where the deadline rule was
// lost. No session is run; it reads evals/results/ (untracked, owner's machine only). Usage:
//   node evals/analysis/stack-rule-timing.cjs [resultsDir]
// Columns: spec/build = bk-spec/bk-build invoked; read = the stack file first opened before bk-build started, after
// it, or with no bk-build at all; reread = opened again once bk-build started; client = the shared client file
// edited; scope = one assistant sentence naming a timeout or deadline and calling it pre-existing or out of scope;
// args = the first Skill call passed `args`; DL = the deadline hazard passed (N3 or Y2).
'use strict';
const fs = require('fs');
const path = require('path');
const { events, fisherExact } = require('../../scripts/lib/bench-score.cjs');

const root = process.argv[2] || path.join(__dirname, '..', 'results');
const DL = /timeout|deadline|AbortSignal|wait_for|asyncio\.timeout/i;
const SCOPE = /out of scope|pre-existing/i;
const norm = (v) => JSON.stringify(v || {}).replace(/\\+/g, '/');

const rows = [];
for (const dir of fs.readdirSync(root).filter((d) => /bench-(node|py)-01/.test(d)).sort()) {
  const stack = dir.includes('node') ? 'node' : 'python';
  const file = new RegExp(`stacks/${stack}\\.md`);
  for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => /-K\d+\.check\.json$/.test(n)).sort()) {
    const check = JSON.parse(fs.readFileSync(path.join(root, dir, f), 'utf8'));
    if (!check.Rfile) continue;
    const raw = fs.readFileSync(path.join(root, dir, f.replace('.check.json', '.raw.jsonl')), 'utf8');
    let step = 0; let spec = false; let build = null; let client = false; let scope = false; let args = null;
    const reads = [];
    for (const e of events(raw)) {
      if (e.type !== 'assistant' || !e.message || !Array.isArray(e.message.content)) continue;
      for (const c of e.message.content) {
        step++;
        if (c.type === 'tool_use') {
          const i = c.input || {};
          if (c.name === 'Skill') {
            const name = String(i.skill || i.name || i.command || '');
            if (args === null) args = Boolean(i.args);
            if (/bk-spec$/.test(name)) spec = true;
            if (/bk-build$/.test(name) && build === null) build = step;
          } else if (['Read', 'Grep', 'Bash', 'PowerShell'].includes(c.name) && file.test(norm(i))) reads.push(step);
          if (['Edit', 'Write', 'MultiEdit'].includes(c.name) && /client\.(cjs|py)$/.test(String(i.file_path || '').replace(/\\/g, '/'))) client = true;
        } else {
          const body = c.text || c.thinking || '';
          for (const s of body.split(/(?<=[.!?;])\s+|\n+/)) if (SCOPE.test(s) && DL.test(s)) scope = true;
        }
      }
    }
    rows.push({
      id: `${dir.replace(/^\d{4}-\d{2}-\d{2}-bench-/, '')} ${f.match(/K\d+/)[0]}`,
      task: stack === 'node' ? 'node-01' : 'py-01',
      spec, build: build !== null,
      read: build === null ? 'no-build' : reads[0] < build ? 'before' : 'after',
      reread: build !== null && reads[0] < build && reads.some((r) => r > build),
      client, scope, args: Boolean(args),
      DL: 'N3' in check ? check.N3 : check.Y2,
    });
  }
}

const yn = (b) => (b ? 'y' : '.');
console.log('session                   spec build read      reread client scope args DL');
for (const r of rows) console.log(`${r.id.padEnd(26)}${[yn(r.spec), yn(r.build), r.read.padEnd(8), yn(r.reread), yn(r.client), yn(r.scope), yn(r.args), yn(r.DL)].join('    ')}`);
const pass = (g) => `${g.filter((r) => r.DL).length}/${g.length}`;
const fisher = (a, b) => fisherExact(a.filter((r) => r.DL).length, a.filter((r) => !r.DL).length, b.filter((r) => r.DL).length, b.filter((r) => !r.DL).length).toFixed(3);
const by = (pred) => rows.filter(pred);
console.log(`\nsessions that opened the file: ${rows.length}`);
for (const task of ['node-01', 'py-01']) {
  const t = by((r) => r.task === task);
  const [after, before, none] = ['after', 'before', 'no-build'].map((k) => t.filter((r) => r.read === k));
  console.log(`${task}: DL read after bk-build ${pass(after)}, before bk-build ${pass(before)}, no bk-build ${pass(none)}; p(after vs before) = ${after.length && before.length ? fisher(after, before) : 'n/a'}`);
}
const edited = by((r) => r.client); const kept = by((r) => !r.client);
console.log(`client edited ${pass(edited)}, client unchanged ${pass(kept)}; p = ${fisher(edited, kept)}`);
console.log(`read before bk-build: ${by((r) => r.read === 'before').length}, re-read once bk-build started: ${by((r) => r.reread).length}`);
console.log(`missed the deadline: ${by((r) => !r.DL).length}, of which an explicit pre-existing/out-of-scope sentence: ${by((r) => !r.DL && r.scope).length}`);
const [noArgs, withArgs] = [by((r) => !r.args), by((r) => r.args)];
console.log(`first Skill call without args ${pass(noArgs)} (${[...new Set(noArgs.map((r) => r.id.split(' ')[0]))].join(', ')}), with args ${pass(withArgs)}`);
