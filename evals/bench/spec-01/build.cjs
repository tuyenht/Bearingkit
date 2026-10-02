'use strict';
// Fixture of benchmark task spec-01 (registered in docs/specs/2026-10-02-bk-spec-design.md): a small helpdesk service
// and a feature request that contradicts its glossary and one of its nightly jobs. The session is asked for a spec,
// not for code. Scored after the session on the spec it wrote (docs/specs/reopen-ticket.md) by the frozen rules of
// rules.json: seven hazards (H1..H7), three decoys (facts the fixture answers, asked of the user), the form of its
// open questions (G1, G2), and two outcomes (O1 the file, O2 nothing built and the suite green).
// Usage: node build.cjs [--dst <dir>] [--reset] [--check] | node build.cjs --score <spec.md>
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { commitAttempts, events } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/spec-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/spec-01';
const APP = path.join(__dirname, 'app');
const RULES = JSON.parse(fs.readFileSync(path.join(__dirname, 'rules.json'), 'utf8'));
const REFERENCES = ['brainstorming', 'domain-language', 'module-design', 'prototyping'];
const DEFAULTS = { suiteMs: 120000 };

const gitAt = (dir) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Mai Do', '-c', 'user.email=mai@helpdesk.example', '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  const git = gitAt(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'helpdesk: tickets, portal, nightly jobs');
  git('update-ref', TAG, 'HEAD');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitAt(dst);
  git('checkout', '-q', '-f', 'main');
  git('reset', '-q', '--hard', TAG);
  git('clean', '-q', '-fdx');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

// What the session left, from git: [status, path] relative to the fixture root.
function status(dst) {
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: dst, encoding: 'utf8' });
  return r.stdout.split('\n').filter(Boolean).map((l) => [l.slice(0, 2), l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop()]);
}

