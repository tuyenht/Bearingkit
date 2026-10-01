# `shell.md`, task `shell-01`, and a profile for a tree with no manifest: design and registered measurement (2026-10-01)

P4b, second half (`docs/plans/2026-09-26-v03-roadmap.md`, row P4; question 38 (b) of `docs/specs/2026-09-12-d5-owner-questions.md`). Branch `p4d-shell`, from `main` at `fb45272`. Proposed to the owner as three decisions (task in Windows PowerShell 5.1 rather than Bash; `detect-stack` gives a profile to a tree with no manifest; sentences the sources lack or get wrong are written by the kit and labelled) and accepted, verbatim: "Cho tôi khuyến nghị tốt nhất phù hợp nhé. Đồng ý cả ba, tiếp tục theo khuyến nghị." (2026-10-01). **Nothing here is measured until "Results" exists.**

## What was found before designing

1. **The two sources are thin and partly wrong.** tuyenht/Antigravity-Core at `1774280` (`upstream/sources.json`: mode "adapt (owner's own text only)"), rows 1487 `bash-linux` and 1520 `powershell-windows` of `docs/specs/2026-09-26-bk-build-idea-classification.md`; each skill is one `SKILL.md` (199 and 167 lines). Read in full by a Sonnet agent and then by the main session. Several PowerShell statements do not hold on Windows PowerShell 5.1 when run (table below), and the hazards that most often break a script are absent: `mktemp`, `$LASTEXITCODE`, `-LiteralPath`, the encoding of a written file, the console code page, a glob that matches nothing.
2. **A tree with no manifest got no profile.** `detect-stack` threw `no-manifest` before it looked for scripts (`scripts/detect-stack.cjs`, `detect`), so a repository of scripts, the commonest home of shell code, was never given `shell.md`. No text under `skills/`, `hooks/` or `agents/` depends on that error (`grep` on 2026-10-01: only the script and its test name it).
3. **The owner's machine measures Windows PowerShell 5.1 and Bash 5.3, not PowerShell 7 or `shellcheck`** (neither is installed). The scorer can start `powershell -File` under `node --test` (checked before the design).

## Design

**`skills/bk-build/references/stacks/shell.md`** (4.8 KB): a version card (Bash 5, Windows PowerShell 5.1, PowerShell 7 marked where it differs), a "Both" section (exit codes, stop on failure, stderr, paths taken as given), "Bash" (six sentences), "PowerShell" (twelve), "Evidence". The text is the kit's own.

**Where each sentence comes from.** B = `.agent/skills/bash-linux/SKILL.md`, P = `.agent/skills/powershell-windows/SKILL.md`, both under `_build/upstream/tuyenht_Antigravity-Core`. "Run" = checked on Windows PowerShell 5.1, Windows 11, 2026-10-01, by a probe script in the session's scratch directory (output quoted in the right column); the fixture test below runs the measured ones again on every suite run.

| Sentence of `shell.md` | Source | Run |
|---|---|---|
| Exit non-zero on failure, 0 on success | P:157, P:161 (`exit 0`, `exit 1` in the template) | a terminating error under `-File` exits 1; `Write-Error` alone exits 0 |
| A failed step stops the script | B:103, B:181-183 | kit-original for PowerShell, see `$LASTEXITCODE` |
| Errors to stderr | B:115 (`>&2`) | not run |
| A path is taken as given | kit-original | see `-LiteralPath` |
| `set -euo pipefail`, and what `-e` does not catch | B:103, B:181-183; the limit is kit-original (B:199 says "`set -e` for safety" with no limit) | not run |
| Quote every expansion | B:199 | not run |
| `mktemp` and `trap … EXIT` | B:187-195 for the trap (its example removes a fixed `/tmp/tempfile`); `mktemp` kit-original | not run |
| `while IFS= read -r` | B:148 | not run |
| Guard a glob that may match nothing | kit-original (B:156 loops over `*.js` with no guard) | not run |
| `command -v` | B:134 | not run |
| `$ErrorActionPreference = 'Stop'`, `Set-StrictMode` | P:147 for strict mode. **Against P:73-77 and P:148**, which set `Continue` "for production scripts" | under the default, `Write-Error` then a later line: the line runs, exit 0 |
| `$LASTEXITCODE` after a native command | kit-original; absent from P | `cmd /c exit 5` under `Stop`: "still running, LASTEXITCODE=5" |
| UTF-8 without a mark through `WriteAllText` | kit-original. **Against P:128**, which writes `Out-File … -Encoding UTF8` | first bytes: `Out-File` and `>` 255,254; `-Encoding UTF8` 239,187,191; `WriteAllText` with `UTF8Encoding($false)` none |
| `[Console]::OutputEncoding` before capturing | kit-original; absent | `[Console]::OutputEncoding.WebName` = `IBM437` |
| `ConvertTo-Json -Depth` | P:119-121 | default: `{"a":{"b":{"c":"System.Collections.Hashtable"}}}` |
| `@( … )` and `-InputObject` | kit-original (P:107 only shows `@()`) | a one-item pipeline gives `"net.txt"`, `-InputObject` on `@(…)` gives `["net.txt"]` |
| `-LiteralPath` | kit-original; absent | `Test-Path` on `a [1] b`: False; `-LiteralPath`: True; `Out-File` into it fails |
| .NET methods and the process directory | kit-original | after `Set-Location`, `[Environment]::CurrentDirectory` is still the starting directory |
| Parentheses around cmdlets joined by `-and`/`-or` | P:19-22 | run by the reviewer: `Test-Path 'a' -or Test-Path 'b'` gives "A parameter cannot be found that matches parameter name 'or'" |
| A script with non-ASCII text needs a mark, or stays ASCII | P:28-38 gives "ASCII only" with no cause; the cause is kit-original | a script saved without a mark printed `é` as two characters |
| No `&&`/`||` in 5.1 | kit-original; absent | `cmd /c exit 0 && echo yes`: parser error |
| `2>&1` on a native command under `Stop` | kit-original; absent | throws `RemoteException` |

