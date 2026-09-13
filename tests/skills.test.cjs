'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'skills');
const ALLOWED_KEYS = new Set(['name', 'description', 'context', 'background', 'user-invocable', 'disable-model-invocation', 'allowed-tools']);

function frontmatter(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  assert.equal(lines[0], '---', file + ': frontmatter must open on line 1');
  const end = lines.indexOf('---', 1);
  assert.ok(end > 1, file + ': frontmatter must close');
  const entries = [];
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue;
    const m = line.match(/^([A-Za-z-]+):\s?(.*)$/);
    assert.ok(m, file + ': every frontmatter line is key: value, got ' + JSON.stringify(line));
    entries.push([m[1], m[2]]);
  }
  return { entries, body: lines.slice(end + 1).join('\n') };
}

// Antigravity's YAML parser is strict: a bare value with ": " inside is a parse error and the skill is dropped
// (ten of eleven skills vanished on 2026-09-10). Claude Code tolerated it, which is why it went unnoticed.
test('every skill frontmatter is strict-YAML safe: values with ": " are quoted, keys are known', () => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const { entries } = frontmatter(file);
    for (const [key, value] of entries) {
      assert.ok(ALLOWED_KEYS.has(key), name + ': unknown frontmatter key ' + key);
      const quoted = /^"(?:[^"\\]|\\.)*"$/.test(value) || /^'[^']*'$/.test(value);
      if (/:\s/.test(value)) assert.ok(quoted, name + ': ' + key + ' contains ": " and must be quoted');
      if (quoted && value.startsWith('"')) assert.doesNotMatch(value.slice(1, -1), /(^|[^\\])"/, name + ': unescaped quote inside ' + key);
    }
  }
});

test('every skill has a name matching its folder and a description within the budget', () => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const { entries } = frontmatter(file);
    const get = (k) => { const e = entries.find(([key]) => key === k); return e ? e[1].replace(/^"(.*)"$/, '$1') : null; };
    assert.equal(get('name'), name, name + ': name must equal the folder');
    const d = get('description');
    assert.ok(d && d.length > 0, name + ': description required');
    assert.ok(d.length <= 300, name + ': description ' + d.length + ' chars, budget 300');
    if (name !== 'bk-protocol') assert.match(d, /Use when/, name + ': description carries cues ("Use when")');
  }
});

// Spec section 7: bodies stay at or under 100 lines, heavy material lives in references/ and is cited by relative path.
// A cited file that does not exist, or a references file nothing cites, is the dead-reference case doctor will check later.
test('every skill body is within 100 lines, cites only reference files that exist, and every references file is cited', () => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    assert.ok(!fs.readFileSync(file, 'utf8').startsWith('﻿'), name + ': SKILL.md starts with a BOM');
    const { body } = frontmatter(file);
    const lines = body.replace(/\n+$/, '').split('\n').length;
    assert.ok(lines <= 100, name + ': body is ' + lines + ' lines, budget 100');
    for (const m of body.matchAll(/`(?:(bk-[a-z]+)\/)?references\/([a-z0-9-]+\.md)`/g)) {
      const owner = m[1] || name;
      assert.ok(fs.existsSync(path.join(dir, owner, 'references', m[2])), name + ': cites missing ' + owner + '/references/' + m[2]);
    }
    const refDir = path.join(dir, name, 'references');
    if (!fs.existsSync(refDir)) continue;
    for (const ref of fs.readdirSync(refDir)) {
      assert.ok(body.includes('references/' + ref), name + ': references/' + ref + ' is never cited by its SKILL.md');
      assert.ok(!fs.readFileSync(path.join(refDir, ref), 'utf8').startsWith('﻿'), name + '/references/' + ref + ': starts with a BOM');
    }
  }
});

