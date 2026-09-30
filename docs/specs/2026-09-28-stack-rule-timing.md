# Where a stack file's rule is lost: re-read of the measured sessions, proposed `bk-build` change, registered measurement (2026-09-28)

Step 0 of P4 (`docs/handoff/2026-09-27-p3c-py01-guard.md`, Next work item 0). The hypothesis to check: `bk-build`'s minimal-touch rules (Steps 2; Gates: no code the plan didn't name, no error handling for a scenario the plan doesn't have) override the stack file's rules. The one lead: K1 of `evals/results/2026-09-27-bench-node-01-natural-3/` called the missing timeout a pre-existing gap, "out of scope". No session was run for this section.

## Method

`evals/analysis/stack-rule-timing.cjs` reads every K session of `node-01` and `py-01` in `evals/results/` (untracked; owner's machine only) that opened its stack file (`Rfile` in the session's `check.json`, as the scorer's `reach()` reads it), and prints one row per session: `bk-spec` and `bk-build` invoked; whether the stack file was first opened before `bk-build` started, after it, or with no `bk-build`; whether it was opened again once `bk-build` started; whether the shared client (`src/client.cjs`, `stock/client.py`) was edited; whether one assistant sentence names a timeout or deadline and calls it pre-existing or out of scope; whether the first Skill call passed `args`; and whether the deadline hazard passed (N3, Y2). Checks on the script itself: the stack-file rows were matched by hand against a debug listing (a first draft that mangled Windows paths found 1 of 15 rows and was fixed); the scope column first flagged a session whose "out of scope" sentence was about error messages, not the deadline, so it now matches within one sentence, and flags exactly the two sessions read by eye below.

## Results (31 sessions, all on 2026-09-27; descriptive, nothing here was registered)

| Group | Deadline passed |
|---|---|
| `py-01`, file first opened **after** `bk-build` started (its "Before the first edit, read each file …") | **7/8** |
| `py-01`, file opened during `bk-spec`, **before** `bk-build` | **1/7** (Fisher exact, two-sided, p = 0.010) |
| `node-01`, file opened before `bk-build` | 4/8 |
| `node-01`, no `bk-build` (`bk-spec` then code) | 7/8 |
| shared client edited / left unchanged (both tasks) | 12/14 / 7/17 (p = 0.024) |

- **No session re-read the file in `bk-build`.** Fifteen sessions opened it during `bk-spec` and then invoked `bk-build`; none opened it again. `bk-build`'s "Before the first edit, read each file the profile lists under `stackFiles`" was treated as already satisfied.
- **Of the 12 sessions that opened the file and missed the deadline**, two gave a scope reason in so many words (`node-01-natural-3` K1: a hung API "would hang the export indefinitely", left as a "pre-existing gap … out of scope"; K4: "Not adding a fetch timeout … pre-existing gap in `getItem` shared with `show`, out of scope"); one noted the client had "no pooling/timeout" and went on (`py-01-natural-4` K3); one stopped after the spec with no code (`node-01-natural-3` K2); eight were silent. Eight of the eleven that wrote code and missed listed the shared client in their touchpoints as reused "as-is", "unchanged" or with "no change needed". That wording alone does not decide it: four `py-01` sessions that passed said the same and put the deadline around the call instead (`py-01-natural-3` K1, K2; `py-01-natural-4` K5, K6).
- **Every `node-01` read happened during `bk-spec`**, so `node-01` cannot split "after" from "before".

**Reading.** The hypothesis as worded stands only in part: an explicit scope reason appears in 2 of 12 misses. The pattern the sessions show is about *when* the file is read. Read at the edit, the rule is applied (7 of 8 on `py-01`). Read during `bk-spec`, it has to survive into the spec's touchpoints and criteria; when the spec lists the shared client as "reused unchanged", `bk-build` implements the spec, does not re-read the file, and its minimal-touch gates then keep the deadline out. This is correlational: which path a session takes is the model's own choice, not assigned.

**A confound found on the way: the two `node-01` runs are not comparable.** On 2026-09-27 the 18 K sessions written up to 04:56 UTC (`node-01` probe and second guard, `build-01` guard) all called their first skill without `args`; the 26 K sessions written from 08:09 UTC on (`py-01` probe, guard and comparison, `node-01` comparison) all passed `args`. Before that day `args` was rare: 3 of 164 K sessions with a Skill call in `evals/results/` (one in `build-01`'s and two in `test-01`'s runs of 2026-09-26). Times are the stream files' modification times, in UTC. The kit's text is identical across the switch (`git diff 4c0ce4d 5185415 -- skills hooks agents bin .claude-plugin scripts/detect-stack.cjs scripts/bench.cjs` prints nothing; `git diff --stat 4c0ce4d 5185415` lists changes under `docs/`, `evals/bench/`, `tests/` and `CHANGELOG.md` only; in `evals/bench/`, the new `py-01` task and the `node-01` scorer's O1), and the stream reports the same host (`2.1.281`), model (`claude-sonnet-5`), 38 skills and 31 tools in both. The cause is not visible in the streams; something outside the repository changed between 04:56 and 08:09 UTC. Among sessions that opened the file: before the switch 10/10 passed the deadline, after it 9/21. So "the lead did not replicate" (spec `2026-09-26-stack-node-python-design.md`, "`node-01`, K against S") compared two conditions, not two draws of one; only interleaved branches are comparable from here on, and the `args` marker is reported per session.

## Proposed change (COUNCIL: text the model reads)

In `skills/bk-build/SKILL.md` only:

1. **Read first**, the stack-file line: "**Before the first edit, read each file the profile lists under `stackFiles` — again, even if bk-spec already read it — and list the rules that apply to what the change adds or newly calls.**"
2. **Gates**, one line after the minimal-touch gate: "A stack-file rule that applies to what the change adds or newly calls is part of the plan even where the plan is silent; if it has to live in shared code, that edit is made and named in the report, not skipped."

Why both: (1) targets the timing the sessions show (read at the edit: 7 of 8); (2) resolves the conflict the two explicit misses name, where the rule falls on code the plan marks unchanged and the gate "no error handling for a scenario the plan doesn't have" (a paraphrase of `multica-ai/andrej-karpathy-skills`, per the skill's Sources line) pulls the other way. Neither line names a hazard, a task or a language.

**Rejected.**
- Gate line alone (the handoff's first idea): the explicit scope reason is 2 of 12; the other ten show no conflict being weighed, and no re-read.
- Re-read alone: leaves the gate conflict for rules that land on shared code (`node-01`'s deadline lives in the client or around it).
- Moving the rules into `bk-spec`'s acceptance criteria: `bk-spec` already says the stack's rules "shape the edge cases and the requirements", and it was read in 23 of 31 sessions; a second skill changed would need its own measurement.
- Measuring nothing and merging: text the model reads reaches `main` only with a measurement.

## Measurement, registered before any session

- **Tasks**: `node-01` and `py-01`, as registered in `docs/specs/2026-09-26-stack-node-python-design.md` (prompt, permissions, fixture, scorer as they stand on `main`), Sonnet 5, `natural` only.
- **Branches, eight sessions each per task, interleaved**: **K-new** (this branch: the two lines above), **K-old** (the kit as `main` ships it), **S** (the pinned sources as each `task.json` loads them). All branches run from the main checkout `C:\Projects\Bearingkit`, with `--config-dir C:\Projects\Bearingkit\_build\profile\claude` (absolute): K-old is a round with `main` checked out (`--branches K --runs 2`), K-new and S a round with this branch checked out (`--branches K,S --runs 2`); `git switch` between rounds, on a clean tree (every edit to this branch committed first; `evals/results/` and `_build/` are untracked and stay). Per task, four rounds of each, alternating, K-old first — eight `bench` calls per task; `node-01` first, then `py-01`, then `build-01`'s guard (eight K-new sessions, this branch checked out). Before each K-old round `git diff main -- skills/ hooks/ agents/ scripts/` prints nothing, and before each K-new round the same against this branch. Never two `bench` calls at once. *(Corrected 2026-09-30, before any session: the first version ran K-old from a worktree of `main`. The measurement profile allows `Read` only under `C:/Projects/Bearingkit/skills/**`, and `stackFiles` names the stack files of the checkout the session runs from, so K-old sessions in a worktree would have been refused the very files whose reading this compares — a bias for K-new.)* S loads its skills from `_build/upstream/…`, outside that `Read` rule, so an S session that invoked a source skill could not open the skill's own references; in the 16 S sessions of 2026-09-27/28 no source skill was invoked, so this did not bite there; it is reported if it happens.
- **Primary**: sessions passing the deadline hazard (N3 on `node-01`, Y2 on `py-01`), pooled over both tasks (16 against 16), K-new against K-old, Fisher exact two-sided. **Merge bar for the change**: K-new above K-old with p ≤ 0.05; on each task O1 and O2 for K-new at least 7 of 8 and not below K-old; and `build-01`'s guard (eight K-new sessions, its bar as registered in `docs/specs/2026-09-26-bk-build-design.md`, "The owner's choice after calibration") holds, since `bk-build` changes. Otherwise the change stays on the branch and the owner decides.
- **Against the sources**: the same pooled test, K-new against S; "better than its sources on these two tasks" only at p ≤ 0.05 with K-new above S; otherwise "no clear difference".
- **Reported with no bar**: per task, the deadline hazard (Fisher exact per task, descriptive), N or Y (permutation test), each other hazard, O1, O2, X; per session the columns of `stack-rule-timing.cjs` (file opened, before or after `bk-build`, re-read, client edited, scope sentence, `args`); skills invoked; P4, P5; cost median and spread; tokens only where tool counts match.
- **Budget, not measured**: 48 sessions plus 8 for `build-01`, 56 in all. The 31 sessions of 2026-09-27 cost about 4% of the week including the main session, so about 7% here. Read `get_usage` before each round; the runner stops at 90% of the five-hour window or 95% of the week.

**Limits.** Two small fixtures with one planted deadline each; the path a session takes (`bk-spec` first or not) is its own choice and is reported, not controlled; the switch above shows that an unobserved outside condition can move the deadline hazard, which interleaving protects against only within one run.

## Independent review (2026-09-28, Sonnet 5, read only)

The reviewer changed no file and ran no Python and no session; it ran the script and re-derived by hand every number above from the raw streams and `check.json` files (the table, both p-values, the 15 with no re-read, the two scope quotes verbatim, the eight of eleven and the four passing `py-01` sessions, the `args` counts 18/26 and 3 of 164, the host/model/tool parity). Must-fix: none. Should-fix: the quoted `git diff` pathspec prints nothing, so it could not show the O1 change it was credited with — fixed above. Note: the script collapses any run of backslashes, where `reach()` replaces each escaped pair; same result on every path in these streams (all 31 rows agree with `Rfile`) — kept. It found no overclaim in the reading, and that the proposed lines name no task, hazard or language; they deliberately narrow the minimal-touch gate, which "Why both" states.

## Owner's decision (2026-09-28)

Three questions, answered with the recommended option each: "Duyệt cả hai dòng (Recommended)" — both lines and the registration above; "Sau khi reset tuần (Recommended)" — the 56 sessions run after the weekly quota resets (2026-09-30 03:00 UTC; it stood at 86%); "Có, làm phần không đo (Recommended)" — this session goes on with P4a's unmeasured build (`php-laravel`), whose sessions run after this measurement so they use the `bk-build` that results from it. The two lines are committed to the branch now; they reach `main` only through the bar above.

## Results (2026-09-30, owner's machine, Sonnet 5, host 2.1.281)

Run as corrected in `d45c61b`: every branch from the main checkout, K-old rounds with `main` at `bec56aa`, K-new and S rounds with this branch at `77c357a`, alternating, K-old first, four rounds each per task; `node-01` 08:30–09:45 UTC, `py-01` 09:45–11:50 UTC. Each results folder's `meta.json` records the kit branch and commit (runner `889e4a3`); all sixteen rounds read `dirty: false`. Folders: `evals/results/2026-09-30-bench-node-01-natural{,-2…-8}`, `…-py-01-natural{,-2…-8}` (odd suffix, and the first, K-old; even, K-new and S).

| Task | Branch | Deadline | O1 | O2 | File opened | `bk-build` | Median cost USD |
|---|---|---|---|---|---|---|---|
| `node-01` | K-old | 1/8 | 8/8 | 8/8 | 8/8 | 8/8 | 0.469 |
| `node-01` | K-new | 5/8 | 8/8 | 8/8 | 8/8 | 8/8 | 0.463 |
| `node-01` | S | 0/8 | 8/8 | 8/8 | — | — | 0.309 |
| `py-01` | K-old | 3/8 | 8/8 | 8/8 | 8/8 | 8/8 | 0.467 |
| `py-01` | K-new | 4/8 | 8/8 | 8/8 | 8/8 | 8/8 | 0.500 |
| `py-01` | S | 0/8 | 8/8 | 8/8 | — | — | 0.316 |

**Primary: deadline pooled, K-new 9/16 against K-old 4/16, Fisher exact two-sided p = 0.149.** The bar needs p ≤ 0.05, so **the change does not merge**; it stays on this branch and the owner decides. `build-01`'s guard was not run: it is part of a bar the primary already failed, so it could not change the outcome (eight sessions saved). Per task, descriptive: `node-01` p = 0.119, `py-01` p = 1.0; H K-new against K-old by permutation, p = 0.119 and 1.0.

**Against the sources, as registered:** K-new 9/16 against S 0/16, p = 0.0008 — "better than its sources on these two tasks" holds for K-new (the text on this branch, not merged). No S session invoked a source skill; S sessions are the floor with the sources loaded.

**Reported with no bar** (`evals/analysis/stack-rule-timing.cjs` on these folders only): the stack file was opened in 32 of 32 K sessions; **no session re-read it once `bk-build` started — 0 of 11 K-new sessions that had read it during `bk-spec`**, so the first line ("again, even if bk-spec already read it") was not followed. The shared client was edited by K-new in 6/8 (`node-01`) and 3/8 (`py-01`), by K-old in 2/8 and 0/8; on `node-01` all five K-new deadline passes edited the client, which is what the second line (a stack rule is part of the plan, in shared code if need be) asks for; on `py-01` only one of the four did (the others left the client unchanged). A lead on `node-01` only, not a result. The other parts of the bar held for K-new (O1 and O2 8/8 on both tasks), which does not change the outcome. 31 of 32 K sessions passed `args` to their first Skill call (the exception a K-old `node-01` session, `…-natural-5`), so the post-2026-09-27 condition held on both sides. One explicit out-of-scope sentence among the 19 misses (K-old).
