# `detect-stack` lists stack files by topic (`sql.md`, `shell.md`)

P4b, first half (`docs/plans/2026-09-26-v03-roadmap.md`, row P4; next work item 2 of `docs/handoff/2026-09-28-p4-step0-php-build.md`). Built on the cloud on branch `p4b-topic-stackfiles`, from `main` at `57361bd`; **nothing here was measured**. The owner's decision this implements, question 38 (b) of `docs/specs/2026-09-12-d5-owner-questions.md` (settled 2026-09-27 under the owner's delegation): "trước khi đo, `detect-stack` nêu file theo chủ đề (`shell.md` khi dự án có `*.sh`/`*.ps1`, `sql.md` khi có migration hay `*.sql`), là đổi thiết kế có đo reach như `stackFiles`." The pattern it follows is "Reach fix, registered before any session" in `docs/specs/2026-09-26-stack-node-python-design.md`.

## Why

`sql.md` exists and `shell.md` will, but neither has a way in. No manifest declares SQL or shell, so no language row of `skills/bk-build/references/stacks/index.md` maps them, `stackFiles` never names them, and `bk-build` says `sql.md` is opened "by subject matter … not by the profile". The measurements say that is not enough: in `node-01`'s first guard `detect-stack` ran in 7 of 8 sessions and the stack file was opened in none; once the profile named it, 8 of 8 (the Reach fix, same spec). A file the profile does not list is, on that evidence, a file that is not read.

## Design

**Signals.** Read from the project tree, never from a manifest:

| Topic file | Listed when the tree holds |
|---|---|
| `sql.md` | a file ending `.sql`; or a directory named `migrations` (which covers `migrations/`, `database/migrations/`, `prisma/migrations/`, Django's `<app>/migrations/`, EF Core's `Migrations/`), `migrate` directly under `db` (`db/migrate/`, Rails), or `alembic` |
| `shell.md` | a file ending `.sh`, `.bash` or `.ps1` |

Names and extensions are compared in lower case, so a Windows tree's `Migrations/` or `SETUP.PS1` counts. `alembic` is added to the four examples of the owner's prompt because the profile already treats `alembic/**` as a hot path for Python (`scripts/detect-stack.cjs:155`) and its migrations are `.py`, so no `.sql` would reveal them.

**What the scan skips.** `.git`, `node_modules`, `vendor`, `dist`, `build`, `.venv`, and every directory whose name starts with a dot. `vendor` matters most: a Laravel project's `vendor/` holds its framework's own migrations, which say nothing about the project. Symbolic links are not followed (a `Dirent` for a link is neither a file nor a directory here), so a link cycle cannot hang the scan; the price is that a migrations directory or `.sql` file reached only through a link is not seen (a false negative). Hidden files, unlike hidden directories, are read: a `.x.sql` file counts.