// Spec §5.3 #3: a skill is not finished until skills/<name>/tests/ holds at least three prompts with the expected
// outcome. The list is the eight lifecycle skills because they are v0.2's scope (spec §13); the rest arrive at v0.3,
// and "every skill" here would fail for work that is not due yet. The four sections are what makes a case readable by
// a harness and comparable between skills: the prompt, the state it assumes, what must be observable, and the one
// wrong behaviour the case exists to catch. Written clean-room — Skillmark, whose format §11 calls compatible, ships
// no license file, so nothing is copied from it.
const V02_SKILLS = ['bk-spec', 'bk-plan', 'bk-build', 'bk-test', 'bk-debug', 'bk-review', 'bk-ship', 'bk-close'];
test('the eight lifecycle skills carry at least three test cases each, in a shape a harness can read', () => {
  for (const name of V02_SKILLS) {
    const testDir = path.join(dir, name, 'tests');
    assert.ok(fs.existsSync(testDir), `${name}: no tests/ directory`);
    const cases = fs.readdirSync(testDir).filter((f) => f.endsWith('.md'));
    assert.ok(cases.length >= 3, `${name}: ${cases.length} test cases, spec 5.3 asks for at least three`);
    for (const c of cases) {
      const text = fs.readFileSync(path.join(testDir, c), 'utf8');
      for (const section of ['**Prompt**', '**Setup**', '**Expected**', '**Fails if**']) {
        assert.ok(text.includes(section), `${name}/tests/${c}: no ${section} section`);
      }
      assert.match(text, /^> \S.*/m, `${name}/tests/${c}: the quoted prompt line is empty`);
    }
  }
});

// Spec section 12: anything adapted from an upstream source is recorded in upstream/sources.json (derived map) and points at NOTICE.
test('every references file adapted from upstream has a derived entry in upstream/sources.json and names NOTICE', () => {
  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'upstream', 'sources.json'), 'utf8')).sources;
  const derived = new Set(sources.flatMap((s) => Object.keys(s.derived || {})));
  for (const name of fs.readdirSync(dir)) {
    const refDir = path.join(dir, name, 'references');
    if (!fs.existsSync(refDir)) continue;
    for (const ref of fs.readdirSync(refDir)) {
      const text = fs.readFileSync(path.join(refDir, ref), 'utf8');
      if (!/^Adapted from /m.test(text)) continue;
      const key = 'skills/' + name + '/references/' + ref;
      assert.ok(derived.has(key), key + ': adapted from upstream but absent from every derived map');
      assert.match(text, /`NOTICE`/, key + ': must point at NOTICE');
    }
  }
  for (const key of derived) assert.ok(fs.existsSync(path.join(__dirname, '..', key)), key + ': in a derived map but the file does not exist');
});

// v1 section 17 asks that every skill carry provenance and a license mode, not only that NOTICE be complete;
// on 2026-09-13 no SKILL.md named a source, so the body of that criterion was unmet while NOTICE looked fine.
// The line must not claim less than the skill's own references/ files already vendor.
test('every skill body carries one provenance line, and it names what its references actually vendor', () => {
  const sources = require('../upstream/sources.json').sources.map((s) => s.name);
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const { body } = frontmatter(file);
    const found = body.split('\n').filter((l) => l.startsWith('Sources:'));
    assert.equal(found.length, 1, name + ': body needs exactly one line starting "Sources:"');
    const line = found[0];
    const refDir = path.join(dir, name, 'references');
    const vendored = new Set();
    if (fs.existsSync(refDir)) {
      for (const f of fs.readdirSync(refDir)) {
        const m = fs.readFileSync(path.join(refDir, f), 'utf8').match(/^Adapted from ([^:(]+)/m);
        if (m) vendored.add(m[1].trim());
      }
    }
    if (vendored.size === 0) {
      assert.match(line, /no upstream text/i, name + ': nothing is vendored, so the line must say so');
    } else {
      for (const v of vendored) {
        assert.ok(line.includes(v), name + ': the line must name ' + v + ', which its references vendor');
        assert.ok(sources.some((s) => v === s || v.startsWith(s)), name + ': ' + v + ' is not a source in upstream/sources.json');
      }
      assert.match(line, /NOTICE/, name + ': a line naming a vendored source must point at NOTICE');
    }
    assert.match(line, /\((MIT|Apache-2\.0|CC0-1\.0|no license)/, name + ': the line must carry a license mode');
  }
});
