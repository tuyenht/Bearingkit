#!/usr/bin/env node
'use strict';
// The state of one review loop, for reviewers that start fresh each round and so cannot count rounds or remember
// what they posted. It lives in .review-loop.md at the repository root, the file the owner's Claude Code Stop hook and
// the global rules of the other hosts use: kept out of commits by the line "/.review-loop.md" in .git/info/exclude
// (the hook's own line), and reset by the next commit.
//   node scripts/review-loop.cjs start [--beyond-cap]
// Prints the round, its scope (round 1: the whole change; later: the diff since the previous round's snapshot,
// untracked files included) and the findings already posted. A fourth round on the same commit is refused (exit 3)
// unless --beyond-cap, which the owner's word on a hot path allows. Exit 2 outside a git repository.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const FILE = '.review-loop.md';
const CAP = 3;
const INTRO = 'Findings posted in this loop, one line each: `file:line` · bug class · what. A finding here is never posted again; one still unfixed is listed as open with its round. Written by bk-review (`scripts/review-loop.cjs start`); git-ignored, and a new commit starts a fresh loop.';

function git(cwd, args, env) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  return r.status === 0 ? r.stdout.trim() : null;
}

// The tree as it stands, untracked files included and the loop file left out, written through a temporary index so
// neither the index nor the working tree changes.
function snapshot(top, head) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-review-loop-'));
  const env = { GIT_INDEX_FILE: path.join(dir, 'index') };
  try {
    if (git(top, head === 'none' ? ['read-tree', '--empty'] : ['read-tree', head], env) === null) return null;
    // No pathspec for the loop file: once it is ignored, naming it makes `git add` fail. It is dropped afterwards
    // instead, for a host where the exclude line could not be written.
    if (git(top, ['add', '-A'], env) === null) return null;
    if (git(top, ['rm', '--cached', '-q', '--ignore-unmatch', '--', FILE], env) === null) return null;
    return git(top, ['write-tree'], env);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function keepOutOfCommits(gitdir) {
  const exclude = path.join(gitdir, 'info', 'exclude');
  try {
    const text = fs.existsSync(exclude) ? fs.readFileSync(exclude, 'utf8') : '';
    if (text.split(/\s+/).includes(`/${FILE}`)) return null;
    fs.mkdirSync(path.dirname(exclude), { recursive: true });
    fs.appendFileSync(exclude, `\n/${FILE}\n`);
    return null;
  } catch (e) {
    return `could not add /${FILE} to ${exclude} (${e.code || e.message}): never stage ${FILE}`;
  }
}

const SHA = /^[0-9a-f]{40}$/;

function parse(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  const field = (name) => { const m = text.match(new RegExp(`^${name}:\\s*(\\S+)\\s*$`, 'm')); return m ? m[1] : null; };
  const headings = [...text.matchAll(/^## Round (\d+)\s*$/gm)].map((m) => Number(m[1]));
  const findings = text.split('\n').filter((l) => /^\s*[-*] /.test(l));
  const round = Math.max(Number(field('Round')) || 0, ...headings, findings.length ? 1 : 0);
  return { head: field('Head'), round, snapshot: field('Snapshot'), base: field('Base'), findings };
}

// Another host's agent may have written the file by hand; its own lines are kept, under a header this script owns.
function body(text) {
  return text.replace(/\r\n/g, '\n').split('\n').filter((l) => !/^(Head|Round|Snapshot|Base):/.test(l) && l !== '# Review loop' && !l.startsWith('Findings posted in this loop')).join('\n').trim();
}

function start(cwd, { beyondCap = false } = {}) {
  const top = git(cwd, ['rev-parse', '--show-toplevel']);
  if (!top) return { exit: 2, out: `not a git repository: ${cwd}\n` };
  // The common directory, not the worktree's own: a linked worktree reads info/exclude from there.
  const warning = keepOutOfCommits(path.resolve(top, git(top, ['rev-parse', '--git-common-dir']) || '.git'));
  const head = git(top, ['rev-parse', '--verify', '-q', 'HEAD']) || 'none';
  const file = path.join(top, FILE);
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  const prev = old === null ? null : parse(old);
  // A file with no Head line was written by hand on another host; that host clears it at its own commits.
  const fresh = prev === null || (prev.head !== null && prev.head !== head);
  const snap = snapshot(top, head);
  // An unchanged tree is the same round again: a retry, or a second look at a change already committed, never spends
  // a round.
  const same = !fresh && snap !== null && snap === prev.snapshot;
  const round = fresh ? 1 : same ? prev.round : prev.round + 1;
  const base = fresh ? null : same ? prev.base : prev.snapshot;
  if (round > CAP && !same && !beyondCap) {
    return { exit: 3, out: `Review loop: the cap of ${CAP} rounds is reached on this change (${FILE}, round ${prev.round}). Do not start round ${round}: report to the owner what is still open and propose rethinking the approach instead of another patch. Only a hot path goes on, and only on the owner's word: start --beyond-cap.\n${warning ? `Warning: ${warning}\n` : ''}` };
  }
  if (!same) {
    const header = ['# Review loop', '', `Head: ${head}`, `Round: ${round}`, `Snapshot: ${snap || 'none'}`, ...(base ? [`Base: ${base}`] : []), '', INTRO, ''].join('\n');
    const kept = fresh ? '' : body(old);
    fs.writeFileSync(file, `${header}\n${kept ? `${kept}\n\n` : ''}## Round ${round}\n`);
  }
  const lines = [`Review loop: round ${round} of ${CAP}${round > CAP ? ' (beyond the cap, on the owner\'s word)' : ''} (${FILE}).`];
  if (same) lines.push(`Nothing changed since round ${round} began: this is round ${round} again, not a new round.`);
  // A snapshot is used only when it is a full object name git still holds; anything else means the whole change again.
  const stat = round > 1 && base && SHA.test(base) && snap ? git(top, ['diff', '--stat', base, snap]) : null;
  if (round === 1) lines.push('Scope: the whole change, at full depth.');
  else if (stat === null) lines.push(`Scope: no usable snapshot from round ${round - 1}, so the whole change again; the findings below still stand.`);
  else {
    lines.push(`Scope: only what changed since round ${round - 1}: git diff ${base} ${snap}`);
    lines.push(stat || '(no change since the previous round)');
  }
  const posted = fresh ? [] : prev.findings;
  lines.push(posted.length ? 'Findings already posted (never post one again; one still unfixed is listed as open, with its round):' : 'Findings already posted: none.');
  lines.push(...posted);
  lines.push(`Record each finding of this round under "## Round ${round}" in ${FILE}: \`file:line\` · bug class · what.`);
  if (warning) lines.push(`Warning: ${warning}`);
  return { exit: 0, out: lines.join('\n') + '\n' };
}

if (require.main === module) {
  const [verb, ...rest] = process.argv.slice(2);
  const unknown = rest.filter((a) => a !== '--beyond-cap');
  if (verb !== 'start' || unknown.length) {
    process.stdout.write('usage: node scripts/review-loop.cjs start [--beyond-cap]\n');
    process.exitCode = 2;
  } else {
    const r = start(process.cwd(), { beyondCap: rest.includes('--beyond-cap') });
    process.stdout.write(r.out);
    process.exitCode = r.exit;
  }
}

module.exports = { start, parse, FILE, CAP };
