'use strict';
// Term rules of the review-loop tasks, matched per unit of the answer, not per list item. A loop answer groups its
// points under headings ("Still open (from round 1)", "Not checked"), and the heading is what says a point is old or
// outside the round; the shared matcher of scripts/lib/bench-score.cjs splits the bullets from their heading. Found
// on the calibration session of 2026-10-28, before the registered runs; the shared matcher stays as it is, since
// other tasks' registered scores depend on it.
// A unit: a paragraph that opens on a heading line (markdown heading, a bold line, a line ending in ":") with
// everything under it; otherwise each top-level list item, or the paragraph itself.
const HEADING = /^(#{1,6} |\*\*[^*].*\*\*:?\s*$|.*:\s*$)/;
const ITEM = /^(\d+[.)]|[-*]) /;

function units(answer) {
  const paras = String(answer || '').replace(/\r\n/g, '\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const merged = [];
  for (let i = 0; i < paras.length; i++) {
    const lines = paras[i].split('\n');
    if (lines.length === 1 && HEADING.test(lines[0]) && i + 1 < paras.length) { paras[i + 1] = `${paras[i]}\n${paras[i + 1]}`; continue; }
    merged.push(paras[i]);
  }
  const out = [];
  for (const p of merged) {
    const lines = p.split('\n');
    if (HEADING.test(lines[0])) { out.push(p); continue; }
    let cur = [];
    for (const l of lines) {
      if (ITEM.test(l) && cur.length) { out.push(cur.join('\n')); cur = []; }
      cur.push(l);
    }
    if (cur.length) out.push(cur.join('\n'));
  }
  return out;
}

const any = (text, terms) => (terms || []).some((t) => new RegExp(t, 'i').test(text));
const hits = (unit, rule) => rule.all.every((g) => any(unit, g)) && !any(unit, rule.unless);

// rules: { <id>: { all: [[...], ...], unless: [...] } }. Returns, per id, whether some unit matches.
function score(answer, rules) {
  const us = units(answer);
  return Object.fromEntries(Object.entries(rules).map(([id, rule]) => [id, us.some((u) => hits(u, rule))]));
}

module.exports = { units, score };
