# `bk-build` reaches its stack files when it is the entry skill: design and registered measurement (2026-10-01)

Branch `p4c-build-reach`, from `p4a-php` at `c443d4e` (so `php-laravel.md` and the `php-01` task are present; neither exists on `main`). Owner's decision, verbatim, on the recommendation to stop P4b and first fix and measure how `bk-build` reaches its stack file: "Đồng ý, tiếp tục theo khuyến nghị." (2026-10-01).

## The problem, measured

From `docs/specs/2026-09-28-stack-php-laravel-design.md` ("Results", branch `p4a-php`) and `evals/analysis/stack-reach-by-entry.cjs`:

- On `php-01`, fourteen K sessions: those that entered through `bk-build` ran `detect-stack` in 4 of 11, and none of those 4 opened the stack file it listed; 2 of the 3 that came through `bk-spec` did. The guard opened `php-laravel.md` in 0 of 8 and failed on that alone (O1 8/8, O2 8/8, H median at the floor's).
- On the other tasks, the same `SKILL.md` line reached its file in 10 of 12 `bk-build`-entry sessions given the list, and 59 of 59 through `bk-spec`. Why `php-01` differs is not known; its sessions are short (about 90 s) and the change fits the router's small-change row.
- P4b (`docs/specs/2026-09-28-topic-stackfiles-design.md` on `p4b-topic-stackfiles`) registers its guard on `php-01` with the bar "`sql.md` opened in at least 4 of 8", on the same path.

The instruction today is the fourth bullet of "Read first" (`skills/bk-build/SKILL.md:12` on `p4a-php`): "Before the first edit, read each file the profile lists under `stackFiles`." Running `detect-stack` is in the first bullet, as part of a longer sentence.

## The change

`skills/bk-build/SKILL.md` only:

1. A new step 1, first in "Steps": "**Stack rules before anything else.** Run `detect-stack` from the project root, unless its output is already in this session, and open every file it lists under `stackFiles` before reading or editing code; an empty list is said, not skipped." The old steps 1–6 become 2–7; step 2 drops "first" ("Scout the touchpoints: …"), since it is no longer first.
2. The "Read first" bullet on `references/stacks/` keeps its map and version-card sentences and says the files are "opened in step 1 from the profile's `stackFiles`", instead of carrying the instruction in bold.
3. "Evidence to paste" starts with "The `stackFiles` list and the files opened".

**Why this form.** It is text only, so it reaches every host the same way (Claude Code's skill tool, the Antigravity copy), changes one file, and is measurable in one run. It moves the two actions sessions skipped from a reading list into the ordered steps, and asks for the list as evidence, so a skipped read shows in the answer. It is a hypothesis: nothing shows yet that a numbered step is followed more often than a bullet.

**Rejected, with reasons.**
- A hook that injects the `stackFiles` list or the files when `bk-build` is invoked: more reliable than text on Claude Code, where the kit already runs a session-start hook (`docs/hosts.md:21`), though no hook on skill invocation has been built or tested; not available on Antigravity, whose bootstrap is a rule (`docs/hosts.md:28`); Cursor and Copilot CLI have session-start hooks on paper only (`docs/hosts.md:45`, `:53`, not tested); it costs context on every invocation and adds a moving part on the kit's own bootstrap path. Kept as the fallback if this change fails its bar.
- `detect-stack` printing a directive line, or the files' text, under `stackFiles`: helps only where `detect-stack` runs, which was 4 of 11 `bk-build`-entry sessions on `php-01`; and it changes the output every skill reads and conflicts with P4b's change to the same script.
- Changing `php-01`'s prompt so sessions go through `bk-spec`: hides the failure instead of fixing it.
- Loosening H1 to skip test files: a change to scoring after the results.

**Other branches on the same line.** `p4-step0-scope` (Step 0, not merged) and `p4b-topic-stackfiles` (P4b, not measured) both edit the bullet this change rewrites. Whichever merges second resolves the conflict, and a branch whose text then differs from what its registration measured says so and is reviewed again.

## Measurement, registered before any session

**Task `php-01`**, unchanged (fixture, prompt, permissions, scorer, `evals/bench/php-01/`). Sonnet 5, `natural`, the runner's isolated profile, every branch run from the main checkout with that branch checked out, the tree clean before each `bench` call, `meta.json`'s `kit.branch` checked and `kit.dirty: false`.

- **K-before**: `p4a-php` (`bk-build` as on `main`, with `php-laravel.md`). **K-after**: `p4c-build-reach` at the commit that adds this spec. **S**: as registered for `php-01` (`fullstack-dev-skills` at `5e8b6b8`, as it ships).
- **Reach probe**: two K-after sessions, one `bench` call `--branches K --runs 2`. Go on if `php-laravel.md` is opened (`Rfile`) in at least 1 of the sessions that entered through `bk-build`. If neither entered through `bk-build`, two more, same rule; if again none, stop and report. Otherwise stop and report. Probe sessions count toward no bar; a probe the runner stops on quota re-runs from its start after the reset. (Lesson of `php-01`: its probe's go signal came from two `bk-spec` entries, while the guard entered through `bk-build` in 7 of 8.)
- **Main run**: four rounds, each one `bench` call `--branches K --runs 2` on `p4a-php`, then one `--branches K,S --runs 2` on `p4c-build-reach`: eight K-before, eight K-after, eight S, interleaved (driver `evals/analysis/reach-run.cjs`, the Step 0 pattern). A round counts only whole; if the runner stops itself on quota, the round re-runs from its start after the reset (`reach-run.cjs php-01 <round>`), and the partial directory is reported and not counted. The driver records each branch's head when it starts and stops if a session ran at another commit or with a dirty tree; on a stop it switches back to `p4c-build-reach`, where it lives. The tally is `evals/analysis/reach-tally.cjs` (written and checked on a synthetic log before any session: a stopped round is excluded, a re-run round counted once): it reads the rounds from `evals/results/reach-log.txt`.
- **Task `build-01`**: eight K-after sessions (`reach-run.cjs build-01`), since `bk-build`'s text changes; its guard bar as registered in `docs/specs/2026-09-26-bk-build-design.md` ("The owner's choice after calibration, and the guard").

**Bars.** The change merges only if all hold:

| Id | What | Test |
|---|---|---|
| **R** (primary) | `php-laravel.md` opened, K-after above K-before | exact two-sided Fisher test (`fisherExact` in `scripts/lib/bench-score.cjs`), p ≤ 0.05 |
| G | `php-01` guard bar for `php-laravel.md`, on K-after: opened in at least 4 of 8, O1 and O2 each at least 7 of 8, H median not below the floor's calibration median (2) | as registered in the `php-01` spec |
| B | `build-01` guard bar on K-after: O1 8 of 8, O2 and O3 each at least 7 of 8, P3 at least 7 of 8 | as registered |

What R needs, from that function at 8 against 8: with K-before at 0 of 8, K-after at least 5 (p = 0.026; 4 gives 0.077); at 1 of 8, at least 6 (0.041); at 2 of 8, at least 7 (0.041). So R asks for at least 5 of 8 in every case, one more than G's "at least 4 of 8".

**Against the sources**, on the same sessions: H, K-after against S, exact two-sided permutation test; "better than its sources on `php-01`, Sonnet" only at p ≤ 0.05 with K-after above S, otherwise "no clear difference". H2 and H3 saturated on the floor, so H can separate branches through H1 only.

**Reported with no bar**: H, H1 and its class, H2, H3, O1, O2, X per branch; entry skill and whether `detect-stack` ran, per session; when the file was first opened against the first `bk-build` call (`stack-reach-by-entry.cjs --rows`); whether the answer pastes the `stackFiles` list (read by eye); P4, P5; cost median and spread; tokens only where tool counts match; refused commands read by eye; `build-01`'s reach of its own stack file.

**Outcomes.** All bars hold: `p4c-build-reach` (which carries `p4a-php`, so `php-laravel.md` too) merges into `main` with `--no-ff`; the owner is asked before the daily install and the Antigravity store are updated. R holds and G or B fails: nothing merges, the owner decides. R fails: nothing merges; the hook is proposed as the next step (COUNCIL).

**Budget, not measured.** 2 (up to 4) + 24 + 8 = 34 to 36 sessions. `get_usage` before each batch; the runner stops at 90% of the five-hour window or 95% of the week. The only reading so far, not in the repository: the main session's `get_usage` went from 56% to 72% of the five-hour window across the four-session probe extension on 2026-09-30, the main session's own use and a review agent included, which cannot be separated.

**Limits.** One task carries the primary bar; a reach fix that works on `php-01` may still differ on other small-change tasks. The text adds a step every `bk-build` session runs, which costs a command and a file read when the list is not empty; cost is reported, not barred.

## Independent review (2026-10-01, Sonnet 5, read only, before any session)

The reviewer changed no file and ran no session. It found the `SKILL.md` diff exactly as "The change" describes, no other file depending on the old step numbers or the removed sentence, the measured claims and bar B matching their sources, and the registration unambiguous.

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| R is close to unreachable: at 0 of 8 K-before, only 8 of 8 passes (6 and 7 of 8 give p ≈ 0.05) | should-fix | Not correct. `fisherExact(a, b, c, d)` takes the table [[a, b], [c, d]] (`scripts/lib/bench-score.cjs:146`); `fisherExact(7, 1, 0, 8)` = 0.0014, and by hand C(8,7)·C(8,0)/C(16,7) = 8/11440 ≈ 0.0007 one-sided, 0.0014 two-sided. On re-review the reviewer re-ran it, found its earlier call had passed 8 for the fourth argument instead of 8 − k, and withdrew the finding | None to the bar; the thresholds are now written under the table |
| On a stop the driver leaves `p4a-php` checked out, where the driver does not exist, so the resume command fails | should-fix | Correct | `die` switches back to `p4c-build-reach` when the tree is clean |
| The driver must be committed with the spec before any run, and it checks branch and dirtiness but not the commit | should-fix | Correct | Committed together; the driver records both heads at start and stops on any other commit |
| The probe has no quota rule | note | Correct | Re-runs from its start |
| No tally covers eight directories, and partial rounds would be excluded by hand | note | Correct | `reach-tally.cjs`, checked on a synthetic log |
| The hook "reach by construction" overstates `docs/hosts.md` | note | Correct | Reworded |
| "About 16 points" has no source in the repository | note | Correct | Stated as a reading of this session's `get_usage`, not in the repository |
| Re-review: a `build-01` line logged just before a `STOP` (commit or branch mismatch) would still feed bar B | should-fix | Correct | The tally drops it on `STOP` |

## Results (2026-10-01, owner's machine, Sonnet 5)

Every session `claude-sonnet-5`, `dirty: false`, at the registered commits (K-before `p4a-php@c443d4e`, K-after and S `p4c-build-reach@32d1497`; the driver checked each). Log: `evals/results/reach-log.txt`; tally: `node evals/analysis/reach-tally.cjs`.

**Probe** (`evals/results/2026-10-01-bench-php-01-natural`): both sessions entered through `bk-build` and ran `detect-stack`; K2 opened `php-laravel.md` (after the `bk-build` call), K1 went from `detect-stack` straight to the code. 1 of 2: go on.

**Main run**, four whole rounds, none stopped (`evals/results/2026-10-01-bench-php-01-natural-2` to `-9`):

| | K-before | K-after | S |
|---|---|---|---|
| `php-laravel.md` opened | 1 of 8 | **6 of 8** | 0 of 8 |
| `detect-stack` ran (`Rdetect`) | 5 of 8 | 8 of 8 | 0 of 8 |
| Entry `bk-build`: opened | 0 of 7 | 5 of 7 | — |
| Entry `bk-spec`: opened | 1 of 1 | 1 of 1 | — |
| H per session | 2 ×8 | 2 ×8 | 2 ×8 |
| H1 / H2 / H3 | 0 / 8 / 8 | 0 / 8 / 8 | 0 / 8 / 8 |
| H1 class | none 7, some 1 | some 5, none 3 | none 8 |
| O1 / O2 / X | 8 / 8 / 8 | 8 / 8 / 8 | 8 / 8 / 8 |
| Answer names the stack list or file | 0 of 8 | 5 of 8 | 0 of 8 |
| Cost USD, median (range), runner's figure | 0.339 (0.286–0.527) | 0.401 (0.336–0.544) | 0.283 (0.259–0.314) |
| Tool calls | 16–25 | 19–24 | 15–17 |

**Bars.** **R**: 6 of 8 against 1 of 8, two-sided Fisher p = 0.0406, holds, by a narrow margin (one more K-before session opening the file, 6 against 2, gives 0.13). **G**: opened 6 of 8 (at least 4), O1 8 of 8, O2 8 of 8, H median 2 (not below 2), holds. **B** (`evals/results/2026-10-01-bench-build-01-natural`, eight K-after sessions): O1 8 of 8, O2 8 of 8, O3 8 of 8, P3 8 of 8, holds; P1 8 of 8, P2 6 of 8, P4 0, P5 0, P6 2 of 8, H 0; its own stack file opened in 8 of 8 (after the `bk-build` call), against 6 of 7 given the list on 2026-09-27.

**All three bars hold: by the registration `p4c-build-reach` merges into `main`, carrying `php-laravel.md` and `php-01`.**

**Against the sources**, same sessions: H mean 2.000 for K-after and S, exact two-sided permutation p = 1.0: no clear difference. H2 and H3 saturate on every branch and H1 failed everywhere, so `php-01` cannot show the file's text doing better than the floor or the sources; what it shows is that the file is now read.

**Reported with no bar.**
- Of the six K-after sessions that read the file, five put `declare(strict_types=1)` in the class file and not in the test file (class `some`), and one (`-5` K1) wrote it nowhere (class `none`); H1 as registered counts every added PHP file, so H1 stayed 0. The file's line 9 reached the class in five of six readers, the tests in none.
- Cost: K-after's median is about 18% above K-before's (one more command and one file read per session), and about 42% above S's. Tokens are not compared: tool counts differ.
- Refused commands, read by eye: `php-01` K-before 2 (a compound `find` and a compound `rm -f /tmp/…` smoke test), K-after 0, S 0. `build-01` K-after: 45 in all, in all eight sessions (main session and reviewer agree on the total; a split by kind depends on how a compound line is classed, so none is given) — test runs (`npm test`, `node --test`) through the PowerShell tool, which the registered permissions allow through Bash only, and compound Bash test lines; `rm -rf` and `git rm` of `vendor/datefmt-1`, and `Remove-Item` (outside the permissions); `which node`, `node --version`, `Get-Command` and similar probes; compound `cd` lines. The PowerShell tool was present on 2026-09-27 too (5 calls then, 27 now); every barred score is 8 of 8, so none of it cost a bar, though what the refused runs would have shown is not known.
- When the file was first opened: after the first `bk-build` call in every K-after reader (`stack-reach-by-entry.cjs --rows`), as step 1 asks.
