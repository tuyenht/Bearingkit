#!/usr/bin/env node
'use strict';
// Stack profile from manifests and lockfiles. Reads files only; never runs a package manager.
// Output: one JSON object on stdout (schema 1), exit 0. Exit 2 with {"error":"no-manifest"} when nothing is recognised.
//
// Manifest → fields (priority order when several manifests share a root):
//   composer.json            → php      laravel, livewire, inertia, pest, phpunit, symfony    vendor/bin/pest|phpunit, pint --test, phpstan analyse
//   build.gradle(.kts)       → kotlin/java  android, compose, spring                         ./gradlew test | gradlew.bat test | gradle test
//   *.sln / *.csproj         → csharp   dotnet                                               dotnet test
//   go.mod                   → go                                                            go test ./...
//   Cargo.toml               → rust                                                          cargo test
//   CMakeLists.txt/Presets   → c-cpp                                                         cmake --build build, ctest --test-dir build
//   pyproject/requirements   → python   django, fastapi, flask, sqlalchemy, pytest, ruff     pytest, ruff check .
//   package.json             → typescript/javascript  next, react, vue, nuxt, electron, express, nest, prisma, vitest, jest, playwright
//                              <pm> test, <pm> exec tsc --noEmit, <pm> lint, <pm> build

const fs = require('node:fs');
const path = require('node:path');

const HOT_DEFAULT = [
  '**/auth/**', '**/session*/**', '**/middleware/**', '**/migrations/**', '**/payments/**', '**/billing/**',
  '**/upload*/**', '**/tenant*/**', '**/roles/**', '**/permissions/**',
];

