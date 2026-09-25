# bk-debug sprint design (2026-09-25)

Item 4 of the v0.3 order (`docs/plans/2026-09-19-v03-remaining-skills.md`). The owner asked for it after the review-02 decision: "Tiếp tục làm sprint bk-debug theo khuyến nghị cho tôi." The sprint follows the recipe of that plan, with one change: the outcome comes from `bearingkit bench`, measured against the skill's sources on the same task and model (owner's rule in `AGENTS.md`), not only against the skill's previous version.

## What the sprint answers

On `debug-01` with Haiku 4.5, three sessions per branch (`docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md`, "Measured on Haiku"), no branch fixed the root cause and no session added a regression test. That includes the kit, whose gate says "No 'resolved' without the regression test". The three K streams, read on 2026-09-25 (`evals/results/2026-09-24-bench-debug-01-natural-haiku-2/`):

- **K1** took the tempting patch: `formatDate` reads local components. It then committed through `bk-ship`, which the prompt did not ask for.
- **K2 and K3** made a partial root fix. `parseDate` goes through `Date.UTC`, but `addDays` still uses local `setDate` and `daysLate` still floors a local difference. The frames are still mixed, so the hidden tests fail across a daylight-saving change.
- **No K session**:
  - wrote a test;
  - ran the suite in any zone but the machine's;
  - opened `references/systematic-debugging.md`. They worked from `SKILL.md` alone, as the Haiku `bk-review` sessions did: 1 of 8 opened a reference.

All three S sessions (Superpowers `systematic-debugging`) made the same partial fix as K2 and K3. So the gap is shared with the source, and a fix belongs in the body of `SKILL.md`, the only text Haiku reliably reads.

## Changes (candidate, measured before commit)

1. **`SKILL.md` body**, steps 2 to 4:
   - Step 2 ranks three to five falsifiable hypotheses before testing any, then tests them one at a time. This is D5 question 33 (b), decided by the owner on 2026-09-24.
   - Step 3 names the rule the code breaks, not only the line that showed it, and checks every other site in the same path against that rule.
   - Step 4 writes the regression test first and runs it red on the unfixed code. When the failure depends on the environment (time zone, locale, OS, clock, ordering), the test sets that environment itself and covers the values where behaviour changes, not only the reporter's.

   Each sentence is worded without this fixture's names. The body stays under 100 lines.
2. **`references/feedback-loop.md`**, the decided absorb of `mattpocock/skills` `skills/engineering/diagnosing-bugs/SKILL.md` at `3cca18b` (MIT; inventory, mattpocock table row 4). It covers:
   - building a loop that goes red on the reported symptom (the ways to build one, in order), and tightening it;
   - raising the rate of a flaky bug, and minimising the reproduction;
   - ranked falsifiable hypotheses, with their format;
   - tagged debug logs, and the perf branch;
   - the no-correct-seam finding.

   Recorded in `NOTICE` and in `upstream/sources.json` (`tracked` and `derived`).
3. **`references/systematic-debugging.md`**, phase 3: "one hypothesis, written" becomes "rank several, test one at a time". This reconciles it with the absorb (inventory, conflict 2).
4. **Test case** `skills/bk-debug/tests/04-every-site-of-the-rule.md`: a fix that repairs the line the symptom showed and leaves another site breaking the same rule fails.

The description is unchanged, so routing is not measured again.

## Measurement (registered 2026-09-25, before any session of this sprint ran)

Task `debug-01`, prompt and checks as frozen on 2026-09-24. Model Haiku 4.5 (`--model haiku`).

- **Before**, at the commit of the run, whose `skills/bk-debug/` is unchanged since the 2026-09-24 sessions (last change `348c1bf`):
  - five more `natural` sessions each of K, S and F, interleaved by the runner;
  - with the three of each from 2026-09-24 (K and S in `…-debug-01-natural-haiku-2/`, F in `…-debug-01-natural-haiku/`), eight per branch.