**Not taken from the sources, with the reason:** "`Continue` for production" (P:76: a failed cmdlet is skipped and the template exits 0); "avoid `$($obj.prop.sub)`" (P:59: valid in every version); "don't return inside try" (P:81: not a defect; P:157 itself exits inside `try`); the null checks of P:48-49 (they skip a valid `0` or empty string); `$array += $item` (P:108: quadratic) ; the command tables of B:13-96 (a reference, not rules; `kill -9 $(lsof …)` and `ps aux | grep` are hazards themselves). Row 586 (`cli-developer`: TTY-aware colour, non-interactive path) is classified to `node.md` and is not repeated here.

**`scripts/detect-stack.cjs`.** When no manifest is recognised, the tree is scanned for topic files as before; if a topic file exists for what it holds, `detect` returns a minimal profile (every key of schema 1; `languages`, `frameworks`, `commands`, `guardrails`, `sourceExtensions`, `notes` empty, `packageManager` null, the default hot paths, `stackFiles`) and the CLI exits 0. With nothing to list it still throws `no-manifest`, exit 2. A tree holding only `.sql` files therefore gets `sql.md` too. Test first: `tests/detect-stack.test.cjs`, "no manifest but a topic file to list", red before the change (`error: 'no-manifest'`), green after.

**Text the model reads, changed on this branch, nothing else under `skills/`:** `shell.md` (new); `skills/bk-build/SKILL.md:12` ("seven of the eight exist", `shell.md` listed "when it holds shell scripts", and a change that writes a script opens it even when not listed); `skills/bk-build/references/stacks/index.md` (the `shell.md` row "written", the section on files reached by what the tree holds, "seven exist today", the version-card list).

**Rejected.** A Bash task: its scorer would also run on Linux, but `set -euo pipefail` and quoting are what a model writes unprompted, and every earlier task that measured such reflexes failed calibration; the Bash section is therefore stated as not measured. A `package.json` in the fixture instead of the `detect-stack` change: `node.md` would be listed beside `shell.md`, and real script repositories would still get nothing. Two tasks: twice the sessions before one has shown it separates anything.

## Effect on tasks already registered

No fixture under `evals/bench/` holds a `.sh`, `.bash` or `.ps1` file (`find`, 2026-10-01), so no registered task's `stackFiles` changes, and all have a manifest. `bk-build`'s text changes by one sentence, so `build-01`'s guard runs again before merging. On the owner's machine the kit's own profile now lists `shell.md` beside `node.md`, from scripts under the untracked `_build/`; no benchmark runs from that tree, and no tracked file of the repository is a script outside this fixture (which sits below the scan's depth).

## Measurement, registered before any session

The pattern of `docs/specs/2026-09-26-stack-node-python-design.md` ("Branches, calibration, and the bar") as reused by `docs/specs/2026-09-28-stack-php-laravel-design.md:115-117`, with what differs stated.

**Hazards: chosen after `shell.md` was written, from its PowerShell section only.** A sentence qualifies if running the session's final script decides it, without judging style. Six do; the Bash section, every PowerShell 7 remark, and the sentences on `$ErrorActionPreference` alone, .NET paths, parentheses, script encoding, `&&` and `2>&1` are **not measured**, and the results say so.

### Task `shell-01`

**Fixture** `evals/bench/shell-01/`, built by `build.cjs` at `C:/Projects/.bearingkit-evals/bench/shell-01`: a repository "release-ops" with no manifest — `README.md` (Windows PowerShell 5.1 and git on the build agents; how to run the tests), `scripts/Get-RepoSummary.ps1` (prints branch and commit count; an ordinary older script: no preference set, no exit-code check), `tests/run.ps1` (runs every `tests/*.Tests.ps1`, a test fails by throwing; no Pester), `tests/helpers.ps1`, `tests/Summary.Tests.ps1` (green), `.gitignore`. No file of the fixture uses `$LASTEXITCODE`, `-LiteralPath`, `-Depth`, `WriteAllText` or `[Console]::OutputEncoding`. `detect-stack` must report no language, no guardrail, and `stackFiles` naming `shell.md` only (checked by the fixture test).

**Prompt**, the same for every branch: "Add a release-notes export to our ops scripts: `scripts\Export-ReleaseNotes.ps1 -RepoPath <dir> -OutFile <file>` writes that repository's commits to the file as JSON, newest first, in this shape: `{ "repo": "<folder name>", "commits": [ { "hash": "<full hash>", "subject": "<subject line>", "author": { "name": "...", "email": "..." } } ] }`. The release dashboard, a Node service, reads the file with JSON.parse, and the nightly job runs the script for every repository we ship. You have my go-ahead to make the change without stopping to ask."

**Permissions**, every branch: edits inside the fixture; the PowerShell tool and `powershell` through Bash (the task's language, as `php` for `php-01`; the fixture's tests build throwaway git repositories through it); `node` (for `detect-stack`); read-only `cat`, `ls`, `grep`, `head`, `tail`; `git log`, `git diff`, `git show`, `git status`. The rule `"PowerShell"` (the whole tool) is the form the host documents for a tool name; whether the isolated profile honours it is seen in the calibration sessions' refused commands, read by eye, and a profile that refuses it is reported before any guard runs, not worked around.

**Scored after the session**, by the scorer's own harness: it builds small git repositories in a temporary directory (no repository above it is consulted) and runs `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/Export-ReleaseNotes.ps1 -RepoPath <repo> -OutFile <file>` in the fixture, with absolute paths, six times.

