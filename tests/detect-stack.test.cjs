'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { detect } = require('../scripts/detect-stack.cjs');

const fx = (n) => path.join(__dirname, 'fixtures', 'stacks', n);

test('node + pnpm + next + prisma', () => {
  const p = detect(fx('node-pnpm'));
  assert.equal(p.schema, 1);
  assert.equal(p.packageManager, 'pnpm');
  assert.deepEqual(p.languages, ['typescript']);
  assert.ok(p.frameworks.some((f) => f.name === 'next' && f.major === 15));
  assert.ok(p.frameworks.some((f) => f.name === 'prisma' && f.major === 7));
  assert.ok(p.guardrails.includes('pnpm test'));
  assert.ok(p.guardrails.includes('pnpm exec tsc --noEmit'));
  assert.ok(p.hotPathGlobs.includes('**/prisma/schema.prisma'));
  assert.ok(p.sourceExtensions.includes('.tsx'));
  assert.match(p.versionCard, /Next 15/);
});

test('laravel with pest and pint', () => {
  const p = detect(fx('laravel'));
  assert.deepEqual(p.languages, ['php']);
  assert.ok(p.frameworks.some((f) => f.name === 'laravel' && f.major === 12));
  assert.ok(p.frameworks.some((f) => f.name === 'livewire' && f.major === 4));
  assert.ok(p.guardrails.includes('vendor/bin/pest'));
  assert.ok(p.guardrails.includes('vendor/bin/pint --test'));
  assert.ok(p.hotPathGlobs.includes('routes/**'));
});

test('python with pytest and ruff', () => {
  const p = detect(fx('python'));
  assert.deepEqual(p.languages, ['python']);
  assert.ok(p.frameworks.some((f) => f.name === 'fastapi'));
  assert.ok(p.guardrails.includes('pytest'));
  assert.ok(p.guardrails.includes('ruff check .'));
});

test('kotlin gradle android', () => {
  const p = detect(fx('kotlin'));
  assert.deepEqual(p.languages, ['kotlin']);
  assert.ok(p.frameworks.some((f) => f.name === 'android'));
  assert.match(p.guardrails[0], /gradle(w|w\.bat)? test$/);
});

test('cmake', () => {
  const p = detect(fx('cmake'));
  assert.deepEqual(p.languages, ['c-cpp']);
  assert.ok(p.guardrails.includes('ctest --test-dir build'));
});

test('empty directory throws no-manifest', () => {
  assert.throws(() => detect(fx('empty')), /no-manifest/);
});

test('parity lists binaries missing from PATH', () => {
  const p = detect(fx('node-pnpm'), { path: '' });
  assert.ok(p.parity.missingBinaries.includes('pnpm'));
});

test('cli prints JSON and exits 2 without a manifest', () => {
  const { spawnSync } = require('node:child_process');
  const ok = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'detect-stack.cjs'), fx('python')], { encoding: 'utf8' });
  assert.equal(ok.status, 0);
  assert.equal(JSON.parse(ok.stdout).languages[0], 'python');
  const bad = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'detect-stack.cjs'), fx('empty')], { encoding: 'utf8' });
  assert.equal(bad.status, 2);
  assert.equal(JSON.parse(bad.stdout).error, 'no-manifest');
});