- **After**: eight `natural` K sessions with the candidate set in the main checkout. S and F are not run again.
- **Scored** by the fixture's checks: `root` and `regression` are the outcomes; `visible` and `kept` are guards.
- **Read in the streams** for every K session, before and after:
  - whether the session ran the suite before its first edit;
  - whether the test it added failed on the planted code (read from its runs);
  - which skills it invoked.

**Commit rule**: the candidate is committed only if all three hold:
- against the eight K sessions before, `root` or `regression` rises by four or more of eight, with two-sided Fisher p ≤ 0.05 for that outcome. The bar was 0.1 for each outcome when first written. It was tightened to 0.05, splitting 0.1 over the two outcomes, after the independent review of this section noted that "either of two" at 0.1 each roughly doubles the chance of a false win. The change was made while the before sessions were running, after two of them had been seen, and before any after session; it only makes the bar stricter.
- neither `visible` nor `kept` falls by three or more;
- a guard on Sonnet 5 (the owner's daily model; its floor made the root fix 3 of 3), four K sessions with the candidate: `root` at least 3 of 4, `visible` and `kept` 4 of 4.

Otherwise nothing under `skills/` is committed, the results are recorded here, and the choice goes to the owner.

**Against the sources**: the after-K counts are compared with S's eight by the same bar (four apart, p ≤ 0.05 per outcome). "Better than its sources on `debug-01`, Haiku" is written only if that bar is met. Otherwise it reads "not better on this task".

**Limits, stated now**:
- One task. The candidate text was written after reading how this task's sessions failed. With no held-out task, a pass says the text helps on `debug-01`, not on debugging in general.
- The daylight-saving case is named in the checks, and the wording names environment boundaries only in general terms.
- Haiku sessions see 35 tools and Sonnet sessions 31, so tokens compare only within a model.

## Result (2026-09-25): the candidate did not pass, nothing under `skills/` was committed

Before: `bearingkit bench --task debug-01 --config-dir _build/profile/claude --branches K,S,F --runs 5 --model haiku` (`evals/results/2026-09-25-bench-debug-01-natural-haiku/`), with the three of each from 2026-09-24. After: the same with `--branches K --runs 8` and the candidate set in the main checkout (`…-natural-haiku-2/`), then `git checkout` and removal of the two new files; `git status` clean. The candidate files are kept outside the repository, in the session's scratchpad. Every session ran Haiku 4.5 and saw 35 tools.

| Eight sessions each | `root` | `regression` | `visible` | `kept` | Cost USD, median (min–max) |
|---|---|---|---|---|---|
| K before | 1 | 0 | 8 | 8 | 0.103 (0.085–0.184) |
| K after (candidate) | 1 | 1 | 8 | 8 | 0.119 (0.100–0.196) |
| S sources | 0 | 0 | 8 | 8 | 0.112 (0.086–0.148) |
| F floor | 0 | 0 | 8 | 8 | 0.072 (0.052–0.109) |

- **By the commit rule the candidate fails**: `root` 1 against 1 and `regression` 1 against 0, both Fisher p = 1.0. The Sonnet guard was not run, since the first condition already failed. Against the sources: "not better on this task" (after-K 1 and 1 against S 0 and 0, p = 1.0).
- It cost 15% more at the median (0.119 against 0.103) for no measured gain.
- Read in the streams (a read-only script over the raw streams; every K session before and after):
  - every one ran the suite before its first edit;
  - none opened a reference, the new `feedback-loop.md` included;
  - none ran the code in another zone.
- **Where the new text did reach the model**:
  - after-K8 wrote a test first, ran it red, then fixed `parseDate`, then grepped for other `new Date(` calls. It read "the rule" as the constructor call, not as local and UTC frames mixed, and so left `addDays` local.
  - after-K7 made the full fix (`parseDate`, `formatDate`, `addDays`), as before-K1 of 2026-09-25 did without the text.
  - the other six made the same partial or tempting patch as before.
- Found on the way: 4 of the 16 K sessions (2026-09-24 K1, 2026-09-25 before-K4, after-K1 and after-K2) invoked `bk-ship` after the fix and tried to commit, although the prompt asked only to find and fix. The protocol's chain (build, test, review, ship) stops only at COUNCIL points, so the kit does this by design. Whether a debugging request should end at the fix went to the owner.
  - *Corrected before the second measurement, after the independent review of its registration:* counting also a Bash or PowerShell `git commit` or `git push` run without the skill, the sessions that tried to commit were more:

    | Branch, eight sessions each | Tried to commit |
    |---|---|
    | K before | 3 |
    | K with the first candidate | 6 |
    | S sources | 5 |
    | F floor | 5 |

  - So committing unasked is Haiku's own habit on every branch, the floor included, not only the kit's chain. The owner's question named only the 4 of 16 through `bk-ship`. The owner's answer (next section) still stands on these numbers: it asks for the stop, which matters more when the model commits on its own.
- What it says: on Haiku, three changes to the body of `bk-debug`, placed where Haiku reads, moved neither outcome on this task. Together with `review-02`, where a line in a reference did not reach Haiku either, the kit's text has not yet shown a measured effect on a Haiku session. (Later the same day the stop-at-the-fix line took effect in 8 of 8 Haiku sessions, against 3 of 8 that tried to commit before, p = 0.2: an effect in every session measured, not a proven one; next section.) On Sonnet the floor already solves `debug-01`. The choice of what to do next goes to the owner (handoff).

## The owner's choice and the second measurement (registered 2026-09-25, before its sessions ran)

The owner's answers after the result above (labels verbatim):
- direction: "Commit phần chắt lọc, đóng sprint (Recommended)";
- the chain into `bk-ship` after a fix: "Dừng ở bản sửa, hỏi trước khi commit (Recommended)".

The package now in the main checkout, uncommitted:
- `references/feedback-loop.md` (the absorb), with its `NOTICE` and `upstream/sources.json` entries;
- phase 3 of `references/systematic-debugging.md` ranks three to five hypotheses (D5 question 33 (b));
- test case 04 (a request to find and fix ends at the fix). The first candidate's case for fixing every site of the rule is left out, since the body steps that would ground it are not changed; it stays with the candidate in `_build/bk-debug-sprint/candidate/`.

In the `SKILL.md` body:
- one "Read first" line pointing at `feedback-loop.md`;
- the Sources line;
- one "Next step" line: "Then stop and report. Unless the user asked for a commit, push or pull request, run no `git commit`, `git push` or bk-ship: leave the fix uncommitted and offer to commit it."

Steps 1 to 5 and the gates are unchanged. The owner's choice places the body scope narrower than the first candidate. `bk-protocol` is not changed: its line that the chain "stops only at COUNCIL points" now has an exception in `bk-debug` that it does not state. The protocol has almost no budget left (6,485 of its 6,500-character proxy after the `bk-perf` sprint, `docs/plans/2026-09-19-v03-remaining-skills.md`; not measured again today). Whether it needs the line is read from this measurement.

The independent review of this section (2026-09-25) found three problems, fixed before any session ran:
- the attribution line named a "project-glossary step" the source does not have; it is the step that reads `CONTEXT.md` and ADRs;
- the first draft of the test case for every site had no ground in the unchanged body, so it was dropped;
- the commit-attempt baselines were counted from `bk-ship` calls alone.

That reviewer ran `python3 --version` once, against the ban, and said so. It changed no file.

Measured on `debug-01` before commit, eight `natural` K sessions on Haiku, then four on Sonnet 5. A commit attempt is a `Skill` call to `bk-ship`, or a Bash or PowerShell command containing `git commit`, `git push` or `gh pr create`. Before this change, 3 of 8 K sessions on Haiku made one, and 6 of 8 with the first candidate (S 5 of 8, F 5 of 8).

Committed only if all of these hold:
- Haiku, commit attempts: 0 of 8;
- Haiku, `visible` and `kept`: each at least 6 of 8 (no fall of three or more from 8 of 8);
- Sonnet, commit attempts: 0 of 4; `root` at least 3 of 4; `visible` and `kept` 4 of 4.

`root` and `regression` on Haiku and cost are reported, with no bar: this package is not expected to move them, and the first candidate showed body text did not. With a baseline of 3 of 8, 0 of 8 is not a significant difference (Fisher p = 0.2). The bar checks that the line takes effect, not that it is proven. If a condition fails, nothing under `skills/` is committed and the owner is told.

### Result of the second measurement (2026-09-25): all conditions hold, the package is committed

`bearingkit bench --task debug-01 --config-dir _build/profile/claude --branches K --runs 8 --model haiku` (`evals/results/2026-09-25-bench-debug-01-natural-haiku-3/`), then the same with `--runs 4` on Sonnet 5 (`…-debug-01-natural/`), the package in the main checkout. The model ids were read from each stream's per-model usage.

| K with the package | Tried to commit | `visible` | `kept` | `root` | `regression` | Cost USD, median (min–max) |
|---|---|---|---|---|---|---|
| Haiku, eight sessions | **0** | 8 | 8 | 0 | 2 | 0.104 (0.082–0.190) |
| Sonnet 5, four sessions | **0** | 4 | 4 | 4 | 4 | 0.335 (0.309–0.345) |

- By the registered rule every condition holds, so the package is committed.
- Eleven of the twelve answers end by offering the commit ("Would you like me to commit it?", "I haven't committed anything. Want me to commit it?"); one (Haiku K2) ends "Ready to commit." without asking (read again in the audit of the same day). None ran `git commit`, `git push` or `bk-ship`.
- Before this line, 3 of 8 Haiku K sessions tried to commit. 0 of 8 against 3 of 8 is Fisher p = 0.2: the line took effect in every session measured, not a proven difference.
- On Haiku, `root` and `regression` did not move, as expected: 0 and 2 of 8, against 1 and 0 before; 2 of 8 against 0 of 8 is p = 0.47. The cost is level with before (0.104 against 0.103).
- No Haiku session opened a reference, so `feedback-loop.md` and the ranked-hypotheses sentence were not read there.
- On Haiku, K3 followed the chain further, invoking `bk-test` and `bk-review` after `bk-debug`, and still stopped before a commit.
- On Sonnet all four made the root fix and added a regression test. The Sonnet floor made the root fix 3 of 3 and added no test at calibration (2026-09-24), and 4 of 4 against 0 of 3 gives p = 0.029. That comparison was not registered, and the floor ran a day earlier, so it is an observation, not a result. The kit on Sonnet cost 0.335 USD at the median against the floor's 0.124 to 0.129.
- So `bk-debug` against its sources on `debug-01`: on Haiku, "not better on this task" (root 1 of 8 for the kit before, 0 of 8 after the package, 0 of 8 for S). On Sonnet, K and S were not both measured.

## The regression test before the fix (registered 2026-09-25, before its sessions ran)

The owner chose it after the audit (label verbatim): "Đo câu 'test trước' của bk-debug (Recommended)".

**Baseline.** On `debug-01` with Sonnet 5 (benchmark spec, "`debug-01` on Sonnet"), the kit wrote a regression test in 8 of 8 sessions, but only 2 of them before the first edit under `src/`. The other six wrote it after the fix and saw it fail by stashing the fix. Superpowers wrote its four tests first. Step 4 of `bk-debug` ("Fix with a regression test that fails before and passes after") allows either order.

**Candidate.** Step 4 only, one line:

"4. Regression test before the fix: write it, run it on the unfixed code and see it fail, then fix, then see it pass; keep the fix minimal."

Nothing else changes.

**Measured before commit**, `debug-01`, eight `natural` K sessions on Sonnet 5, then eight on Haiku 4.5 as a guard. "Seen red first" is the operational definition of the benchmark spec: after the tool call that adds the test and before the first edit under `src/`, a run of that test or of the suite whose output reports a failure.

**Committed only if all of these hold**:
- Sonnet, seen red first: at least 7 of 8. Against the baseline of 2 of 8, 7 of 8 gives Fisher p = 0.041.
- Sonnet, other outcomes: `regression`, `root`, `visible` and `kept` each at least 7 of 8, and no commit attempt.
- Haiku: `visible` and `kept` each at least 6 of 8, and no commit attempt (0 of 8 with the current text).

The independent review of this section, while the sessions ran and before any result was read, raised two points:
- The Haiku guard first allowed one commit attempt. It was tightened to none.
- The candidate line describes the state of the code, not the order of the steps: "run it on the unfixed code and see it fail, then fix" can be satisfied by fixing first and stashing the fix, as six of the eight baseline sessions did. The line was not changed mid-run. The registered definition of seen red first catches that reading. If the candidate fails on it, a line that names the order ("before editing the code under test") is the next candidate.

Reported with no bar: Haiku `root`, `regression` and seen red first, and cost on both models.

**Against the sources**: Superpowers saw its test red first in 4 of 8 sessions on Sonnet. Even 8 against 4 gives p = 0.077, so this task cannot show the kit better than its sources on this outcome, and the result says so.

### Result (2026-09-25): every condition holds, the line is committed

`bearingkit bench --task debug-01 --config-dir _build/profile/claude --branches K --runs 8` (`evals/results/2026-09-25-bench-debug-01-natural-4/`), then the same with `--model haiku` (`…-natural-haiku-4/`), the candidate in the main checkout. Seen red first was read with a read-only script over the streams.

| K, eight sessions each | Seen red first | `regression` | `root` | `visible` / `kept` | Tried to commit | Cost USD, median (min–max) |
|---|---|---|---|---|---|---|
| Sonnet, step 4 as it was (baseline) | 2 | 8 | 8 | 8 / 8 | 0 | 0.330 (0.290–0.345) |
| **Sonnet, the new line** | **8** | 8 | 8 | 8 / 8 | 0 | 0.261 (0.218–0.343) |
| Haiku, the new line (guard) | 5 | 5 | 1 | 8 / 8 | 0 | 0.107 (0.080–0.151) |

- Sonnet: seen red first rose from 2 to 8 of 8, Fisher p = 0.007. The stash-after-the-fix reading the review warned of did not occur: all eight wrote the test and saw it fail before editing `src/`. The other Sonnet outcomes held, and the median cost fell by a fifth (0.261 against 0.330), since no session had to stash and restore its fix.
- Haiku guard: `visible` and `kept` 8 of 8, no commit attempt. Reported with no bar:
  - `regression` 5 of 8, against 0 of 8 for the kit before the sprint (p = 0.026) and 2 of 8 with the package committed earlier today (p = 0.32);
  - seen red first 5 of 8 (first counted as 2: the script missed three tests written as top-level `test-*.js` files, which `node --test` runs too, and one written through a Bash heredoc. The independent review found them. Recounted with a detector for every path `node --test` picks up, written by Edit, Write or a shell redirect; the Sonnet counts, baseline included, do not change under it);
  - `root` 1 of 8, unchanged.
- Against the sources: seen red first 8 of 8 for the kit against 4 of 8 for Superpowers, p = 0.077. By the registered rule this task cannot show the kit better than its sources on this outcome, and it does not.
- Against the floor, not registered for this line: the floor wrote no test in eight sessions an hour earlier (benchmark spec, "`debug-01` on Sonnet"), and the kit now writes one and sees it red first in 8 of 8. The bar of `991cc25` applied to these two sets would pass (8 against 0, p = 0.0002, no test unseen red). The floor was not run again, so this stays a reading.