const exists = (dir, f) => fs.existsSync(path.join(dir, f));
const readText = (dir, f) => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch { return null; } };
const readJson = (dir, f) => { try { return JSON.parse(readText(dir, f)); } catch { return null; } };
const major = (v) => { const m = String(v || '').match(/(\d+)/); return m ? Number(m[1]) : null; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const card = (items) => items.filter((f) => f.major !== null && f.major !== undefined && f.major > 0).map((f) => `${f.label || cap(f.name)} ${f.major}`).join(', ');
const uniq = (a) => [...new Set(a)];

// ---------- node ----------
function lockMajorNode(dir, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const pnpm = readText(dir, 'pnpm-lock.yaml');
  if (pnpm) { const m = pnpm.match(new RegExp(`['"]?${esc}@(\\d+)`)); if (m) return Number(m[1]); }
  const npm = readText(dir, 'package-lock.json');
  if (npm) { const m = npm.match(new RegExp(`"node_modules/${esc}":\\s*{[^}]*"version":\\s*"(\\d+)`)); if (m) return Number(m[1]); }
  const yarn = readText(dir, 'yarn.lock');
  if (yarn) { const m = yarn.match(new RegExp(`^"?${esc}@[^\\n]*:\\n\\s+version:? "?(\\d+)`, 'm')); if (m) return Number(m[1]); }
  return null;
}

const NODE_KNOWN = [
  ['next', 'next', 'Next'], ['react', 'react', 'React'], ['vue', 'vue', 'Vue'], ['nuxt', 'nuxt', 'Nuxt'], ['electron', 'electron', 'Electron'],
  ['express', 'express', 'Express'], ['@nestjs/core', 'nest', 'NestJS'], ['prisma', 'prisma', 'Prisma'], ['@prisma/client', 'prisma', 'Prisma'],
  ['vitest', 'vitest', 'Vitest'], ['jest', 'jest', 'Jest'], ['@playwright/test', 'playwright', 'Playwright'], ['typescript', 'typescript', 'TypeScript'],
];
const NODE_CARD = new Set(['next', 'react', 'vue', 'nuxt', 'electron', 'express', 'nest', 'prisma', 'typescript']);

function node(dir) {
  const pkg = readJson(dir, 'package.json');
  if (!pkg) return null;
  const pmField = String(pkg.packageManager || '').split('@')[0];
  const pm = exists(dir, 'pnpm-lock.yaml') ? 'pnpm' : exists(dir, 'yarn.lock') ? 'yarn' : (exists(dir, 'bun.lockb') || exists(dir, 'bun.lock')) ? 'bun' : (['pnpm', 'yarn', 'bun', 'npm'].includes(pmField) ? pmField : 'npm');
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const frameworks = [];
  for (const [dep, name, label] of NODE_KNOWN) {
    if (!deps[dep] || frameworks.some((f) => f.name === name)) continue;
    frameworks.push({ name, label, major: lockMajorNode(dir, dep) ?? major(deps[dep]) });
  }
  const run = (s) => (pm === 'npm' ? (s === 'test' ? 'npm test' : `npm run ${s}`) : pm === 'bun' ? `bun run ${s}` : `${pm} ${s}`);
  const scripts = pkg.scripts || {};
  const commands = {};
  if (scripts.test) commands.test = run('test');
  if (exists(dir, 'tsconfig.json')) commands.typecheck = pm === 'npm' ? 'npx tsc --noEmit' : pm === 'yarn' ? 'yarn tsc --noEmit' : pm === 'bun' ? 'bunx tsc --noEmit' : 'pnpm exec tsc --noEmit';
  if (scripts.lint) commands.lint = run('lint');
  // Biome replaces the ESLint-and-Prettier pair and runs in milliseconds, so when a project has it the direct call is
  // the guardrail, ahead of a `lint` script that usually just wraps it (owner's decision on question 9, 2026-09-12:
  // guardrail command now, a real hook at v0.4). `--error-on-warnings` makes a warning fail the gate, which is what a
  // guardrail is for; without it biome exits 0 on warnings and the ship step would read that as green.
  if (deps['@biomejs/biome'] || exists(dir, 'biome.json') || exists(dir, 'biome.jsonc')) {
    commands.lint = pm === 'npm' ? 'npx biome check --error-on-warnings .' : pm === 'yarn' ? 'yarn biome check --error-on-warnings .' : pm === 'bun' ? 'bunx biome check --error-on-warnings .' : 'pnpm exec biome check --error-on-warnings .';
  }
  if (scripts.build) commands.build = run('build');
  const hot = [...HOT_DEFAULT];
  if (deps.prisma || deps['@prisma/client']) hot.push('**/prisma/schema.prisma');
  const ext = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
  if (deps.vue || deps.nuxt) ext.push('.vue');
  return {
    languages: [exists(dir, 'tsconfig.json') || deps.typescript ? 'typescript' : 'javascript'],
    frameworks: frameworks.filter((f) => f.name !== 'typescript'),
    packageManager: pm,
    commands,
    guardrails: [commands.test, commands.typecheck, commands.lint].filter(Boolean),
    sourceExtensions: ext,
    hotPathGlobs: hot,
    versionCard: card(frameworks.filter((f) => NODE_CARD.has(f.name))),
  };
}

// ---------- php ----------
function php(dir) {
  const composer = readJson(dir, 'composer.json');
  if (!composer) return null;
  const lock = readJson(dir, 'composer.lock');
  const lockVersions = {};
  for (const p of [...((lock && lock.packages) || []), ...((lock && lock['packages-dev']) || [])]) lockVersions[p.name] = p.version;
  const req = { ...(composer.require || {}), ...(composer['require-dev'] || {}) };
  const known = [['laravel/framework', 'laravel', 'Laravel'], ['livewire/livewire', 'livewire', 'Livewire'], ['inertiajs/inertia-laravel', 'inertia', 'Inertia'],
    ['symfony/symfony', 'symfony', 'Symfony'], ['pestphp/pest', 'pest', 'Pest'], ['phpunit/phpunit', 'phpunit', 'PHPUnit']];
  const frameworks = known.filter(([k]) => req[k]).map(([k, name, label]) => ({ name, label, major: major(lockVersions[k]) ?? major(req[k]) }));
  const commands = {};
  if (req['pestphp/pest']) commands.test = 'vendor/bin/pest';
  else if (req['phpunit/phpunit']) commands.test = 'vendor/bin/phpunit';
  if (req['laravel/pint']) commands.lint = 'vendor/bin/pint --test';
  if (req['phpstan/phpstan'] || req['larastan/larastan'] || req['nunomaduro/larastan']) commands.static = 'vendor/bin/phpstan analyse';
  const phpMajor = major(req.php);
  return {
    languages: ['php'],
    frameworks,
    packageManager: 'composer',
    commands,
    guardrails: [commands.test, commands.lint, commands.static].filter(Boolean),
    sourceExtensions: ['.php', '.blade.php'],
    hotPathGlobs: [...HOT_DEFAULT, 'routes/**', 'app/Http/Middleware/**', 'database/migrations/**', 'config/auth.php'],
    versionCard: card([...frameworks.filter((f) => ['laravel', 'livewire', 'inertia', 'symfony'].includes(f.name)), { name: 'php', label: 'PHP', major: phpMajor }]),
  };
}

// ---------- python ----------
function python(dir) {
  const py = readText(dir, 'pyproject.toml');
  const reqs = readText(dir, 'requirements.txt');
  if (!py && !reqs && !exists(dir, 'setup.py')) return null;
  const text = `${py || ''}\n${reqs || ''}`;
  const has = (name) => new RegExp(`(^|["'\\s\\[,])${name}([\\s\\[<>=!~;"',]|$)`, 'im').test(text);
  const majorOf = (name) => { const m = text.match(new RegExp(`${name}\\s*[><=~!]=?\\s*v?(\\d+)`, 'i')); return m ? Number(m[1]) : null; };
  const known = [['django', 'Django'], ['fastapi', 'FastAPI'], ['flask', 'Flask'], ['sqlalchemy', 'SQLAlchemy'], ['pytest', 'pytest'], ['ruff', 'ruff']];
  const frameworks = known.filter(([n]) => has(n)).map(([name, label]) => ({ name, label, major: majorOf(name) }));
  const pm = exists(dir, 'uv.lock') ? 'uv' : exists(dir, 'poetry.lock') ? 'poetry' : exists(dir, 'Pipfile') ? 'pipenv' : 'pip';
  const commands = {};
  if (has('pytest') || /\[tool\.pytest/.test(text) || exists(dir, 'tests')) commands.test = 'pytest';
  if (has('ruff') || /\[tool\.ruff/.test(text)) commands.lint = 'ruff check .';
  return {
    languages: ['python'],
    frameworks,
    packageManager: pm,
    commands,
    guardrails: [commands.test, commands.lint].filter(Boolean),
    sourceExtensions: ['.py'],
    hotPathGlobs: [...HOT_DEFAULT, 'alembic/**'],
    versionCard: card(frameworks.filter((f) => ['django', 'fastapi', 'flask', 'sqlalchemy'].includes(f.name))),
  };
}

// ---------- gradle (kotlin / java) ----------
function gradle(dir) {
  const files = ['build.gradle.kts', 'build.gradle', 'settings.gradle.kts', 'settings.gradle'].filter((f) => exists(dir, f));
  if (!files.length) return null;
  const text = files.map((f) => readText(dir, f)).join('\n');
  const kotlin = files.some((f) => f.endsWith('.kts')) || /kotlin\(|org\.jetbrains\.kotlin/.test(text);
  const frameworks = [];
  if (/com\.android/.test(text)) frameworks.push({ name: 'android', label: 'Android', major: null });
  if (/compose/.test(text)) frameworks.push({ name: 'compose', label: 'Compose', major: null });
  if (/springframework/.test(text)) frameworks.push({ name: 'spring', label: 'Spring', major: null });
  const kv = text.match(/kotlin\([^)]*\)\s*version\s*"(\d+)/) || text.match(/org\.jetbrains\.kotlin[^"']*["'](\d+)/);
  if (kotlin) frameworks.push({ name: 'kotlin', label: 'Kotlin', major: kv ? Number(kv[1]) : null });
  const wrapper = exists(dir, 'gradlew');
  const test = wrapper ? (process.platform === 'win32' ? 'gradlew.bat test' : './gradlew test') : 'gradle test';
  return {
    languages: [kotlin ? 'kotlin' : 'java'],
    frameworks,
    packageManager: 'gradle',
    commands: { test, build: test.replace(/ test$/, ' build') },
    guardrails: [test],
    sourceExtensions: kotlin ? ['.kt', '.kts', '.java'] : ['.java'],
    hotPathGlobs: [...HOT_DEFAULT],
    versionCard: [card(frameworks.filter((f) => f.name === 'kotlin')), ...frameworks.filter((f) => f.name !== 'kotlin').map((f) => f.label)].filter(Boolean).join(', '),
  };
}

// ---------- cmake ----------
function cmake(dir) {
  if (!exists(dir, 'CMakeLists.txt') && !exists(dir, 'CMakePresets.json')) return null;
  const text = readText(dir, 'CMakeLists.txt') || '';
  const min = text.match(/cmake_minimum_required\s*\(\s*VERSION\s*([\d.]+)/i);
  return {
    languages: ['c-cpp'],
    frameworks: [],
    packageManager: 'cmake',
    commands: { build: 'cmake --build build', test: 'ctest --test-dir build' },
    guardrails: ['cmake --build build', 'ctest --test-dir build'],
    sourceExtensions: ['.c', '.cc', '.cpp', '.cxx', '.h', '.hpp'],
    hotPathGlobs: [...HOT_DEFAULT],
    versionCard: min ? `CMake ${min[1]}+` : 'CMake',
  };
}

// ---------- dotnet ----------
function dotnet(dir) {
  const entries = (() => { try { return fs.readdirSync(dir); } catch { return []; } })();
  if (!entries.some((f) => f.endsWith('.sln') || f.endsWith('.csproj'))) return null;
  return { languages: ['csharp'], frameworks: [{ name: 'dotnet', label: '.NET', major: null }], packageManager: 'dotnet', commands: { test: 'dotnet test', build: 'dotnet build' },
    guardrails: ['dotnet test'], sourceExtensions: ['.cs'], hotPathGlobs: [...HOT_DEFAULT], versionCard: '.NET' };
}

// ---------- go ----------
function go(dir) {
  const mod = readText(dir, 'go.mod');
  if (!mod) return null;
  const v = mod.match(/^go\s+(\d+\.\d+)/m);
  return { languages: ['go'], frameworks: [], packageManager: 'go', commands: { test: 'go test ./...', build: 'go build ./...' },
    guardrails: ['go test ./...'], sourceExtensions: ['.go'], hotPathGlobs: [...HOT_DEFAULT], versionCard: v ? `Go ${v[1]}` : 'Go' };
}

// ---------- rust ----------
function rust(dir) {
  if (!exists(dir, 'Cargo.toml')) return null;
  return { languages: ['rust'], frameworks: [], packageManager: 'cargo', commands: { test: 'cargo test', build: 'cargo build' },
    guardrails: ['cargo test'], sourceExtensions: ['.rs'], hotPathGlobs: [...HOT_DEFAULT], versionCard: 'Rust' };
}

// ---------- parity ----------
function missingBinaries(commands, dir, envPath) {
  const dirs = (envPath ?? process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
  const exts = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').concat(['']) : [''];
  const onPath = (bin) => dirs.some((d) => exts.some((e) => fs.existsSync(path.join(d, bin + e))));
  const local = (bin) => fs.existsSync(path.join(dir, bin));
  const bins = uniq(Object.values(commands).map((c) => c.split(' ')[0]).filter((b) => !b.includes('/') && !b.includes('\\')));
  return bins.filter((b) => !local(b) && !onPath(b));
}

// ---------- merge ----------
const DETECTORS = [php, gradle, dotnet, go, rust, cmake, python, node];

function detect(dir = process.cwd(), opts = {}) {
  const parts = DETECTORS.map((f) => f(dir)).filter(Boolean);
  if (!parts.length) throw new Error('no-manifest');
  const primary = parts[0];
  const commands = Object.assign({}, ...parts.slice(1).reverse().map((p) => p.commands), primary.commands);
  const profile = {
    schema: 1,
    root: path.resolve(dir).replace(/\\/g, '/'),
    vcs: exists(dir, '.git') ? 'git' : 'none',
    languages: uniq(parts.flatMap((p) => p.languages)),
    frameworks: parts.flatMap((p) => p.frameworks),
    packageManager: primary.packageManager,
    commands,
    guardrails: uniq(parts.flatMap((p) => p.guardrails)),
    sourceExtensions: uniq(parts.flatMap((p) => p.sourceExtensions)),
    hotPathGlobs: uniq(parts.flatMap((p) => p.hotPathGlobs)),
    versionCard: parts.map((p) => p.versionCard).filter(Boolean).join(' · '),
  };
  profile.parity = { missingBinaries: missingBinaries(commands, dir, opts.path) };
  return profile;
}

if (require.main === module) {
  try {
    process.stdout.write(JSON.stringify(detect(process.argv[2] || process.cwd()), null, 2) + '\n');
  } catch (e) {
    process.stdout.write(JSON.stringify({ error: e.message }) + '\n');
    process.exit(2);
  }
}

module.exports = { detect, HOT_DEFAULT };
