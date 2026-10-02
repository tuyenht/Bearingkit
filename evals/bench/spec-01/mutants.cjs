'use strict';
// Mutations of the spec-01 scorer: each drops one condition of build.cjs, and tests/bench-spec-01.test.cjs must turn
// red on every one (the unmutated control stays green). Each runs on its own copy. Red or green comes from the exit
// code of `node --test`; the TAP output is only mined for the reason.
// Usage, from the repository root: node evals/bench/spec-01/mutants.cjs <scratch dir> [M03,M07]
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const IS = "const is = inside ? (b.type !== 'para' || b.text.includes('?')) : asks;";
const MUTANTS = [
  ['M01 hazards ignore O1', 'const bs = out.O1 ? blocks(text) : [];', 'const bs = blocks(text);'],
  ['M02 a hazard needs one group only', 'if (hits.some((x) => !x)) return false;', 'if (hits.every((x) => !x)) return false;'],
  ['M03 H6 ignores the recommendation', 'if (q) return q.recommended;', 'if (q) return true;'],
  ['M04 H6 ignores the record', 'return b.above.some((t) => rx(rules.recordedHeading).test(t)) || hits.flat().some((s) => rx(rules.recordedSentence).test(s));', 'return true;'],
  ['M05 H7 accepts a placeholder under the heading', ' && !rx(h.empty).test(bs[i + 1].text)', ''],
  ['M06 H7 accepts a label with one word', " && words(s.replace(rx(h.inline), '')) >= h.minWords", ''],
  ['M07 a decoy reads the answer too', 'q.block.text.split(rx(`${rules.recommendation}|answer:`))[0]', 'q.block.text'],
  ['M08 a decoy ignores the decision terms', ' && !rx(rules.decisionTerms).test(t)', ''],
  ['M09 a decoy ignores the decision verb', ' && !rx(rules.decisionVerb).test(t)', ''],
  ['M10 a decoy counts outside questions', 'list.some((q) => { const t = asked(q);', 'bs.map((b) => ({ block: b })).some((q) => { const t = asked(q);'],
  ['M11 G1 ignores the recommendation', 'list.every((q) => q.numbered && q.recommended)', 'list.every((q) => q.numbered)'],
  ['M12 G1 ignores the numbering', 'list.every((q) => q.numbered && q.recommended)', 'list.every((q) => q.recommended)'],
  ['M13 G1 holds with no question', 'out.G1 = out.O1 && list.length > 0 && ', 'out.G1 = out.O1 && '],
  ['M14 G2 has no cap', 'out.G2 = out.O1 && list.length <= 4;', 'out.G2 = out.O1;'],
  ['M15 an answer line counts as a question', "if (answer(b) || (b.type === 'item' && b.nested)) {", "if ((b.type === 'item' && b.nested)) {"],
  ['M16 a nested item counts as a question', "if (answer(b) || (b.type === 'item' && b.nested)) {", 'if (answer(b)) {'],
  ['M17 a header row counts as a question', "if (b.type === 'row' && b.header) return;", ''],
  ['M18 prose with a question mark counts anywhere', IS, "const is = inside ? (b.type !== 'para' || b.text.includes('?')) : b.text.includes('?');"],
  ['M19 a paragraph with no question mark counts inside a question section', IS, 'const is = inside ? true : asks;'],
  ['M20 blocks under a heading question count again', 'if (headQ) { owner.set(b, headQ); return; }', 'if (headQ) owner.set(b, headQ);'],
  ['M21 the next question lends its recommendation', 'if (!follows) break;', ''],
  ['M22 an empty recommendation cell counts', "q.recommended = column >= 0 && !!(b.cells[column] || '').trim();", 'q.recommended = column >= 0;'],
  ['M23 a closing heading does not end the question section', 'if (rx(rules.closingHeading).test(b.above[i])) return false; ', ''],
  ['M24 the options under a paragraph question count', "if (inside && paraQ && b.type === 'item') { owner.set(b, paraQ); return; }", ''],
  ['M25 a sentence group reads the whole block', 'const hit = sentences(b.text).filter(', 'const hit = [b.text].filter('],
  ['M26 H6 ignores a question in a bullet', "if (b.text.includes('?') && rx(rules.recommendation).test(b.text)) return true;", ''],
  ['M27 H6 ignores the record in the sentence', ' || hits.flat().some((s) => rx(rules.recordedSentence).test(s))', ''],
  ['M28 a heading and its line are two sentences', "(open.type === 'heading' && open.text === open.title ? ': ' : ' ')", "(open.type === 'heading' && open.text === open.title ? '. ' : ' ')"],
  ['M29 O2 ignores the suite', 'out.O2 = out.suite && outside.length === 0;', 'out.O2 = outside.length === 0;'],
  ['M30 O2 ignores files outside docs/', 'out.O2 = out.suite && outside.length === 0;', 'out.O2 = out.suite;'],
  ['M31 O1 accepts any text', 'out.O1 = text.trim().length >= rules.minChars;', 'out.O1 = text.trim().length > 0;'],
  ['M32 reach counts any kit skill', '/(^|:)bk-spec$/.test(', '/(^|:)bk-/.test('],
  ['M33 reach counts a listing', "if (!['Read', 'Grep', 'Bash', 'PowerShell'].includes(c.name)) continue;", "if (!['Read', 'Grep', 'Glob', 'Bash', 'PowerShell'].includes(c.name)) continue;"],
];
const COPY = ['scripts', 'evals/bench/spec-01', 'tests/bench-spec-01.test.cjs'];

const pool = (tasks, n) => { const out = []; let next = 0; const worker = async () => { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }; return Promise.all(Array.from({ length: n }, worker)).then(() => out); };

if (require.main === module) {
  const scratch = process.argv[2];
  if (!scratch) { console.error('usage: node evals/bench/spec-01/mutants.cjs <scratch dir> [ids]'); process.exit(2); }
  const src = fs.readFileSync('evals/bench/spec-01/build.cjs', 'utf8');
  const only = process.argv[3] ? process.argv[3].split(',') : null;
  const jobs = [['M00 none (control)', '', ''], ...MUTANTS.filter(([name]) => !only || only.includes(name.split(' ')[0]))].map(([name, from, to], i) => () => {
    if (from && src.split(from).length !== 2) return Promise.resolve(`${name}: PATTERN NOT FOUND ONCE`);
    const dir = path.join(scratch, `mutant-${i}`);
    fs.rmSync(dir, { recursive: true, force: true });
    for (const p of COPY) fs.cpSync(p, path.join(dir, p), { recursive: true });
    fs.writeFileSync(path.join(dir, 'evals/bench/spec-01/build.cjs'), from ? src.split(from).join(to) : src);
    return new Promise((resolve) => exec('node --test --test-reporter=tap tests/bench-spec-01.test.cjs', { cwd: dir, timeout: 600000 }, (err, stdout) => {
      const lines = stdout.split('\n');
      const at = lines.findIndex((l) => /^not ok/.test(l));
      const why = at < 0 ? '' : lines[at].trim().slice(0, 100);
      fs.rmSync(dir, { recursive: true, force: true });
      resolve(`${name}: ${err && err.killed ? 'NO RESULT (killed)' : err ? 'RED' : 'GREEN'} ${why}`);
    }));
  });
  pool(jobs, 3).then((r) => console.log(r.join('\n')));
}

module.exports = { MUTANTS };