const rx = (s) => new RegExp(s, 'iu');
// A block's text from its first letter, digit or opening bracket: emphasis, quote marks and emoji in front are dropped.
const lead = (s) => String(s).replace(/^[^\p{L}\p{N}(]+/u, '');
// A block's text without the markdown in front of it, keeping an arrow or a tick that marks an answer.
const bare = (s) => String(s).replace(/^[\s>*_`~-]+/, '');
// Sentences end at a full stop, a question mark or an exclamation mark; a semicolon or a colon does not end one.
const sentences = (s) => String(s).split(/(?<=[.!?])\s+/);
const words = (s) => (String(s).match(/[\p{L}\p{N}]+/gu) || []).length;

// The spec as blocks, in order. A block is one heading with the text up to the next blank line, one paragraph, one
// list item (with its continuation lines, without its nested items, which are blocks of their own) or one table row.
// Fenced code is skipped. `above` holds the titles of the headings a block stands under, outermost first.
function blocks(md) {
  const out = [];
  const heads = [];
  let open = null;
  let listIndent = null;
  let fence = false;
  let table = 0;
  let tableHead = null;
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  const section = () => heads.map((h) => h.title);
  lines.forEach((line, n) => {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; open = null; return; }
    if (fence) return;
    if (!line.trim()) { open = null; table = 0; tableHead = null; return; }
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h) {
      listIndent = null; table = 0;
      while (heads.length && heads[heads.length - 1].level >= h[1].length) heads.pop();
      open = { type: 'heading', level: h[1].length, title: h[2], text: h[2], above: section() };
      heads.push({ level: h[1].length, title: h[2] });
      out.push(open);
      return;
    }
    if (/^\s*\|/.test(line)) {
      open = null; listIndent = null;
      const separator = /^\s*\|?\s*:?-{2,}/.test(line);
      const header = table === 0 && /^\s*\|?\s*:?-{2,}/.test(lines[n + 1] || '');
      table++;
      if (!separator) {
        const row = { type: 'row', header, cells: line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()), text: line.trim(), above: section() };
        if (header) tableHead = row;
        else row.head = tableHead;
        out.push(row);
      }
      return;
    }
    table = 0;
    const li = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (li) {
      const indent = li[1].replace(/\t/g, '    ').length;
      if (listIndent === null || indent < listIndent) listIndent = indent;
      open = { type: 'item', nested: indent > listIndent, ordered: /\d/.test(li[2]), text: li[3], above: section() };
      out.push(open);
      return;
    }
    // A line straight under a heading continues it as one sentence: the heading names what the line says.
    if (open) { open.text += (open.type === 'heading' && open.text === open.title ? ': ' : ' ') + line.trim(); return; }
    listIndent = null;
    open = { type: 'para', text: line.trim(), above: section() };
    out.push(open);
  });
  return out;
}

// The open questions of a spec, by the registered definition, each with whether it is numbered and whether it
// carries a recommendation. `owner` maps a block that belongs to a question (the text under a heading that is itself a
// question; the options listed under a question written as a paragraph) to that question.
function questions(bs, rules = RULES) {
  // Inside a question section: the nearest heading above that opens one (holds "question") comes before any that
  // closes it (assumptions, decisions, out of scope).
  const inQ = (b) => { for (let i = b.above.length - 1; i >= 0; i--) { if (rx(rules.closingHeading).test(b.above[i])) return false; if (rx(rules.questionHeading).test(b.above[i])) return true; } return false; };
  const answer = (b) => rx(rules.answerMark).test(bare(b.text)) || rx(rules.answerStart).test(lead(b.text));
  const numberedText = (t) => rx(rules.numbered).test(lead(t));
  const rec = (b) => !!b && rx(rules.recommendation).test(b.text);
  const ends = (t) => /\?[\s*_`)"'”]*$/.test(t);
  const out = [];
  const owner = new Map();
  let headQ = null;
  let paraQ = null;
  bs.forEach((b, i) => {
    if (b.type === 'heading') {
      headQ = null; paraQ = null;
      // A heading below a question section's heading that starts with a number or a Q<n> label, or holds a "?".
      if (inQ(b) && !rx(rules.closingHeading).test(b.title) && (numberedText(b.title) || b.title.includes('?'))) {
        let recommended = rec(b);
        for (let j = i + 1; j < bs.length && bs[j].type !== 'heading'; j++) if (rec(bs[j]) || answer(bs[j])) recommended = true;
        headQ = { block: b, i, numbered: numberedText(b.title), recommended };
        out.push(headQ);
        owner.set(b, headQ);
      }
      return;
    }
    if (headQ) { owner.set(b, headQ); return; }
    if (answer(b) || (b.type === 'item' && b.nested)) { if (paraQ) owner.set(b, paraQ); return; }
    if (b.type === 'row' && b.header) return;
    const inside = inQ(b);
    // After a question written as a paragraph, the list under it holds its options, not further questions.
    if (inside && paraQ && b.type === 'item') { owner.set(b, paraQ); return; }
    const asks = b.type === 'row' ? b.cells.some(ends) : ends(b.text);
    const is = inside ? (b.type !== 'para' || b.text.includes('?')) : asks;
    if (!is) { if (b.type === 'para') paraQ = null; return; }
    const numbered = b.type === 'item' ? b.ordered || numberedText(b.text) : b.type === 'row' ? /^(\d+|Q\s?\d+)\b/i.test(lead(b.cells[0] || '')) : numberedText(b.text);
    const q = { block: b, i, numbered, recommended: rec(b) };
    out.push(q);
    owner.set(b, q);
    paraQ = b.type === 'para' ? q : null;
  });
  // The recommendation of a question that is not a heading: in its own text; for a table row, in the column whose
  // header names one, when that cell is not empty; else in the nested items and answer lines that follow it, up to
  // the next block that is neither.
  for (const q of out) {
    if (q.block.type === 'heading' || q.recommended) continue;
    const b = q.block;
    if (b.type === 'row') { const column = b.head ? b.head.cells.findIndex((c) => rx(rules.recommendation).test(c)) : -1; q.recommended = column >= 0 && !!(b.cells[column] || '').trim(); continue; }
    for (let j = q.i + 1; j < bs.length; j++) {
      const n = bs[j];
      const follows = (n.type === 'item' && n.nested) || (n.type !== 'heading' && answer(n)) || owner.get(n) === q;
      if (!follows) break;
      if (rec(n) || answer(n)) { q.recommended = true; break; }
    }
  }
  return { list: out, owner };
}

// One group of a hazard on one block: an expression anywhere in the block, or a sentence matching several at once.
// Returns the sentences that satisfied it (the whole block's text for a plain expression), or null.
function group(b, g) {
  if (typeof g === 'string') return rx(g).test(b.text) ? [b.text] : null;
  const hit = sentences(b.text).filter((s) => g.sentence.every((e) => rx(e).test(s)));
  return hit.length ? hit : null;
}

// The score of a spec's text: hazards, decoys and the form of its questions. Pure; `check` adds what git and the
// suite say.
function score(md, rules = RULES) {
  const out = {};
  const text = String(md || '');
  out.O1 = text.trim().length >= rules.minChars;
  const bs = out.O1 ? blocks(text) : [];
  const { list, owner } = questions(bs, rules);
  for (const [id, h] of Object.entries(rules.hazards)) {
    if (id === 'H7') {
      // A heading naming the exclusions with something under it that is not a placeholder, or a sentence that names
      // one in at least a few words.
      out.H7 = bs.some((b, i) => {
        if (b.type === 'heading') return rx(h.heading).test(b.title) && ((b.text !== b.title && !rx(h.empty).test(b.text.slice(b.title.length))) || (!!bs[i + 1] && bs[i + 1].type !== 'heading' && !rx(h.empty).test(bs[i + 1].text)));
        return sentences(b.text).some((s) => rx(h.inline).test(s) && words(s.replace(rx(h.inline), '')) >= h.minWords && !rx(h.empty).test(s.replace(rx(h.inline), '')));
      });
      continue;
    }
    out[id] = bs.some((b) => {
      const hits = h.groups.map((g) => group(b, g));
      if (hits.some((x) => !x)) return false;
      if (!h.form) return true;
      // Put as a question that carries a recommendation, or recorded as a decision or an assumption: under such a
      // heading, or said so in the sentence itself.
      const q = owner.get(b);
      if (q) return q.recommended;
      if (b.text.includes('?') && rx(rules.recommendation).test(b.text)) return true;
      return b.above.some((t) => rx(rules.recordedHeading).test(t)) || hits.flat().some((s) => rx(rules.recordedSentence).test(s));
    });
  }
  out.H = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'].filter((k) => out[k]).length;
  // A decoy: an open question that asks for a fact the fixture answers. Only the question is read, not the answer
  // recommended after it; a question that puts a decision ("should …") or names a decision's terms is not one.
  const asked = (q) => (q.block.type === 'heading' ? q.block.title : q.block.text.split(rx(`${rules.recommendation}|answer:`))[0]);
  out.decoys = Object.entries(rules.decoys).filter(([, d]) => list.some((q) => { const t = asked(q); return d.groups.every((g) => rx(g).test(t)) && !rx(rules.decisionVerb).test(t) && !rx(rules.decisionTerms).test(t); })).map(([id]) => id);
  out.D = out.decoys.length;
  out.questions = list.length;
  out.G1 = out.O1 && list.length > 0 && list.every((q) => q.numbered && q.recommended);
  out.G2 = out.O1 && list.length <= 4;
  out.C = rx(rules.council).test(text);
  return out;
}

// Which references of bk-spec the session opened, and whether it entered through the skill.
function reach(raw) {
  const out = { skill: false, opened: [] };
  for (const e of events(raw)) for (const c of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
    if (c.type !== 'tool_use') continue;
    const i = c.input || {};
    if (c.name === 'Skill' && /(^|:)bk-spec$/.test(String(i.skill || i.name || i.command || '').trim().replace(/^\//, '').split(/\s/)[0])) out.skill = true;
    if (!['Read', 'Grep', 'Bash', 'PowerShell'].includes(c.name)) continue;
    const input = JSON.stringify(i).replace(/\\\\/g, '/');
    for (const name of REFERENCES) if (new RegExp(`bk-spec/references/${name}\\.md\\b`).test(input) && !out.opened.includes(name)) out.opened.push(name);
  }
  return out;
}

// What the session left, and, with its stream, how it got there. Ids follow the registration's table.
function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const file = path.join(dst, RULES.specPath);
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const out = score(text);
  // The spec itself, kept with the scores: the fixture is reset before the next session, and the readers need it.
  out.spec = text;
  const st = status(dst);
  const outside = st.filter(([, p]) => !/^docs\//.test(p)).map(([, p]) => p);
  // Without the parent's test context: under `node --test` a nested run would otherwise report itself to the parent
  // and exit 0 whatever the fixture's tests do.
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const suite = spawnSync('node', ['--test'], { cwd: dst, encoding: 'utf8', timeout: o.suiteMs, env });
  out.suite = suite.status === 0;
  out.outside = outside.length;
  out.O2 = out.suite && outside.length === 0;
  out.glossaryChanged = st.some(([, p]) => p === 'docs/glossary.md');
  if (raw !== null) {
    const r = reach(raw);
    out.Rskill = r.skill;
    for (const name of REFERENCES) out[`R_${name}`] = r.opened.includes(name);
    out.P5 = commitAttempts(raw);
    out.P5try = out.P5 > 0;
  }
  return out;
}

module.exports = { build, reset, check, score, blocks, questions, reach, DST, TAG, RULES, REFERENCES };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  const sc = args.indexOf('--score');
  if (sc >= 0) console.log(JSON.stringify(score(fs.readFileSync(args[sc + 1], 'utf8'))));
  else if (args.includes('--check')) console.log(JSON.stringify(check(dst)));
  else {
    const r = args.includes('--reset') ? reset({ dst }) : build({ dst });
    console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
  }
}
