#!/usr/bin/env node
'use strict';
// Stack profile from manifests and lockfiles. Reads files only; never runs a package manager.
// Output: one JSON object on stdout (schema 1), exit 0. Exit 2 with {"error":"no-manifest"} when nothing is recognised.
//
// Manifest → fields (priority order when several manifests share a root):
//   composer.json            → php      laravel, livewire, inertia, pest, phpunit, symfony    vendor/bin/pest|phpunit, pint --test, phpstan analyse
//   build.gradle(.kts)       → kotlin/java  android, compose, spring                         ./gradlew test | gradlew.bat test | gradle test, ktlintCheck, detekt
//   *.sln / *.csproj         → csharp   dotnet                                               dotnet test
//   go.mod                   → go                                                            go test ./..., go vet ./..., golangci-lint run
//   Cargo.toml               → rust                                                          cargo test, cargo fmt --check
//   CMakeLists.txt/Presets   → c-cpp                                                         cmake --build build, ctest --test-dir build
//   pyproject/requirements   → python   django, fastapi, flask, sqlalchemy, pytest, ruff     pytest, mypy . | pyright, ruff check ., black --check .
//   package.json             → typescript/javascript  next, react, vue, nuxt, electron, express, nest, prisma, vitest, jest, playwright
//                              <pm> test, <pm> exec tsc --noEmit, <pm> lint | biome check | eslint, prettier --check, <pm> build
//   *.tf / .terraform.lock.hcl → terraform  aws, google, azurerm, kubernetes, helm providers terraform fmt -check, terraform validate, tflint

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
const ESLINT_CONFIGS = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts', '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml'];
const PRETTIER_CONFIGS = ['.prettierrc', '.prettierrc.json', '.prettierrc.yml', '.prettierrc.yaml', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.mjs', 'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs'];
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
  const exec = (cmd) => (pm === 'npm' ? 'npx ' : pm === 'yarn' ? 'yarn ' : pm === 'bun' ? 'bunx ' : 'pnpm exec ') + cmd;
  if (exists(dir, 'tsconfig.json')) commands.typecheck = exec('tsc --noEmit');
  const biome = deps['@biomejs/biome'] || exists(dir, 'biome.json') || exists(dir, 'biome.jsonc');
  // A project's own lint script is its decision and wins. Without one, ESLint is called directly, with
  // `--max-warnings 0` because it exits 0 on warnings otherwise and the gate would read them as green.
  if (scripts.lint) commands.lint = run('lint');
  else if (!biome && (deps.eslint || pkg.eslintConfig || ESLINT_CONFIGS.some((f) => exists(dir, f)))) commands.lint = exec('eslint --max-warnings 0 .');
  // Biome replaces the ESLint-and-Prettier pair and runs in milliseconds, so when a project has it the direct call is
  // the guardrail, ahead of a `lint` script that usually just wraps it (owner's decision on question 9, 2026-09-12:
  // guardrail command now, a real hook at v0.4). `--error-on-warnings` makes a warning fail the gate, which is what a
  // guardrail is for; without it biome exits 0 on warnings and the ship step would read that as green.
  if (biome) commands.lint = exec('biome check --error-on-warnings .');
  // Prettier is checked, never run: a `format` script is usually `prettier --write`, which changes the tree instead of
  // judging it. Biome formats as well, so a project that has it does not get Prettier as a second gate.
  else if (deps.prettier || pkg.prettier || PRETTIER_CONFIGS.some((f) => exists(dir, f))) commands.format = exec('prettier --check .');
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
    guardrails: [commands.test, commands.typecheck, commands.lint, commands.format].filter(Boolean),
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
  if (has('black') || /\[tool\.black\]/.test(text)) commands.format = 'black --check .';
  if (has('mypy') || /\[tool\.mypy\]/.test(text) || exists(dir, 'mypy.ini')) commands.typecheck = 'mypy .';
  else if (has('pyright') || /\[tool\.pyright\]/.test(text) || exists(dir, 'pyrightconfig.json')) commands.typecheck = 'pyright';
  return {
    languages: ['python'],
    frameworks,
    packageManager: pm,
    commands,
    guardrails: [commands.test, commands.typecheck, commands.lint, commands.format].filter(Boolean),
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
  const task = (name) => (wrapper ? (process.platform === 'win32' ? `gradlew.bat ${name}` : `./gradlew ${name}`) : `gradle ${name}`);
  // ktlint and detekt arrive as Gradle plugins in practice, so their tasks are what the gate runs.
  const commands = { test: task('test'), build: task('build') };
  if (/ktlint/.test(text)) commands.lint = task('ktlintCheck');
  if (/detekt/.test(text)) commands.static = task('detekt');
  return {
    languages: [kotlin ? 'kotlin' : 'java'],
    frameworks,
    packageManager: 'gradle',
    commands,
    guardrails: [commands.test, commands.lint, commands.static].filter(Boolean),
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
  // gofmt is not here on purpose: `gofmt -l` prints the files it would change and still exits 0, so as a gate it passes
  // on exactly the tree it should stop. `go vet` exits non-zero when it reports something, and a project that wants
  // formatting enforced configures it in golangci-lint, which fails when its checks do.
  const commands = { test: 'go test ./...', static: 'go vet ./...', build: 'go build ./...' };
  if (['.golangci.yml', '.golangci.yaml', '.golangci.toml', '.golangci.json'].some((f) => exists(dir, f))) commands.lint = 'golangci-lint run';
  return { languages: ['go'], frameworks: [], packageManager: 'go', commands,
    guardrails: [commands.test, commands.static, commands.lint].filter(Boolean), sourceExtensions: ['.go'], hotPathGlobs: [...HOT_DEFAULT], versionCard: v ? `Go ${v[1]}` : 'Go' };
}

// ---------- rust ----------
function rust(dir) {
  if (!exists(dir, 'Cargo.toml')) return null;
  return { languages: ['rust'], frameworks: [], packageManager: 'cargo', commands: { test: 'cargo test', format: 'cargo fmt --check', build: 'cargo build' },
    guardrails: ['cargo test', 'cargo fmt --check'], sourceExtensions: ['.rs'], hotPathGlobs: [...HOT_DEFAULT], versionCard: 'Rust' };
}

// ---------- terraform ----------
// Reads the directory it is given, like every detector here: a multi-root layout (one directory per environment)
// is detected when the session runs inside an environment directory, not from the repository's top level.
const TF_PROVIDERS = [['aws', 'AWS provider'], ['google', 'Google provider'], ['azurerm', 'AzureRM provider'], ['kubernetes', 'Kubernetes provider'], ['helm', 'Helm provider']];

function terraform(dir) {
  const entries = (() => { try { return fs.readdirSync(dir); } catch { return []; } })();
  const tf = entries.filter((f) => f.endsWith('.tf'));
  if (!tf.length && !exists(dir, '.terraform.lock.hcl')) return null;
  const text = tf.map((f) => readText(dir, f) || '').join('\n');
  const lock = readText(dir, '.terraform.lock.hcl') || '';
  const frameworks = [];
  for (const [name, label] of TF_PROVIDERS) {
    // The lock file holds the version actually installed; the constraint in required_providers is only a range.
    const locked = lock.match(new RegExp(`provider\\s+"[^"]*/${name}"\\s*\\{\\s*version\\s*=\\s*"(\\d+)`));
    const declared = new RegExp(`source\\s*=\\s*"[^"]*/${name}"`).test(text);
    if (locked || declared) frameworks.push({ name, label, major: locked ? Number(locked[1]) : null });
  }
  const required = text.match(/required_version\s*=\s*"[^"\d]*(\d+)/);
  // plan and apply read remote state with real credentials, so neither is ever a gate. validate and tflint need a
  // directory prepared by `terraform init` and `tflint --init`, both of which download, so the kit never runs them.
  const commands = { format: 'terraform fmt -check -recursive', validate: 'terraform validate' };
  if (exists(dir, '.tflint.hcl')) commands.lint = 'tflint';
  // A fresh clone fails validate with an error that says to run `terraform init`, and a plain init configures the
  // remote backend. The acting agent reads the profile, not this file, so the safe preparation travels with it.
  const prepare = ['`terraform init -backend=false` (downloads providers and modules, never touches the backend or state)'];
  if (commands.lint) prepare.push('`tflint --init` (downloads the plugins .tflint.hcl declares)');
  const notes = [`terraform validate${commands.lint ? ' and tflint need' : ' needs'} an initialised directory: prepare it with ${prepare.join(' and ')}. A plain \`terraform init\` configures the remote backend, so it is COUNCIL.`];
  return {
    languages: ['terraform'],
    frameworks,
    packageManager: 'terraform',
    commands,
    guardrails: [commands.format, commands.validate, commands.lint].filter(Boolean),
    sourceExtensions: ['.tf', '.tfvars', '.hcl'],
    hotPathGlobs: [...HOT_DEFAULT, '**/*iam*.tf', '**/backend.tf', '**/*security_group*.tf', '**/*kms*.tf', '**/*secret*.tf', '**/*.tfvars', '**/*.tfstate*'],
    notes,
    versionCard: card([{ name: 'terraform', label: 'Terraform', major: required ? Number(required[1]) : null }, ...frameworks]),
  };
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
const DETECTORS = [php, gradle, dotnet, go, rust, cmake, python, node, terraform];

// The bk-build stack files this profile maps to, by the table of skills/bk-build/references/stacks/index.md, as
// absolute paths; a mapped file that does not exist yet is left out. Added 2026-09-27: in node-01's guard the kit's
// sessions ran this script 7 times in 8 and never opened the stack file, so the profile now names it.
const STACKS = path.resolve(__dirname, '..', 'skills', 'bk-build', 'references', 'stacks');
function stackFilesFor(languages, frameworks, dir = STACKS) {
  const names = new Set(frameworks.map((f) => f.name));
  const files = languages.map((l) => {
    if (l === 'typescript' || l === 'javascript') return names.has('react') || names.has('next') ? 'typescript-react.md' : 'node.md';
    if (l === 'kotlin' || l === 'python' || l === 'c-cpp') return `${l}.md`;
    if (l === 'php') return 'php-laravel.md';
    return null;
  });
  return uniq(files.filter(Boolean)).filter((f) => exists(dir, f)).map((f) => path.join(dir, f).split(path.sep).join('/'));
}

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
    // Preconditions a guardrail has that its command line cannot say. Empty for most stacks; the key is always there.
    notes: uniq(parts.flatMap((p) => p.notes || [])),
  };
  profile.stackFiles = stackFilesFor(profile.languages, profile.frameworks, opts.stacksDir);
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