| Id | Kind | What | How |
|---|---|---|---|
| **H** | **primary** | H1 + … + H6, 0 to 6 per session | sum |
| H1 | hazard | A repository whose objects are gone (`git log` fails): the script exits non-zero and writes no file. Counts only where O1 holds | one run |
| H2 | hazard | The happy-path file parses with `JSON.parse` on its bytes read as UTF-8, no mark stripped, and holds the commits | bytes of the O1 run |
| H3 | hazard | Vietnamese subjects come back as written (the file read in whatever encoding it has) | one run |
| H4 | hazard | Each commit's `author` is an object with the `name` and `email` | O1 run |
| H5 | hazard | A repository with one commit gives an array of one | one run |
| H6 | hazard | A repository path `client [beta] app` and an output directory `out [1] dir` (it exists): exit 0 and the commits | one run |
| O1 | outcome | Three commits: exit 0, the three hashes newest first, `repo` the folder name; the file read in whatever encoding it has | one run |
| O2 | outcome | `tests/run.ps1` exits 0 on the session's final tree | run |
| X | control | A subject with a double quote and backslashes comes back as written — not in `shell.md` (`ConvertTo-Json` does it; JSON built by hand does not). Counts only where O1 holds | one run |
| R, P4, P5 | as `php-01` | `stacks/shell.md` opened; P4 counts paths outside `scripts/`, `tests/` and a root notes file; P5 a commit attempted | stream, `git status` |

Every hazard and the control count only where O1 holds, so a script that does nothing passes nothing. P5 over-counts here by construction: a session that builds a scratch repository to try its script runs `git commit` there; it is reported and read by eye, never barred. The sentence each hazard checks: H1 "`$LASTEXITCODE`, straight after the call" and "a step that fails stops the script"; H2 "UTF-8 without a byte-order mark"; H3 "`[Console]::OutputEncoding`"; H4 "`-Depth`"; H5 "`@( … )` … `-InputObject`"; H6 "`-LiteralPath`".

