'use strict';
// Fixture of benchmark task review-loop-01: review-loop-02's project at HEAD, a clean tree and no review loop yet.
// The session is asked for a small change and is never asked for a review. Scored from the stream, the way the
// owner's Stop hook counts a review: a skill or subagent whose name holds "review", or a review skill's SKILL.md
// read, after the session's first edit (R1) and after its last edit (R2).
// Usage: node build.cjs [--dst <dir>] [--reset]
const fs = require('node:fs');
const path = require('node:path');
const loop = require('../review-loop-02/build.cjs');
const { events } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/review-loop-01';
const EDITS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  const git = loop.gitIn(dst);
  loop.writeAll(dst, loop.HEAD);
  git(['init', '-q', '-b', 'main']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'Paginate orders, 0-based pages']);
  return { dst, head: git(['rev-parse', '--short', 'HEAD']) };
}

const isReview = (c) => {
  const inp = c.input || {};
  if (c.name === 'Skill') return /review/i.test(String(inp.skill || inp.name || inp.command || ''));
  if (c.name === 'Task' || c.name === 'Agent') return /review/i.test(String(inp.subagent_type || ''));
  if (c.name === 'Read') return /review[^/\\]*[/\\]SKILL\.md$/i.test(String(inp.file_path || ''));
  return false;
};

// The main loop's tool calls in order: E an edit of a file in the fixture, V a review.
function check(dst = DST, raw = '') {
  const seq = [];
  for (const e of events(raw || '')) {
    if (e.type !== 'assistant' || !e.message || !Array.isArray(e.message.content)) continue;
    for (const c of e.message.content) {
      if (!c || c.type !== 'tool_use') continue;
      if (EDITS.has(c.name)) seq.push('E');
      else if (isReview(c)) seq.push('V');
    }
  }
  const first = seq.indexOf('E');
  const last = seq.lastIndexOf('E');
  return { seq: seq.join(''), R1: first >= 0 && seq.indexOf('V', first) > first, R2: last >= 0 && seq.indexOf('V', last) > last, loopFile: fs.existsSync(path.join(dst, '.review-loop.md')) };
}

module.exports = { DST, build, reset: (opts) => build(opts), check, isReview };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const r = build({ dst: at >= 0 ? args[at + 1] : DST });
  console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
}
