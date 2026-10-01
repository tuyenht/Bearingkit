'use strict';
// shell-01 (registered 2026-10-01, docs/specs/2026-10-01-stack-shell-design.md): a commit export in a small repository
// of Windows PowerShell 5.1 release scripts, with no manifest. The stream's reach measure (R) for shell.md, and the
// fixture's promises: untouched it is green and has no export; a naive script (no exit-code check, Out-File, default
// JSON depth, no array wrap, -Path) does the happy path and fails all six hazards; the reference passes all six and
// the control; each variant fails only the hazard it drops. PowerShell runs on a copy of the fixture; with no
// interpreter the test skips and says why.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { reach } = require('../scripts/lib/bench-score.cjs');
const { detect } = require('../scripts/detect-stack.cjs');
const build = require('../evals/bench/shell-01/build.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });

test('reach for shell-01 reads shell.md, not another stack file', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-build\\references\\stacks';
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\shell.md` })]), 'shell').file, true);
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\sql.md` })]), 'shell').file, false);
});

test('readExport reads a file in any encoding, and strictly as the dashboard does', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shell01-read-'));
  try {
    const f = path.join(dir, 'x.json');
    const text = '{"commits":[],"repo":"Hồng"}';
    fs.writeFileSync(f, text);
    assert.deepEqual([build.readExport(f).bom, build.readExport(f).json.repo, build.readExport(f).strict.repo], [null, 'Hồng', 'Hồng']);
    fs.writeFileSync(f, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text)]));
    assert.deepEqual([build.readExport(f).bom, build.readExport(f).json.repo, build.readExport(f).strict], ['utf8', 'Hồng', null]);
    fs.writeFileSync(f, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]));
    assert.deepEqual([build.readExport(f).bom, build.readExport(f).json.repo, build.readExport(f).strict], ['utf16le', 'Hồng', null]);
    assert.deepEqual(build.readExport(path.join(dir, 'missing.json')), { exists: false, json: null, strict: null, bom: null });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const write = (dst, rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };

// The export, with one care dropped per option. ASCII only, so the script file itself reads the same in 5.1.
const script = (drop = {}) => `param(
    [Parameter(Mandatory = $true)][string]$RepoPath,
    [Parameter(Mandatory = $true)][string]$OutFile
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
${drop.console ? '' : '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n'}${drop.literal ? 'if (-not (Test-Path $RepoPath)) { throw "no such repository: $RepoPath" }\n' : ''}
$lines = @(git -C $RepoPath log "--pretty=format:%H%x1f%an%x1f%ae%x1f%s")
${drop.exit ? '' : 'if ($LASTEXITCODE -ne 0) { throw "git log failed with exit code $LASTEXITCODE" }\n'}
$sep = [string][char]0x1f
$commits = ${drop.array ? '' : '@('}foreach ($line in $lines) {
    $p = $line.Split($sep)
    [ordered]@{ hash = $p[0]; subject = $p[3]; author = [ordered]@{ name = $p[1]; email = $p[2] } }
}${drop.array ? '' : ')'}
$doc = [ordered]@{ repo = [System.IO.Path]::GetFileName($RepoPath.TrimEnd('\\', '/')); commits = $commits }
${drop.escape
    ? '$rows = @($commits | ForEach-Object { \'{"hash":"\' + $_.hash + \'","subject":"\' + $_.subject + \'","author":{"name":"\' + $_.author.name + \'","email":"\' + $_.author.email + \'"}}\' })\n$json = \'{"repo":"\' + $doc.repo + \'","commits":[\' + ($rows -join \',\') + \']}\''
    : `$json = ConvertTo-Json -InputObject $doc${drop.depth ? '' : ' -Depth 5'}`}
${drop.late ? '[System.IO.File]::WriteAllText($OutFile, $json, (New-Object System.Text.UTF8Encoding($false)))\nif ($LASTEXITCODE -ne 0) { throw "git log failed with exit code $LASTEXITCODE" }' : drop.bom ? '$json | Out-File -LiteralPath $OutFile -Encoding UTF8' : '[System.IO.File]::WriteAllText($OutFile, $json, (New-Object System.Text.UTF8Encoding($false)))'}
`;
// What a first draft looks like: no preference, no check of git, the pipeline's default depth and Out-File.
const NAIVE = `param(
    [Parameter(Mandatory = $true)][string]$RepoPath,
    [Parameter(Mandatory = $true)][string]$OutFile
)

$lines = git -C $RepoPath log "--pretty=format:%H|%an|%ae|%s"
$commits = foreach ($line in $lines) {
    $p = $line.Split("|")
    @{ hash = $p[0]; subject = $p[3]; author = @{ name = $p[1]; email = $p[2] } }
}
@{ repo = (Split-Path -Leaf $RepoPath); commits = $commits } | ConvertTo-Json | Out-File $OutFile
`;

const H = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const pick = (o, keys) => keys.map((k) => o[k]);