**As built (2026-10-01, owner's machine, no session run).** `tests/bench-shell-01.test.cjs` (about 135 s): untouched, the fixture is green and passes nothing (H1 and X included); a naive draft (no preference, no check, `ConvertTo-Json | Out-File`) passes O1, O2 and X and fails all six hazards, writing a UTF-16 file and exiting 0 when `git log` fails; the reference passes all six and X; seven variants each drop one care and fail only their hazard (no exit-code check; the check made after the file is written; `-Encoding UTF8`; console encoding left alone; default depth; no array wrap; `Test-Path` without `-LiteralPath`); JSON built by hand fails X only; a non-zero exit on the happy path passes nothing, and so do commits listed oldest first and a wrong `repo` name; `exit 0` on a failed `git log` fails H1; a red test fails O2; a path outside counts for P4 and a root note does not. The test and the scorer were written in the same step, so the red-before-green evidence is the mutations: `evals/bench/shell-01/mutants.cjs`, sixteen mutations of the scorer, each dropping one condition — result under "Review of the build".

**Branches, calibration, and the bar.** Sonnet 5, `natural` only; every branch run from the main checkout with that branch checked out, tree clean, `meta.json` checked (`kit.branch`, `kit.dirty: false`); one `bench` call at a time; `get_usage` before each batch.

- **Reach probe**: two K sessions; go on if `shell.md` is opened in at least 1 of the sessions that entered through `bk-build`; if neither entered through `bk-build`, two more, same rule; otherwise stop and report.
- **Calibration**: three F sessions (no plugin). The task is **usable** if H ≤ 4 in at least 2 of 3 and O1 holds in at least 2 of 3. (The pattern's rule was "H ≤ 1 of 3 hazards"; with six hazards, H ≤ 4 leaves the two points of headroom a difference needs. Stated now so it cannot be tuned after the sessions.)
- **If usable**: F (the three plus five), S, K-before and K-after, eight each, interleaved in rounds by a driver modelled on `evals/analysis/reach-run.cjs`, committed and reviewed before the first round. K-before: a local branch equal to this one with `skills/` and `scripts/detect-stack.cjs` as on `main` (no `shell.md`, no profile for the fixture). Primary: H, K-after against K-before, exact two-sided permutation test (`permutationTest`). `shell.md` merges only if K-after is above K-before with p ≤ 0.05, O2 at least 7 of 8, O1 not below K-before, and the file opened in at least 4 of 8. Against the sources: H, K-after against S, same test.
- **If not usable (guard)**: one `bench` call `--branches K,S --runs 8`, interleaved. `shell.md` merges only if, for K, O1 and O2 are each at least 7 of 8, H at its median is not below the floor's calibration median, and the file is opened in at least 4 of 8. Against the sources, same sessions: H, K against S, same test.
- **Against an installed skill set, wording**: S is `fullstack-dev-skills` (jeffallan/claude-skills at `5e8b6b8`) as it ships. It is **not a source of `shell.md`** and carries no Bash or PowerShell skill (`cli-developer` and `devops-engineer` are the nearest); it is the comparison the runner can load, as for `php-01`. So the result may say "better than `fullstack-dev-skills` on `shell-01`, Sonnet" only at p ≤ 0.05 with K above S, otherwise "no clear difference", and in every case **"not compared with its source"**: Antigravity-Core ships its skills for Antigravity (`.agent/skills/`), with no Claude Code plugin manifest, so the runner cannot install it as it ships. Loading its two `SKILL.md` files through a wrapper plugin would be a further branch (eight sessions) and a decision of the owner; it is not registered here.
- **`build-01` again**: eight K sessions, its bar as registered in `docs/specs/2026-09-26-bk-build-design.md` (O1 8 of 8; O2, O3, P3 at least 7 of 8), since `bk-build`'s text changes.
- **Reported with no bar**: each hazard, X, O1, O2 per branch; R per session with the entry skill and whether `detect-stack` ran (`evals/analysis/stack-reach-by-entry.cjs --rows`); the skill each session invoked; P4, P5; cost median and spread; tokens only where tool counts match; refused commands read by eye.
- **Outcomes.** Bars hold: merge into `main` with `--no-ff`, update `docs/status.md`, ask the owner before the daily install and the Antigravity store are updated. A bar fails: nothing merges, the owner decides.
- **Budget, not measured.** Guard path 2 + 3 + 16 + 8 = 29 sessions; usable path 2 + 3 + 5 + 24 + 8 = 42. The runner stops at 90% of the five-hour window or 95% of the week.

**Limits, stated now.** One fixture, one shell, one machine: the task runs only where Windows PowerShell 5.1 and git exist, so a cloud session cannot rerun it. The six hazards are one export script's worth; a pass says nothing about the Bash section. `shell.md` was written by the session that then chose the hazards from it, as for every stack file; the control X and the floor are what keep that honest. H2 to H5 are specific to 5.1: on PowerShell 7 three of them are defaults. H3 fails for either of two causes (the console code page when capturing, or the encoding when writing) and does not say which; H2 passes for a file written in the ANSI code page while its content is ASCII, and only H3 then catches it. The prompt says the dashboard reads the file with `JSON.parse`: without that sentence a byte-order mark would not be a defect, so H2 is hinted by design and the other five are not. The scorer's mutations do not cover the exit-code gate of the H3 and H5 runs. `detect-stack` does not treat `.psm1`, `.psd1` or `.zsh` as scripts; a tree with an unrecognised manifest and one script now gets the minimal profile, where `bk-ship` finds an empty guardrail list.

## Review of the build

**Sixteen mutations of the scorer** (`node evals/bench/shell-01/mutants.cjs <scratch>`, three at a time, an unmutated control green under the same load). The first run left three green: **M11** (X ignoring O1), **M13** (O1 ignoring the hashes) and **M16** (`hashes()` ignoring order and count) — no case had a valid file with exit 0 that was not the happy path. Two cases were added (commits oldest first; a wrong `repo` name), and the three then turned red at those assertions, the control green. The other thirteen were red on the first run.

**Suite** on this branch, owner's machine: 191 tests (`main` 187, plus the `detect-stack` test and the three of `bench-shell-01`). The first whole run was 190 of 191: `bench-node-01` failed once under the load of the parallel suite, passed alone (2 of 2) and in the second whole run (191 of 191); its timing checks are load-sensitive, and the new PowerShell test adds about two minutes of load.

**Independent review (2026-10-01, Sonnet, read only, before the commit).** The reviewer changed no file and ran no test, bench or session. No must-fix. It confirmed the minimal profile's keys, that nothing under `skills/`, `hooks/`, `agents/` or `scripts/` reads `languages[0]`, `packageManager` or `commands.` in a way the empty profile breaks, the cited source lines, the scorer against the table, the sixteen mutation patterns present once each, and that no fixture file hints a hazard.

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| `shell.md` says every PowerShell sentence was run, the table marked the parentheses sentence "not run" | should-fix | Correct; the reviewer ran it | The run is recorded in the table |
| "Better than its sources" could be said against S, which is not a source and has no shell skill | should-fix | Correct | The wording is now "better than `fullstack-dev-skills`" at most, and always "not compared with its source"; a wrapper branch for the two source files is left to the owner |
| A pointer to a suite count that did not exist | should-fix | Correct | The count is written, with the one load failure of `bench-node-01` |
| "`set -euo pipefail`" not said to be Bash only; non-ASCII "lost" rather than garbled | note | Correct | Both sentences reworded |
| Same-second commits could reorder for a script that sorts by date; the user's global git configuration reached the scored runs | note | Correct | Commit dates one minute apart; an empty `GIT_CONFIG_GLOBAL` for the scored runs; the fixture test green after both |
| H2 passes an ANSI writer on ASCII data; H3 has two causes; the prompt hints H2; mutants do not cover two exit-code gates; `.psm1`/`.zsh` not signals; side effects of the minimal profile | note | Correct | Stated under "Limits" |
| `"PowerShell"` plus `Bash(powershell:*)` is unrestricted inside the session | note | Correct, the same class as `Bash(php:*)` and `Bash(node:*)` of earlier tasks; the runner's profile and fixture directory are the boundary | None |

## Results

Every session `claude-sonnet-5`, `natural`, from the main checkout, `dirty: false`.

**Probe** (`evals/results/2026-10-01-bench-shell-01-natural`, `--branches K --runs 2`, `p4d-shell@4e15cbf`): `shell.md` opened in 2 of 2; both entered through `bearingkit:bk-build` (with `args`) and ran `detect-stack`. H = 6 in both, O1, O2, X held. At least 1 of 2: go on. Refused, read by eye: K1 none; K2 three (two compound Bash lines building a scratch repository under `/tmp`, one `rm -rf` of a scratch directory under the user's temporary folder). The PowerShell tool was honoured by the profile.

**Calibration** (`evals/results/2026-10-01-bench-shell-01-natural-2`, `--branches F --runs 3`, same commit): H = 4, 4, 5; O1 3 of 3, O2 3 of 3, X 3 of 3. Per hazard: H1 1 of 3 (two sessions wrote the file and exited 0 when `git log` failed), H2 3, H3 1 (two lost the Vietnamese text), H4 3, H5 3, H6 2. H ≤ 4 in 2 of 3 and O1 in 3 of 3: **the task is usable**, the first of the stack tasks to be. Refused: F1 one, F2 one (compound Bash lines), F3 none; F2's P5 is a `git commit` in a scratch repository, the over-count the registration names.

**So the usable path runs**: F (five more), S, K-before and K-after, eight each. Driver `evals/analysis/shell-run.cjs` and tally `evals/analysis/shell-tally.cjs`, written after the calibration and before any further session, reviewed, and committed with this paragraph; the tally was checked on a synthetic log (a stopped round is excluded, the calibration's F sessions are counted once). What the registration left to the driver, fixed here before the first round: four rounds, each one `bench` call `--branches K --runs 2` on `p4d-shell-before`, then one `--branches K,S --runs 2` on `p4d-shell`, then the floor in a call of its own on `p4d-shell` (`--branches F`, two sessions in rounds 1 and 2, one in round 3); a round counts only whole, and a round the runner stops on quota re-runs from its start. `p4d-shell-before` is created after this commit, from it, with `skills/` and `scripts/detect-stack.cjs` as on `main`; the driver refuses to start unless `git diff main p4d-shell-before -- skills hooks agents scripts/detect-stack.cjs` is empty. There the fixture has no profile (`no-manifest`) and no `shell.md` exists. K-after therefore runs at the driver's commit, not at `4e15cbf` where the probe and the calibration ran; `skills/`, `hooks/`, `agents/` and `scripts/` are identical at those two commits of `p4d-shell`. The tally (the last complete occurrence of each round; for `build-01`, a line followed by its `DONE`) prints the commits and session counts per branch, which are read before any result is stated. **The registered bars are unchanged**: this paragraph fixes only the order of the calls. The probe's two K sessions count toward no bar.

### Main run (2026-10-01, owner's machine)

Four whole rounds, none stopped; log `evals/results/shell-log.txt`, tally `node evals/analysis/shell-tally.cjs 2026-10-01-bench-shell-01-natural-2`. Directories `evals/results/2026-10-01-bench-shell-01-natural-3` to `-13`. Every `meta.json` `dirty: false`; K-before `p4d-shell-before@13d2937`, K-after and S `p4d-shell@162d4c1`, F at `4e15cbf` (the three of the calibration) and `162d4c1` (five). Thirty-two sessions counted, eight per branch.

| | K-before | K-after | S | F |
|---|---|---|---|---|
| H per session | 5 5 4 4 4 5 4 4 | **6 5 6 5 6 6 6 6** | 4 4 3 4 2 4 5 4 | 4 4 5 4 4 4 4 4 |
| H mean (median) | 4.375 (4) | **5.750 (6)** | 3.750 (4) | 4.125 (4) |
| H1 native command fails | 1 | 8 | 0 | 1 |
| H2 no byte-order mark | 8 | 8 | 7 | 8 |
| H3 Vietnamese subjects | 2 | 6 | 1 | 1 |
| H4 nested JSON | 8 | 8 | 8 | 8 |
| H5 a list of one | 8 | 8 | 8 | 8 |
| H6 brackets in paths | 8 | 8 | 6 | 7 |
| O1 / O2 / X | 8 / 8 / 8 | 8 / 8 / 8 | 8 / 8 / 8 | 8 / 8 / 8 |
| `shell.md` opened | 0 (three looked for it, one `Read` and two `Glob`; the file does not exist there) | 8 | 0 | 0 |
| `detect-stack` ran | 8 (it answers `no-manifest` there) | 8 | 0 | 0 |
| Skill invoked | `bk-build` 8 of 8 | `bk-build` 8 of 8, one after `bk-spec` | none | none |
| P4 / P5 | 0 / 2 | 1 / 0 | 0 / 0 | 0 / 1 |
| Cost USD, median (range), runner's figure | 0.505 (0.295–0.728) | 0.358 (0.257–0.586) | 0.336 (0.255–1.073) | 0.243 (0.181–0.583) |
| Tool calls (`tool_use` events) | 15–37 | 9–23 | 11–37 | 8–24 |
| Refused commands | 8 | 12 | 9 | 9 |

**The bars, as registered for the usable path.**
- **Primary: H, K-after against K-before, exact two-sided permutation test: p = 0.0016, K-after above.** Holds (p ≤ 0.05).
- O2 for K-after: 8 of 8 (at least 7). Holds.
- O1 for K-after not below K-before: 8 against 8. Holds.
- `shell.md` opened by K-after: 8 of 8 (at least 4). Holds.
- **`build-01`** (`evals/results/2026-10-01-bench-build-01-natural-3`, eight K sessions at `162d4c1`): O1 8 of 8, O2 8 of 8, O3 8 of 8, P3 8 of 8. Holds. P1 8, P2 8, P4 0, P5 0, H 0; `node.md` opened 8 of 8, `shell.md` in none (not listed there); cost median 0.599. P6: the scorer counts 2 of 8 (K1 "temporarily removed … the fix" about a test, K7 "left undone": both over-counts); read by eye, 0 of 8 state a way back for the upgrade itself, and the nearest are K3 ("still on disk"), K8 ("left in place") and K6 ("it's all tracked in git so it's trivially recoverable", about a deletion it did not make). K4 and K6 end on a question about deleting `vendor/datefmt-1`; the barred scores are unaffected.

**Every bar holds: by the registration `p4d-shell` merges into `main`** (the owner is asked before the daily install and the Antigravity store are updated). With `shell.md` listed and read, the kit's sessions passed more of the six hazards than the same kit without it, on this task, with Sonnet 5. It is the first registered K-after against K-before test of a stack file to pass. What it shows is narrow: the hazards were chosen from the file, so it shows the file was followed where the floor fails, not that the scripts are better in general (X, O1 and O2 are 8 of 8 on every branch); K-before differs from K-after by the file, by its listing in the profile and by `detect-stack` answering at all, and nothing here separates those three; and it is one run on one day, **not replicated** (`node-01` once showed an unregistered lead of p = 0.00016 that did not hold when run again, `docs/specs/2026-09-26-stack-node-python-design.md`).

**Against the installed skill set**: H, K-after against S, same test: p = 0.0005, K-after above. By the registered wording: **better than `fullstack-dev-skills` on `shell-01`, Sonnet; not compared with its source** (Antigravity-Core cannot be installed as it ships; `fullstack-dev-skills` is not a source of `shell.md`, carries no shell skill, and no S session invoked a skill).

**Reported with no bar.**
- Where the difference is: H1 (the script exits non-zero and writes nothing when `git log` fails) 8 of 8 for K-after against 1 of 8 for K-before (Fisher, two-sided, p = 0.0014), 0 of 8 for S, 1 of 8 for F; H3 (Vietnamese text) 6 of 8 against 2 of 8 (p = 0.13), 1 for S, 1 for F. H4 and H5 are 8 of 8 on every branch, H2 is 8 except S's 7, H6 is 6 to 8. So the difference in H comes probably from one sentence (`$LASTEXITCODE`) and possibly from a second (`[Console]::OutputEncoding`); these per-hazard figures are post-hoc descriptions of the same sessions, six hazards looked at, not registered tests: a lead, not a result. Two of the eight K-after sessions read `shell.md` and still lost the Vietnamese text.
- The kit without the file is level with the floor and with S: K-before against F p = 0.57, S against F p = 0.51, K-after against F p = 0.0005.
- Cost: no clear difference between the kit's two branches (medians 0.358 for K-after and 0.505 for K-before; the reviewer's permutation test on cost gives p = 0.10) or against S (K-after's median about 7% above S's, its mean below); the floor is cheapest (median 0.243). Tokens are not compared: tool counts differ.
- K-before: three sessions looked for `stacks/shell.md` — one `Read` ("File does not exist"), which the scorer's reach counts as an attempt, and two `Glob` listings, which it does not; it is shown as 0 opened. All eight ran `detect-stack` and got `no-manifest`.
- Refused commands, read by eye, 36 in the eleven directories of the main run (plus 3 in the probe and 2 in the calibration): compound Bash lines that build a scratch git repository under `/tmp` or `mktemp -d`; `rm` of a temporary output file or scratch directory (this left `out-notes.json` in the fixture in one K-after session, its P4); `powershell.exe -Command` and `pwsh` through Bash, most in compound lines (`pwsh` is not installed); a few multi-line PowerShell tool calls building repositories under `$env:TEMP`; `git --version`, `node --version`. No barred score depends on them: O1 and O2 are 8 of 8 on every branch. `build-01`: 49, the kinds of the two earlier runs (tests through the PowerShell tool, `rm -rf` and `git rm` of `vendor/datefmt-1`, compound `cd … &&` lines).
- P5: K-before 2 and F 1, each a `git commit` in a scratch repository (the over-count the registration names), none in the fixture.

**Limits of this result.** One task, one shell, one model, eight sessions a branch, one day, not replicated. The hazards were chosen from the file by its author; what guards against that is the floor (F and K-before fail H1 seven times in eight without being told) and the control X (8 of 8 everywhere, so the branches do not differ in general care). The Bash section, and every PowerShell sentence outside the six, remain unmeasured. The comparison with the source skills themselves does not exist.

## Audit corrections (2026-10-01, after the merge; owner: "Audit kỹ các xử lý cũng như các phản hồi ở trên cho tôi.")

- **The permission sentence overstated its source.** "Permissions" above says the rule `"PowerShell"` "is the form the host documents for a tool name": that was written from memory, no document was read. What the data shows: in the 34 `shell-01` sessions of 2026-10-01 the PowerShell tool was called 191 times and refused 3 times (two S sessions, multi-line commands creating directories under `$env:TEMP`), so the rule was honoured for the tool and something else refused those three. The sentence should read "the rule `"PowerShell"`; whether the profile honours it is seen in the sessions".
- **The PowerShell 7 remarks of `shell.md` were not run** (no PowerShell 7 on the machine) and were stated without a source. Checked now against Microsoft's `about_Character_Encoding` (PowerShell 7.4 page, read 2026-10-01): "PowerShell (v6 and higher) defaults to `utf8NoBOM` for all text output"; in Windows PowerShell, "`Out-File` and the redirection operators `>` and `>>` create UTF-16LE", `Set-Content` uses "`Default` encoding … the active system locale's ANSI legacy code page", `UTF8` is "UTF-8 (with BOM)", and "Without the BOM, Windows PowerShell misinterprets your script as being encoded in the legacy "ANSI" codepage". These agree with `shell.md` and with the runs on this machine. Not checked against a document: the `2>&1` sentence and the `&&` sentence (both run on 5.1), and the claim under "Limits" that three of H2 to H5 are defaults on 7 (only the encoding default is documented above).
- **The replication asked for "another day" is not what follows.** The addendum below runs K again on the same day; it is a second run, described as such. A K-after against K-before run on a later day stays open.

## Addendum: against the source, registered before any session (2026-10-01)

Owner's decision, verbatim, on the four questions closing the previous block (update the install; compare `shell.md` with its own source through a wrapper; replicate; the C++ toolchain): "Đồng ý cả bốn, tiếp tục theo khuyến nghị." Branch `p4e-shell-source`, from `main` at `d355cd8`.

**Why.** The owner's rule (`AGENTS.md`, "Conventions") compares a kit skill with the skills it was distilled from. `shell.md` was distilled from Antigravity-Core's `bash-linux` and `powershell-windows`; the S branch of the main run was `fullstack-dev-skills`, which is not a source. Until this runs, `shell.md` is "not compared with its source".

**The wrapper.** Antigravity-Core ships those skills under `.agent/skills/` for Antigravity, with no Claude Code plugin manifest, so the runner cannot load it as it ships. `evals/bench/shell-01-src/wrap.cjs` builds `_build/wrappers/antigravity-core-shell/` (untracked; the source's licence forbids publishing its text, so the copies are not committed): a `plugin.json` written by the kit, and `skills/bash-linux/SKILL.md` and `skills/powershell-windows/SKILL.md` copied byte for byte from the clone pinned at `1774280`. **This is the source as wrapped, not as released**, and every statement of the result says "as wrapped". The two files keep their own front matter, including `allowed-tools: Read, Write, Edit, Glob, Grep, Bash`; if that widens what a session may run while the skill is active, it shows in the refused commands, which are reported per branch.

**The runner** (`scripts/bench.cjs`, `checkSources`): a source entry may carry `wraps: { clone, files }`; the pin of `upstream/sources.json` is then checked on the clone, and every wrapped file must equal its original byte for byte, or the run stops with "sources not as released". Test `tests/bench.test.cjs`, "checkSources: a wrapper is as released only while …": the same case against the runner of `main` answers `["wrap: at ?, pinned …"]` (an exact wrapper refused), against this branch `[]`; the test was written after the change, and that comparison is its red.

**Task `shell-01-src`** (`evals/bench/shell-01-src/`): `shell-01`'s prompt, permissions, limits and rules unchanged (`task.json` differs in `id` and `sources` only, checked by script), its `build.cjs` re-exporting `shell-01`'s fixture and scorer. A second task id is used because the runner has one S branch per task.

**Sessions.** One `bench` call `--task shell-01-src --branches K,S --runs 8`: eight K (this branch's kit, where `skills/`, `hooks/`, `agents/` and `scripts/detect-stack.cjs` equal `main`) and eight S2 (the wrapper), interleaved, Sonnet 5, `natural`, from the main checkout, tree clean, `meta.json` checked. Sixteen sessions. No K-before and no F: those are the main run's.

**Registered.**
- **Primary: H, K against S2, exact two-sided permutation test.** "Better than its source as wrapped on `shell-01`, Sonnet" only at p ≤ 0.05 with K above S2; "worse than its source as wrapped" at p ≤ 0.05 with S2 above; otherwise "no clear difference from its source as wrapped".
- **Whether the source was read**: the sessions of S2 that invoked `antigravity-core-shell:powershell-windows` or `:bash-linux` through the Skill tool, or read either file. If fewer than 4 of 8 did, the result says the source was installed but not read, and is not evidence about its text.
- **Second run of K, described, no bar**: this call's eight K sessions beside the main run's eight K-after (H per session, H1 and H3 counts). They run on the same day at another commit of the runner and task id, so they are a second run, not the replication on another day; no test is registered between them.
- Reported with no bar: each hazard, O1, O2, X per branch; `shell.md` opened; skills invoked; cost; refused commands read by eye.
- **No merge depends on the outcome.** `shell.md` is on `main` by the main run's bars. The branch (runner change, task, this addendum, the result) merges after its review whatever the result says; a result of "worse than its source" is reported to the owner as a finding about `shell.md`, with the hazards where the source did better.
- **Instruments, written and reviewed before the session**: `evals/analysis/shell-src-tally.cjs <result dir>` computes the primary test and the "source was read" count (an S session counts if a Skill call names the wrapper or one of its two skills, or a `Read`, `Grep` or shell call names a path of the wrapper); it was tried on a directory of the main run before any session of this one (there S is another plugin, so it reads "0 of 2"). The wrapper is built from the files committed at the pin (`git cat-file blob`), and `checkSources` compares with those blobs, not with the clone's working tree, and refuses a wrapper holding any other file or a manifest key beyond `name`, `version`, `description`.
- **Abnormal sessions**: a session the runner cut at its limits, or that ended in an error, is counted with what it left (the scorer scores the tree as it is) and is named in the result; if the runner stops the call on quota, the whole call re-runs after the reset and the partial directory is reported and not counted.

### Result of the addendum (2026-10-01, owner's machine)

One call, `evals/results/2026-10-01-bench-shell-01-src-natural`, `p4e-shell-source@9bd195b`, `dirty: false`, sixteen sessions, all `claude-sonnet-5`, all ended `success`, none cut. Tally: `node evals/analysis/shell-src-tally.cjs 2026-10-01-bench-shell-01-src-natural`.

| | K (second run) | S2 (the source, as wrapped) |
|---|---|---|
| H per session | 5 6 6 5 6 6 6 5 | 6 6 4 4 4 4 4 4 |
| H mean (median) | 5.625 (6) | 4.500 (4) |
| H1 / H2 / H3 / H4 / H5 / H6 | 8 / 8 / 5 / 8 / 8 / 8 | 4 / 8 / 2 / 8 / 8 / 6 |
| O1 / O2 / X | 8 / 8 / 8 | 8 / 8 / 8 |
| Skill invoked | `bearingkit:bk-build` 8 of 8 | none, 8 of 8 |
| `shell.md` opened | 8 of 8 | — |
| Source read (Skill call or a file of the wrapper named) | — | **0 of 8** |
| Cost USD, median (range) | 0.393 (0.264–0.496) | 0.245 (0.183–0.441) |
| Refused commands | 9 | 4 |

- **Primary: H, K against S2, exact two-sided permutation test: p = 0.028, K above.**
- **Whether the source was read: 0 of 8, below the registered 4.** The wrapper was loaded in every S2 session (each session's `init` event lists the plugin `antigravity-core-shell` and its two skills, `antigravity-core-shell:bash-linux` and `:powershell-windows`), and no session invoked either or opened either file.
- **So, by the registration: the source was installed but not read, and this is not evidence about its text.** What the run does show: a session with the source's two skills installed, as wrapped, and left to itself did not open them on this task, and scored H 4.5 against the kit's 5.6 (p = 0.028, on H alone). This is an install-against-install comparison, not the comparison with the source that the owner's rule asks for: **`shell.md` stays "not compared with its source"**, and no text may say it is better than its source. In effect S2 was an unassisted session: K ran the kit's whole protocol (`bk-build` 8 of 8, `shell.md` opened 8 of 8) and S2 ran no skill, and S2 cannot be told from the floor of the main run (S2 against F, H: permutation p = 0.47; H1 4 of 8 against 1 of 8, Fisher p = 0.28; a comparison across calls, described only). The kit's sessions also cost more: median 0.393 against 0.245 USD, about 1.6 times; tokens were not compared. Why no session opened the source is not known; its two skill descriptions are written in Vietnamese and the prompt in English, which may have played a part, and the stream cannot show it.
- **Second run of K, described**: H 5 6 6 5 6 6 6 5 (mean 5.625) beside the main run's K-after 6 5 6 5 6 6 6 6 (5.750); H1 8 of 8 both times; H3 5 of 8 and 6 of 8. Same day, a few hours later, another commit of the runner and another task id; consistent with the main run, and not the replication on another day.
- Reported with no bar: S2 passed H1 in 4 of 8 (the floor 1 of 8 and the other installed set 0 of 8 in the main run: different calls, and against the floor not a clear difference, as above); per hazard against K, post hoc, H1 8 against 4 (Fisher p = 0.08) and H3 5 against 2 (p = 0.31). Refused, read by eye: K 9 (compound Bash lines building a scratch repository under `/tmp`, `rm` of scratch files, `node --version; git --version`, a compound `file …; xxd …` look at the written file, one `powershell -Command` through a compound line), S2 4 (`rm` of temporary files, one compound `cd … && ls … | xargs`); the wrapper's `allowed-tools` front matter never came into play, since neither skill was invoked. Every branch of every run also loads the host's own `agents-md` and `telemetry` plugins (seen in the `init` events of K, S, S2 and F alike).
- **What stays open**: a comparison of the two texts needs the source to be read — for instance the same task with the source skill invoked by command (the runner's `command` variant) against `/bearingkit:bk-build`; and the K-after against K-before run on another day.

## Addendum 2: the replication and the source read by both sides, registered before any session (2026-10-01, to run on a later day)

Owner, on the two open items after the first addendum (replicate on another day; compare the texts by invoking the skills on both sides): "Xem còn phải giải quyết vấn đề gì thì tiếp tục xử lý cho tôi." (2026-10-01), after "Đồng ý cả bốn, tiếp tục theo khuyến nghị." Branch `p4f-shell-replicate`, from `main` at `9923ea4`. **Nothing here has run.** The branch merges into `main` after its review (it holds no session's result), because the driver runs K-after and the command variant from `main`, where the task file must carry the new command; the driver refuses a branch whose task has no command for a branch it is asked to run, and checks after each call that every session asked for was scored.

**Why two things in one run.** The main run is one day's result (its limits say so), and the first addendum could not compare the texts because no session opened the source. Both need K sessions on `shell-01`; running them in the same rounds keeps every branch under the same host conditions.

**The replication.** Natural variant, task `shell-01`, K only: K-before on `p4d-shell-before` (`13d2937`, the kit as at `fb45272`) and K-after on `main`, whose `skills/`, `hooks/`, `agents/` and `scripts/detect-stack.cjs` must still equal `ffa9b91` (the driver refuses otherwise). Eight sessions each.
- **Test: H, K-after against K-before, exact two-sided permutation.** "Replicated" at p ≤ 0.05 with K-after above. Anything else is "did not replicate", and then `docs/status.md` and the handoff say so in the same sentence as the first result. No pooling of the two days is registered; both are reported side by side.
- The day must differ from 2026-10-01, by the local date and by the UTC date (the driver stops otherwise). K-before and K-after swap order every round, so neither always runs first.

**The source read by both sides.** Task `shell-01-src`, **`command` variant**: the runner puts each branch's command before the same prompt (`promptFor`, `scripts/bench.cjs`): K `/bearingkit:bk-build`, S2 `/antigravity-core-shell:powershell-windows` (the new `S` key of `commands` in `evals/bench/shell-01-src/task.json`; that file now differs from `shell-01`'s in `id`, `sources` and `commands`, which supersedes the first addendum's "`id` and `sources` only"). Eight sessions each, interleaved in the same calls.
- **Test: H, K against S2, exact two-sided permutation.** "Better than its source as wrapped, both invoked by command, on `shell-01`, Sonnet" only at p ≤ 0.05 with K above; "worse than its source …" at p ≤ 0.05 with S2 above; otherwise "no clear difference from its source …". Every statement keeps "as wrapped" and "invoked by command": this is not what a user gets by installing the source and asking in plain words (that was the first addendum: not opened).
- **Whether the source was loaded.** A slash command leaves no `Skill` call in the stream (checked on `evals/results/2026-09-24-bench-review-01-command`: no session of either branch has one), so the first addendum's count does not apply. Registered instead: (a) the command is listed in the session's `init` event (`slash_commands`); it is, in all eight natural S2 sessions of 2026-10-01; (b) **one trial session before the run**, on `main`, `--task shell-01-src --variants command --branches S --runs 1`: the comparison runs only if that session shows one of three signs, each checkable in its files — what it ever wrote toward the script contains `$ErrorActionPreference = "Continue"`, or an `[OK]` marker, or its answer names the skill (`powershell-windows`). (`-Depth 10` is not a sign: `shell.md` asks for `-Depth` too.) If the trial shows none, the comparison does not run and the owner is told the command gives no visible sign of loading the source in headless mode. The trial counts toward no test, and one trial does not prove the source reached all eight sessions: (c) the same three signs are therefore counted **per S2 session** in the run, and if fewer than 4 of 8 show one, the result says the source's reach is not established and the test is reported as a description, not as a comparison of the texts.
- Reported with no bar: per S2 session, which signs appeared in what it ever wrote toward the script — a `Write` or `Edit` of the file, or a shell command naming it (`shell-rep-tally.cjs`); each hazard; O1, O2, X; cost; refused commands by eye (the source's `allowed-tools` front matter is now in play); and K by command beside K natural of the same rounds (the kit entered by command instead of through the router).
- One prediction, written before the run so it cannot be fitted afterwards: the source's own text says `Out-File … -Encoding UTF8` and `$ErrorActionPreference = "Continue"`; if S2 sessions follow it, **at least 1 of 8 fails H2** (a byte-order mark; no S2 session failed it when the source was unread, and the floor failed it 0 of 8), and H1 for S2 is not above the 4 of 8 it had unread. If S2 passes H2 8 of 8, the sessions did not follow that part of the source, whatever was loaded; the prompt's mention of `JSON.parse` pulls the other way and may win.

**Driver and tally**, written and reviewed before any session: `evals/analysis/shell-rep-run.cjs` (four rounds; per round K-before ×2, K-after ×2, then `shell-01-src` by command K,S ×2; the checks of `shell-run.cjs`, plus the two kit checks and the date check above; log `evals/results/shell-rep-log.txt`) and `evals/analysis/shell-rep-tally.cjs` (tried on a synthetic log built from existing directories: a stopped round is excluded, the four groups are told apart, both tests print). `shell-run.cjs` and `shell-tally.cjs` stay as the record of the first run. Thirty-two sessions and the trial. A round counts only whole; a round the runner stops on quota re-runs from its start.

**No merge depends on either outcome.** `shell.md` stays on `main`; a "did not replicate" or a "worse than its source" is reported to the owner with the hazards concerned, and what to do with `shell.md` is then the owner's decision.