**Bound.** Breadth first from the directory `detect-stack` is given, entries sorted by name so a cut-off lands at the same place every run; it reads the root and directories down to **depth 4** (the root's children are depth 1), and stops after **5,000 directory entries** read, or as soon as both topics are found. Why these numbers:
- Depth 4 reaches every layout named above at the root (`prisma/migrations/` is depth 2, `database/migrations/` depth 2) and one monorepo level deeper (`packages/api/prisma/migrations/` is depth 4). It deliberately stops short of this repository's own benchmark fixtures (`evals/bench/review-03/main/prisma/migrations/` is depth 6), so the kit's profile of itself does not change.
- 5,000 entries: `detect-stack` runs at the start of every skill that reads the profile, so the scan must stay cheap on a large tree. The count bounds the work whatever the tree; on this repository (a few hundred tracked files, several hundred more under `.git` which is skipped) the scan ends well below it. Time on the cloud container: see "Build record" (a cloud reading, not the owner's machine).
- A tree larger than the bound can hide a signal: that is a false negative, and the `bk-build` sentence keeps the subject-matter route for it (below).

**Only files that exist.** As for the language rows, a topic file is listed only if it exists under the stacks directory. `shell.md` is not written (its one source, Antigravity-Core, is pinned only on the owner's machine), so today a project with `*.sh` gets nothing more; the signal is built and tested with a stand-in stacks directory, and starts listing the day `shell.md` is written.

**Order.** Language files first, as today, then `sql.md`, then `shell.md`.

**No new field (chosen), rather than a field saying why each file is listed.** The profile keeps its keys; only `stackFiles` can gain one or two paths. Rejected: a `stackReasons` map (`{"sql.md": "migrations/"}`). It would let a session see why `sql.md` is there, but no skill text reads it, so using it would mean a further line under `skills/` (outside this change's measured scope) and more tokens in every profile; the reason is one rule in `index.md`, and `sql.md` itself says what it governs. Also rejected: reporting a scan cut short by the bound (same cost, and the subject-matter sentence already covers a miss).

**False positives, stated.** A `migrations/` directory that holds something other than database migrations, or a single stray `.sql` file (a dump, a fixture), lists `sql.md` for a project whose change may not touch a database. The cost is one file read of about 4.5 KB; the rules in it apply only to SQL the change writes. A shell script in a project whose change never touches it lists `shell.md` the same way, once that file exists.

**Text the model reads, changed on this branch to match the new behaviour, nothing else under `skills/`:**
- `skills/bk-build/SKILL.md:12`: "`sql.md` is opened by subject matter — a query, a migration, a schema — not by the profile." becomes a sentence saying the profile lists `sql.md` (and `shell.md`, once written) when the tree holds SQL files, a migrations directory or shell scripts, and that the subject-matter route still applies when it does not.
- `skills/bk-build/references/stacks/index.md`: the section "`sql.md` is not reached this way" and the `shell.md` row, which said no profile names it.

## Effect on tasks already registered

- **`node-01`, `py-01`, `build-01`, `debug-01`, `test-01`**: no `.sql`, no migrations directory, no shell script in their fixtures (checked with `git ls-files` and the fixtures' `build.cjs` on 2026-09-28): their `stackFiles` do not change. `build-01` still changes, because `bk-build`'s text does (guard below).
- **`review-03`, `review-04`** (`bk-review`): both fixtures carry `prisma/migrations/<id>/migration.sql` (depth 3), so a profile run there now lists `sql.md`. `bk-review` has no `stackFiles` line, so a session opens it only on its own initiative. Their registered results were taken without it; a later run of either on `main` after this change is a different condition: compare only runs interleaved in one call, and report whether `sql.md` was opened (`reach(raw, 'sql').file`).
- **`php-01`** (branch `p4a-php`, not on `main`): the fixture has `schema.sql` at its root, so its profile lists `sql.md` next to `php-laravel.md`. This is not neutral for that measurement: `sql.md:40` ("Parameterised, always") and `sql.md:42` ("Multi-statement changes run in one transaction") state the same rules as `php-01`'s hazards H2 (bound parameters) and H3 (one transaction). If this change reaches `main` before `php-01` is measured:
  - R of `php-01` stays `php-laravel.md`, and its bar is unchanged; a session opening `sql.md` is reported per session, with no threshold.
  - H2 and H3 of K can no longer be credited to `php-laravel.md` alone: the result says "the kit (`php-laravel.md` with `sql.md` listed)", splits H2 and H3 by whether `sql.md` was opened (description only), and a comparison with S (the sources, where no `stackFiles` exists) is a comparison of the kit, not of the file.
  - `tests/bench-php-01.test.cjs:89` checks `stackFiles.some(… php-laravel.md)`, so the fixture test still passes with `sql.md` listed.
- **Recommended merge order**: `p4-step0-scope` (its measurement is first in the queue), then `p4a-php` measured and decided on that `main`, then this branch rebased onto that `main` and measured as registered below, then merged. All three branches edit `skills/bk-build/SKILL.md:12`, and `p4a-php` and this branch also edit `stacks/index.md` (`p4-step0-scope` does not), so the rebase here resolves those lines by hand (keep the step-0 sentence and the stack count from the others, the `sql.md` sentence from here) and re-runs the suite before any session.

## Measurement, registered before any session

Nothing below has run. It runs on the owner's machine, after the merge order above, from this branch rebased onto the `main` of that day.

**Task: `php-01`, reused.** Why: it is a `bk-build` task (the skill whose text changed), its change is SQL work (two rows written together, a value with a quote in it), `schema.sql` sits at its root, and it already has calibration, permissions and a scorer. A new task would need its own fixture and calibration to answer the same reach question. Rejected: `review-03`/`review-04` (they measure `bk-review`, which has no `stackFiles` line, and ask for no change); a new `sql-01` task (cost, no gain for reach). If `php-01` is not on `main` by then (its own measurement not run, or `php-laravel.md` kept on its branch), stop and ask the owner rather than running it from a mix of branches. The task's files are not changed; reach of `sql.md` is read from each session's stored stream with the existing `reach(raw, 'sql')` of `scripts/lib/bench-score.cjs:256` (a `Read`, `Grep` or shell command naming `stacks/sql.md`).

**Probe.** Two K sessions on `php-01`, the task's own prompt, permissions and scorer, Sonnet 5, `natural`. Go on if `sql.md` is opened in at least 1 of 2; otherwise stop and report.

**Guard.** Eight K sessions (the probe's two not counted). This change merges only if `sql.md` is opened in **at least 4 of 8**, and `php-01`'s O1 and O2 are each at least 7 of 8, and H at its median is not below `php-01`'s floor calibration median. Reported with no bar: H1, H2, H3 and X per session, split by whether `sql.md` was opened (a lead, not a result); `php-laravel.md` opened; `detect-stack` ran; the skill invoked; the Skill `args` column (handoff 2026-09-28, the `args` turn); cost.

**Against the sources (added 2026-09-30, before any session; owner: "Có, thêm 8 phiên S (Recommended)").** The owner's rule that a sprint changing a skill runs its probe on both sides applies here too, since `bk-build`'s text changes. So the guard is one `bench` call `--branches K,S --runs 8` on `php-01`, K and S interleaved (S as `php-01`'s `task.json` loads it: `fullstack-dev-skills` at `5e8b6b8`). The bar above reads K only. Primary against the sources: H, K against S, exact two-sided permutation test (`permutationTest`); "better than its sources on `php-01`, Sonnet" only at p ≤ 0.05 with K above S, otherwise "no clear difference". Reported with no bar: each hazard, O1, O2, X, and whether a source skill was invoked, per branch. Like every measured branch, it runs from the main checkout `C:\Projects\Bearingkit` with this branch checked out (the measurement profile allows `Read` only under `C:/Projects/Bearingkit/skills/**`; see `docs/specs/2026-09-28-stack-rule-timing.md`, `d45c61b`).

**`build-01` again.** `bk-build`'s text changes, so `build-01`'s guard runs again before merging: eight K sessions, its bar as registered in `docs/specs/2026-09-26-bk-build-design.md` ("The owner's choice after calibration"): O1 8 of 8, O2 and O3 at least 7 of 8, P3 at least 7 of 8. Its profile does not list `sql.md` (no signal in the fixture), so this checks the sentence, not the scan.

**`shell.md`.** Its signal is built and tested here, but its reach cannot be measured until the file exists; the `shell` task's own reach probe (P4b, second half) is that measurement.

**Sessions**: 2 + 8 K and 8 S on `php-01`, 8 on `build-01`, 26 in all (18 before the S branch was added). **Budget: not measured** (no session of this change has run; read `get_usage` before each batch, the runner stops at 90%). If the quota does not allow both guards, the change stays on the branch and the owner is asked.

## Addendum, 2026-10-01, before any session: what changed since the registration

Written on the owner's machine after this branch took `main` at `ebde540`, and before the probe. The bars above are **unchanged**; this section states what is different from the day they were registered, so the result is read against the right text.

- **Merge, not rebase.** The registration says "rebased onto the `main` of that day", and `docs/handoff/2026-09-28-p4b-topic-build.md` says to rebase too. The branch was already pushed, so `main` was merged into it (`git merge --no-edit main`), as `php-01` did at `c0a6e5b`: a rebase would rewrite pushed commits. The tree a session reads is the same either way.
- **The merge order taken differs from the one recommended.** `p4-step0-scope` was measured and not merged (kept on its branch for P5, owner's decision 2026-09-30). `p4a-php` failed its guard on reach; `p4c-build-reach`, which carries it, was measured and merged at `21237d0` (`docs/specs/2026-10-01-bk-build-stack-reach-design.md`). So `php-01` and `php-laravel.md` are on `main`, the condition "Task: `php-01`, reused" asks for, and no step-0 sentence exists to keep.
- **`bk-build`'s text is not the text of the registration.** Since `21237d0` it has a step 1 ("Run `detect-stack` … and open every file it lists under `stackFiles` before reading or editing code"), an "Evidence to paste" line naming the list, and a "Read first" bullet that says the files are "opened in step 1 from the profile's `stackFiles`". When this measurement was registered the instruction was the bullet's bold sentence. The guard therefore measures this branch's scan and sentence **on top of** step 1, not on the old bullet; a pass says the profile-listed `sql.md` is read under today's `bk-build`, nothing about the old text.
- **The conflict, one place** (`skills/bk-build/SKILL.md:12`; `stacks/index.md` merged by itself): `main`'s bullet is kept word for word, and only its sentence "`sql.md` is opened by subject matter — a query, a migration, a schema — not by the profile." is replaced by this branch's "The profile also lists `sql.md` when the tree holds `.sql` files or a migrations directory, and `shell.md` for shell scripts once that file exists; a change that touches a query, a migration or a schema opens `sql.md` even when the profile does not list it." `git diff main -- skills/bk-build/SKILL.md` is that one sentence.
- **The floor for "`sql.md` opened" on `php-01` is 0.** With `sql.md` not listed by the profile (K-after of the stack-reach run, `p4c-build-reach@32d1497`, `evals/results/2026-10-01-bench-php-01-natural-3`, `-5`, `-7`, `-9`), `reach(raw, 'sql').file` is true in **0 of 8** sessions, and the path `stacks/sql.md` appears nowhere in any of the eight streams; the same holds for the eight K-before sessions (`-2`, `-4`, `-6`, `-8`, `p4a-php@c443d4e`). Control on the same read: `reach(raw, 'php-laravel').file` gives 6 of 8 and 1 of 8, the figures of that spec. So the subject-matter sentence alone opened `sql.md` in none of sixteen `php-01` sessions, and the bar "at least 4 of 8" is read against 0 of 8. This is a description of an earlier run on another commit, not an interleaved branch of this measurement: no test is registered on it.
- **The profile on the merged tree**: `node scripts/detect-stack.cjs evals/bench/php-01/app` lists `php-laravel.md` then `sql.md`; on `evals/bench/build-01/app` it lists `node.md` only (checked 2026-10-01; the sessions run in the copy `build.cjs` makes of those trees).
- **Unchanged**: the probe rule, the guard bar (K only: `sql.md` opened in at least 4 of 8, O1 and O2 each at least 7 of 8, H median not below the floor's calibration median, 2), the comparison against S, `build-01`'s bar, the task files and their permissions. `build-01`'s permissions refused 45 commands in the eight sessions of 2026-10-01 without costing a bar; they are left as registered here, and refused commands are read by eye again.
- **On the owner's machine, merged tree**: suite 187 of 187 (`main` 183, plus this branch's four tests), `bench-py-01.test.cjs` included; `node evals/bench/py-01/mutants.cjs <scratch>` M00 green, M01–M16 red, the run the cloud build could not make.

## Two small fixes carried on this branch

- **`build-01` P6** (`evals/bench/build-01/build.cjs`): the pattern used `\brevert\b`, so "reverting", "reverted", "going back" and "rolling back" were missed (the guard's K5, "Going back means reverting…", was read by eye). Fixed with word forms; "go back" counts only as "go back to", "going back means" or "going back is", so "I'll go back and re-check the diff" does not; test cases, positive and negative, in `tests/bench-build-01.test.cjs`. The wider pattern can also over-count ("restores" about something else); P6 stays read by eye before any result. A line in `docs/specs/2026-09-26-bk-build-design.md` says earlier P6 counts may be low and were not re-scored.
- **`py-01` mutants** (`evals/bench/py-01/mutants.cjs`): red or green now comes from the exit code of `node --test` (non-zero is red); the TAP output is only mined for the reason. The TAP-count regex had already failed once on a reporter change (P3c-b, Node 25). Not run on the cloud: the harness runs `python -m pytest`, and this session runs no Python; the owner's machine reruns it (M00 green, M01–M16 red). `evals/bench/php-01/mutants.cjs` on `p4a-php` reads `# fail N` the same way; not touched here (out of this session's scope), noted for the owner.

## Build record (cloud, Linux, Node 22, 2026-09-28)

- **`detect-stack`**: `topicsIn(root, { depth, entries })` in `scripts/detect-stack.cjs`, called from `detect` (`opts.scan` overrides the bound, for tests only); `stackFilesFor` takes the topics after the language files. Two tests in `tests/detect-stack.test.cjs`, written first and red (the topic test failed, the fixture guard passed before and after, as a guard should): a `.sql` file, an upper-case extension, six migration layouts (`migrations/`, `database/migrations/`, `prisma/migrations/`, `db/migrate/`, `alembic/`, EF Core's `Data/Migrations/`), `migrate` outside `db/` not counted, seven skipped places (`node_modules`, `vendor`, `dist`, `build`, `.venv`, a hidden directory, `.git`), `shell.md` absent then present in a stand-in stacks directory (`opts.stacksDir`), `.bash`, the order, depth 4 read and depth 5 not, a migrations directory at depth 4, the entry bound and the depth bound, no new key in the profile; and no fixture of `tests/fixtures/stacks/` gains a topic file.
- **Profiles of the benchmark fixtures, read with the kit's own stacks directory**: `review-03/main` and `review-04/branch` now list `typescript-react.md` and `sql.md` (they listed `typescript-react.md` before); `build-01`, `node-01`, `py-01` unchanged (`node.md`, `node.md`, `python.md`); this repository's own profile unchanged (`node.md`). `php-01` was not built here (it lives on `p4a-php`); its `schema.sql` at the root is a signal by construction. On the owner's machine the untracked `_build/upstream/` clones sit within the bound, so the kit's profile of itself there may list `sql.md` (or `shell.md` once written); no benchmark runs from that tree.
- **Time**: `detect` on this repository (430 tracked files, `.git` skipped) took about 5 ms in one reading, the benchmark fixtures 1 to 2 ms; a cloud container, not the owner's machine, and not a benchmark.
- **`build-01` P6**: `waysBack` exported from `evals/bench/build-01/build.cjs`; the new test was red on "Going back means reverting src/deps.js to datefmt-1." with the old pattern, green with the new; three negatives ("reverses", "rollout", a plain report) stay false.
- **`py-01` mutants**: `verdict(err, stdout)` exported, the run moved under `require.main`; `tests/bench-py-01-mutants.test.cjs` (a file of its own, because `bench-py-01.test.cjs` runs Python) was red on a Node-25-style output ("ℹ fail 1", exit 1) with the TAP count and green with the exit code. A run killed at its timeout now reads "NO RESULT (killed)" instead of a colour. The harness itself was not run.
- **Suite**, every `tests/*.test.cjs` except `bench-py-01.test.cjs` (it runs `python -m pytest`; this session runs no Python, although an interpreter is on the container's PATH): 181 tests, 175 pass, 5 fail, 1 skipped. The clean tree at `57361bd`, same files, before any change: 177, 171 pass, 5 fail, 1 skipped. The five failures have the same names in both (the orphan grace period of the runner; four of `bearingkit record`): environmental on cloud Linux, not this change. The owner's machine runs the whole suite, `bench-py-01` included.

## Independent review (2026-09-28, Sonnet, read only, before the commit)

The reviewer changed no file and ran no test, bench or Python. It hand-traced the scan's depth and entry bounds against every test case (no off-by-one), confirmed the fixture claims (`review-03`/`review-04` change; `build-01`, `node-01`, `py-01`, `debug-01`, `test-01`, the kit's own tree do not), the `sql.md:40`/`:42` match with `php-01`'s H2/H3, `build-01`'s registered bar, the owner's wording of question 38 (b), the `verdict` semantics, and that only the two stated passages under `skills/` changed. No must-fix.

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| The merge-order note said the first two branches edit `index.md`; `p4-step0-scope` does not | should-fix | Correct (`git show origin/p4-step0-scope` leaves `index.md` as on `main`) | Names `p4a-php` and this branch |
| The widened P6 pattern matched any "go back" ("I'll go back and re-check the diff"), untested and undisclosed | should-fix | Correct | "go back" only as "go back to / means / is"; two negatives and one positive added; the over-count risk stated here and in the `bk-build` spec |
| A migrations directory or `.sql` reached only through a symbolic link is not seen | nit | Correct, a design choice | Stated under "What the scan skips" |
| Hidden files are read while hidden directories are skipped | nit | Correct, low impact | Stated; code unchanged |

## Results (2026-10-01, owner's machine, Sonnet 5)

Every session `claude-sonnet-5`, `natural`, run from the main checkout with this branch checked out at `3f343b4` (the merge of `main` at `ebde540`, with the addendum above), tree clean before each call; every `meta.json` reads `kit.branch: p4b-topic-stackfiles`, commit `3f343b4`, `dirty: false`. One `bench` call at a time. The merge and the addendum were reviewed before the commit (Sonnet, read only): no must-fix, one wording note applied and re-reviewed.

**Probe** (`evals/results/2026-10-01-bench-php-01-natural-10`, `--branches K --runs 2`): `sql.md` opened in 2 of 2; both sessions entered through `bk-build` and ran `detect-stack`. K1 opened `sql.md` and not `php-laravel.md`; K2 opened both. At least 1 of 2: go on. One refused command (K1, a compound `sqlite3 --version; php -r …` probe).

**Guard** (`evals/results/2026-10-01-bench-php-01-natural-11`, one call `--branches K,S --runs 8`, interleaved):

| | K | S |
|---|---|---|
| `sql.md` opened (`reach(raw, 'sql').file`) | **8 of 8** | 0 of 8 |
| `php-laravel.md` opened | 8 of 8 | 0 of 8 |
| `detect-stack` ran | 8 of 8 | 0 of 8 |
| Skill invoked | `bearingkit:bk-build` 8 of 8, each with `args` | none, 8 of 8 |
| Entry `bk-build`; file first opened | 8 of 8; after the `bk-build` call in all 8 (`stack-reach-by-entry.cjs --rows`) | — |
| H per session | 2 ×8 | 2 ×8 |
| H1 / H2 / H3 | 0 / 8 / 8 | 0 / 8 / 8 |
| H1 class | some 4, none 4 | none 8 |
| O1 / O2 / X | 8 / 8 / 8 | 8 / 8 / 8 |
| P4 / P5 | 0 / 0 | 1 / 0 |
| Answer names `stackFiles`, `php-laravel.md` or `sql.md` | 6 of 8 | 0 of 8 |
| Cost USD, median (range), runner's figure | 0.355 (0.339–0.434) | 0.331 (0.284–0.817) |
| Tokens total, median (range) | 778,945 (622,606–1,088,566) | 771,309 (611,572–2,732,000) |
| Tool calls (`tool_use` events in the stream) | 18–27 | 15–45 |

**The bar, K:** `sql.md` opened 8 of 8 (at least 4), against a floor of 0 of 8 without the listing (addendum); O1 8 of 8 and O2 8 of 8 (each at least 7); H median 2, not below the floor's calibration median 2. **Holds.**

**Against the sources**, same call: H mean 2.000 for K and for S, exact two-sided permutation p = 1.0: **no clear difference**. H2 and H3 saturate on both branches and H1 fails on both, as in every earlier `php-01` run, so the task still cannot show the kit's text doing better than its sources; it shows that the listed file is read. No source skill was invoked in any S session.

**`build-01`** (`evals/results/2026-10-01-bench-build-01-natural-2`, `--branches K --runs 8`): O1 8 of 8, O2 8 of 8, O3 8 of 8, P3 8 of 8. **Its bar holds.** P1 8 of 8, P2 8 of 8, P4 0, P5 0, H 0; `node.md` opened in 8 of 8, `sql.md` in none (the profile does not list it there), `detect-stack` ran in 8 of 8, `bearingkit:bk-build` invoked with `args` in 8 of 8; cost median 0.585 (0.508–0.743). P6: the scorer's widened pattern counts 4 of 8; read by eye, 2 of 8 state a way back (K2, K4), and two are over-counts (K3 "left undone", K8 "restored the fix" about a test; the fix note warns of the second kind).

**Both guards hold; the registered condition for merging is met.**

**Reported with no bar.**
- H2 and H3 split by whether `sql.md` was opened: no split exists, all eight K sessions opened it; H2 and H3 were already 8 of 8 without it (stack-reach run), so `sql.md:40` and `:42` cannot be credited with anything here.
- Cost: K's median is about 7% above S's on these sessions; two S sessions (S6, S8) ran long after refused manual checks. Every session saw 31 tools, so token totals compare: medians within 1%. Against the stack-reach run's K-after (0.401, another call and commit, not interleaved) no comparison is made.
- Refused commands, read by eye. `php-01` K: 0 in the guard. S: 29 in five of eight sessions (S3 2, S4 4, S5 1, S6 12, S8 10), among them compound smoke tests with `export STOCK_DB=/tmp/…` and `rm -f`, `bash` on scratchpad scripts, PowerShell runs of `php bin/stock.php`, a compound `find … -exec cat`, and clean-up `rm` of files the session made. `build-01` K: 59 in all eight sessions, the kinds of 2026-10-01's earlier run (45), among them: `npm test` and `node --test` through the PowerShell tool, which the registered permissions allow through Bash only; `rm -rf`, `rm -r`, `git rm -r` and `Remove-Item` of `vendor/datefmt-1`; compound `cd … &&` lines; one `npm --version`. Six of the refused `build-01` calls asked for `dangerouslyDisableSandbox` (one more in `php-01` S6). Every barred score is 8 of 8, so none cost a bar; what the refused runs would have shown is not known.
- **Limits.** One task carries the reach bar, and its floor (0 of 8) comes from an earlier call, not an interleaved branch. `shell.md` is not written, so its signal stays unmeasured. `review-03` and `review-04` now get `sql.md` in their profile; no session of them was run here.