test('shell-01: the fixture is what the registration says, and the scorer tells the hazards apart', { timeout: 900000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shell01-fx-'));
  const dst = path.join(dir, 'shell-01');
  try {
    build.build({ dst });
    const profile = detect(dst);
    assert.deepEqual([profile.languages, profile.guardrails, profile.stackFiles.map((f) => path.basename(f))], [[], [], ['shell.md']], 'no manifest: the profile names shell.md and nothing else');

    let first;
    try { first = await build.check(dst); } catch (e) {
      if (e.code === 'ENOENT') { t.skip(`no PowerShell to run the fixture: ${e.message}`); return; }
      throw e;
    }
    assert.equal(first.O2, true, 'green untouched');
    assert.deepEqual([first.script, first.O1, first.X, ...pick(first, H), first.H, first.P4], [false, false, false, false, false, false, false, false, false, 0, 0], 'no export yet: nothing passes, H1 and the control included');

    const scored = async (text) => { write(dst, 'scripts/Export-ReleaseNotes.ps1', text); return build.check(dst); };
    const only = (r, failing, what) => assert.deepEqual([r.O1, r.O2, r.X, ...pick(r, H)], [true, true, true, ...H.map((h) => !failing.includes(h))], what);

    const naive = await scored(NAIVE);
    assert.deepEqual([naive.O1, naive.O2, naive.X, ...pick(naive, H), naive.H, naive.bom], [true, true, true, false, false, false, false, false, false, 0, 'utf16le'], 'the naive draft does the happy path and fails every hazard');
    assert.deepEqual([naive.failExit, naive.failWrote], [0, true], 'naive: git failed, the script wrote a file and exited 0');

    const ref = await scored(script());
    only(ref, [], 'the reference passes every hazard and the control');
    assert.deepEqual([ref.H, ref.bom, ref.failWrote, ref.P4], [6, null, false, 0]);
    assert.notEqual(ref.failExit, 0);

    only(await scored(script({ exit: true })), ['H1'], 'no check of $LASTEXITCODE fails H1 only');
    const late = await scored(script({ exit: true, late: true }));
    only(late, ['H1'], 'a check made after the file is written fails H1 only');
    assert.deepEqual([late.failExit !== 0, late.failWrote], [true, true], 'late: a non-zero exit, but the file is there');
    const bom = await scored(script({ bom: true }));
    only(bom, ['H2'], 'a byte-order mark fails H2 only');
    assert.equal(bom.bom, 'utf8');
    only(await scored(script({ console: true })), ['H3'], 'the console code page left as it is fails H3 only');
    only(await scored(script({ depth: true })), ['H4'], 'the default JSON depth fails H4 only');
    only(await scored(script({ array: true })), ['H5'], 'no array wrap fails H5 only');
    only(await scored(script({ literal: true })), ['H6'], 'a wildcard path test fails H6 only');

    const esc = await scored(script({ escape: true }));
    assert.deepEqual([esc.O1, esc.X, ...pick(esc, H)], [true, false, true, true, true, true, true, true], 'JSON built by hand fails the control only');

    // An exit code that is not zero on the happy path is not the happy path, and takes every gated id with it.
    const loud = await scored(`${script()}exit 3\n`);
    assert.deepEqual([loud.O1, loud.X, loud.H], [false, false, 0], 'a non-zero exit on the happy path passes nothing');
    // Oldest first, or the wrong folder name, is not the happy path either, whatever else is right.
    const reversed = await scored(script().replace('git -C $RepoPath log ', 'git -C $RepoPath log --reverse '));
    assert.deepEqual([reversed.O1, reversed.X, reversed.H], [false, false, 0], 'commits oldest first pass nothing');
    const misnamed = await scored(script().replace("[System.IO.Path]::GetFileName($RepoPath.TrimEnd('\\', '/'))", "'release'"));
    assert.deepEqual([misnamed.O1, misnamed.X, misnamed.H], [false, false, 0], 'the wrong repo name passes nothing, the control included');
    // A failure reported by exit code 0 with no file is still a failure of H1.
    const quiet = await scored(script().replace('if ($LASTEXITCODE -ne 0) { throw "git log failed with exit code $LASTEXITCODE" }', 'if ($LASTEXITCODE -ne 0) { exit 0 }'));
    only(quiet, ['H1'], 'exit 0 on a failed git log fails H1, file or no file');
    assert.deepEqual([quiet.failExit, quiet.failWrote], [0, false]);

    // P4 and O2: a file outside scripts/ and tests/, and a red test the session added.
    write(dst, 'scripts/Export-ReleaseNotes.ps1', script());
    write(dst, 'tools/extra.ps1', '# x\n');
    write(dst, 'NOTES.md', 'x\n');
    write(dst, 'tests/Export.Tests.ps1', 'throw "red"\n');
    const red = await build.check(dst);
    assert.deepEqual([red.O2, red.P4, red.P4out, red.O1], [false, 1, true, true], 'a red test fails O2; one path outside counts, a root note does not');

    assert.deepEqual(build.reset({ dst }).head, build.reset({ dst }).head);
    assert.equal(fs.existsSync(path.join(dst, 'scripts/Export-ReleaseNotes.ps1')), false, 'reset removes what a session added');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
