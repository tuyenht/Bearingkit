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

// Question 9, decided 2026-09-12: biome is a guardrail command at v0.2 and a real hook at v0.4. The matrix row for
// biome had claimed detect-stack already listed it; it did not, which the audit of 2026-09-13 caught.
test('node with biome: it becomes the lint guardrail, ahead of the script that wraps it', () => {
  const p = detect(fx('node-biome'));
  assert.ok(p.commands.lint.includes('biome check'), 'lint comes from biome, got ' + p.commands.lint);
  assert.ok(p.commands.lint.includes('--error-on-warnings'), 'a guardrail must fail on warnings, got ' + p.commands.lint);
  assert.ok(p.guardrails.some((g) => g.includes('biome')), 'biome is in the guardrail list');
  assert.equal(p.guardrails.filter((g) => g.includes('lint') || g.includes('biome')).length, 1, 'not both the script and biome');
});

// Drift item (o), 2026-09-15: the guardrail list stopped at a project's own scripts, so a project that runs ESLint and
// Prettier directly, as many do, had no lint and no format gate at all. Both are called in their failing form:
// ESLint exits 0 on warnings unless told otherwise, and `prettier --write` (what a `format` script usually is) mutates
// the tree instead of checking it.
test('node without a lint script: eslint and prettier are called directly, in the form that fails', () => {
  const p = detect(fx('node-eslint-prettier'));
  assert.equal(p.packageManager, 'npm');
  assert.equal(p.commands.lint, 'npx eslint --max-warnings 0 .');
  assert.equal(p.commands.format, 'npx prettier --check .');
  assert.ok(p.guardrails.includes('npx eslint --max-warnings 0 .'));
  assert.ok(p.guardrails.includes('npx prettier --check .'));
});

test('node with a lint script keeps the script, and biome displaces prettier', () => {
  const next = detect(fx('node-pnpm'));
  assert.equal(next.commands.lint, 'pnpm lint', 'the project\'s own script wins over a direct eslint call');
  assert.ok(!next.guardrails.some((g) => g.includes('eslint')), 'eslint is not run twice');
  const biome = detect(fx('node-biome'));
  assert.equal(biome.commands.format, undefined, 'biome formats as well, so prettier is not a second gate');
  assert.ok(!biome.guardrails.some((g) => g.includes('prettier')));
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

test('python with black and mypy', () => {
  const p = detect(fx('python-black-mypy'));
  assert.equal(p.commands.format, 'black --check .');
  assert.equal(p.commands.typecheck, 'mypy .');
  assert.ok(p.guardrails.includes('black --check .'));
  assert.ok(p.guardrails.includes('mypy .'));
});

test('python with pyright and nothing else', () => {
  const p = detect(fx('python-pyright'));
  assert.equal(p.commands.typecheck, 'pyright');
  assert.deepEqual(p.guardrails, ['pyright']);
  const plain = detect(fx('python'));
  assert.equal(plain.commands.typecheck, undefined, 'no type checker is invented for a project that has none');
  assert.equal(plain.commands.format, undefined);
});

// gofmt is absent on purpose: `gofmt -l` prints the files it would change and still exits 0, so as a gate it passes
// on exactly the tree it should stop. `go vet` exits non-zero when it reports something.
test('go: vet joins test, golangci-lint when configured, and gofmt is deliberately not a gate', () => {
  const p = detect(fx('go'));
  assert.deepEqual(p.languages, ['go']);
  assert.ok(p.guardrails.includes('go test ./...'));
  assert.ok(p.guardrails.includes('go vet ./...'));
  assert.ok(p.guardrails.includes('golangci-lint run'));
  assert.ok(!p.guardrails.some((g) => g.startsWith('gofmt')));
  assert.match(p.versionCard, /Go 1\.23/);
});

test('rust: cargo fmt --check joins cargo test', () => {
  const p = detect(fx('rust'));
  assert.deepEqual(p.languages, ['rust']);
  assert.ok(p.guardrails.includes('cargo test'));
  assert.ok(p.guardrails.includes('cargo fmt --check'));
});

test('kotlin with the ktlint and detekt gradle plugins', () => {
  const p = detect(fx('kotlin-server'));
  assert.deepEqual(p.languages, ['kotlin']);
  assert.match(p.commands.lint, /gradle(w|w\.bat)? ktlintCheck$/);
  assert.match(p.commands.static, /gradle(w|w\.bat)? detekt$/);
  assert.equal(p.guardrails.length, 3, 'test, ktlint, detekt: ' + p.guardrails.join(' | '));
  const android = detect(fx('kotlin'));
  assert.equal(android.commands.lint, undefined, 'no ktlint task is invented for a build that does not apply the plugin');
});

// Drift item (h), 2026-09-13: a repository holding only Terraform threw no-manifest, so in the owner's daily
// infrastructure work no skill had a profile to read. `plan` and `apply` read remote state and credentials, so they
// are never a guardrail; `validate` needs an initialised directory, which the kit never creates itself.
test('terraform: fmt, validate and tflint are the gates; plan and apply never are', () => {
  const p = detect(fx('terraform'));
  assert.deepEqual(p.languages, ['terraform']);
  assert.equal(p.packageManager, 'terraform');
  assert.ok(p.guardrails.includes('terraform fmt -check -recursive'));
  assert.ok(p.guardrails.includes('terraform validate'));
  assert.ok(p.guardrails.includes('tflint'));
  assert.ok(!Object.values(p.commands).some((c) => /\b(plan|apply|init)\b/.test(c)), 'no command that touches state or the network');
  assert.ok(p.frameworks.some((f) => f.name === 'aws' && f.major === 5), 'the provider major comes from the lock file, not the constraint');
  assert.match(p.versionCard, /Terraform 1/);
  assert.match(p.versionCard, /AWS provider 5/);
  assert.ok(p.sourceExtensions.includes('.tf'));
  assert.ok(p.hotPathGlobs.some((g) => g.includes('iam')));
  assert.ok(p.hotPathGlobs.includes('**/*.tfvars'));
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
