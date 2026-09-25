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
