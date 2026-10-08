# P5c: the Step 0 line "a stack rule lives in shared code if it has to", measured on its own · design proposal and planned registration · 2026-10-08

Status: **CLOSED BY THE REGISTERED RULE (2026-10-08): stage 1 ran its sixteen counted sessions; the gate's items 1 to 3 hold and item 4 does not ("read and lost" in 1 of 16, against at least 5); the Step 0 line is not merged and is "not compared on `claude-sonnet-5-5`"; stage 2 was never approved and does not run (see "Stage 1 result" at the end).** Before that: stage 1 was approved by the owner on 2026-10-08, by label; one uncounted session ran; the loaded-sign it found was approved by the owner with a stop on the host version. What follows down to "Revision after the audit" is the proposal as revised on 2026-10-08, kept as written; where it says nothing is approved or built, or that a script exists only on a branch, the last four sections say what has changed since. This file is a design proposal with the registration it plans; it changes no skill, no task and no runner. It waits for the owner (COUNCIL: it concerns text the model reads and a measurement). Until the owner approves a registration by name, no branch is cut, no driver is written with its bars approved, and no session of it runs. Written in session 5 on the owner's opening message (verbatim in `docs/handoff/2026-10-08-p5c-proposal.md`): "Viết đề xuất thiết kế kèm bản đăng ký dự kiến (tên model đầy đủ, kiểm init, guard chạm tới bản chữ), commit thành spec ghi rõ PROPOSED, rồi dừng trình tôi."

## What P5c is

The third sprint of P5 (`docs/handoff/2026-10-02-shell-replicated-source.md`, "Decisions waiting on the owner", point 1; scope approved with the P5 proposal, `docs/handoff/2026-10-03-close.md`, "Next work", item 3): measure on its own the one line of Step 0 that showed a lead.

Step 0 (`git show origin/p4-step0-scope:docs/specs/2026-09-28-stack-rule-timing.md`; `docs/handoff/2026-09-30-p4-step0-measured.md`) put two lines into `skills/bk-build/SKILL.md` on the branch `p4-step0-scope` (`70e3354`) and measured them together on `node-01` and `py-01`, 2026-09-30, on `claude-sonnet-5`: the deadline hazard pooled, K-new 9 of 16 against K-old 4 of 16, p = 0.149, so the change did not merge. The first line (read the stack file again at the edit) was followed by no session (0 of 11). The second line is the lead: on `node-01` K-new edited the shared client in 6 of 8 sessions against 2 of 8, and all five of its deadline passes did. The owner's decision of 2026-09-30: "Giữ trên nhánh, đo dòng code dùng chung sau ở P5 (Recommended)", with, in the recommendation chosen: leave out the re-read line, and register enough sessions per side for an effect of the size seen.

**The line**, verbatim from `70e3354`, a new bullet under "Gates" of `bk-build`:

> - A stack-file rule that applies to what the change adds or newly calls is part of the plan even where the plan is silent; if it has to live in shared code, that edit is made and named in the report, not skipped.

It is not re-worded here. It names no task, hazard or language.

## What has changed since Step 0, read before designing (no session was run for this file)

1. **`bk-build` on `main` is not the file Step 0 edited.** Since `p4-step0-scope` was cut, `main` gained step 1 of `bk-build` ("Stack rules before anything else", `docs/specs/2026-10-01-bk-build-stack-reach-design.md`) and two more stack files. `git diff main p4-step0-scope -- skills/bk-build/SKILL.md` shows the branch would take those back. So the text to measure is **`main`'s `bk-build` plus the one line**, on a new branch, not the branch's file.
2. **The model behind the alias has changed.** Step 0 ran on `claude-sonnet-5`; the alias `sonnet` now resolves to `claude-sonnet-5-5` (the second run of `plan-01`, `docs/autopilot/decisions.md`, entry 14). Step 0's rates are not a baseline for today.
3. **On `claude-sonnet-5-5`, a `node-01` session asked in plain words does not load `bk-build`.** The guard of 2026-10-07 (`docs/specs/2026-10-03-bk-plan-design.md`, "Step 6 result"; eight K sessions whose `bk-build` is byte for byte `main`'s): `bk-spec` launched in 8 of 8, `bk-build` after it in 1 of 8. At Step 0, on the earlier model, `bk-build` was launched in 8 of 8. A line under `bk-build`'s Gates is not read by a session that never loads `bk-build`.
4. **In those eight sessions the deadline hazard followed the reading of the stack file exactly.** Read for this file from the `check.json` of each session (`evals/results/2026-10-07-bench-node-01-natural/`, owner's machine, untracked): N3 passed in 4 of 8; `node.md` was opened in K1, K2, K5 and K6, and N3 passed in exactly those four; it was not opened in K3, K4, K7 and K8, and N3 failed in exactly those four. Eight sessions of one task, read after the fact, with nothing registered: a description, not a result. What it describes is a different failure from the one the line addresses. The line addresses "the rule was read and then left out because the plan was silent". These sessions show "the file was not read"; where it was read, the rule was applied (4 of 4).

So two things have to be true before a comparison of the line can mean anything, and neither is known on this model: sessions must load `bk-build`, and among sessions that read the stack file there must still be deadline misses for the line to turn.

## Khuyến nghị: two stages; a small registered check of the precondition first, the comparison only if it holds

**Stage 1 (17 sessions):** the kit as `main` ships it, both tasks, entered through `/bearingkit:bk-build` (the runner's `command` variant, which each task's `task.json` already defines), on `claude-sonnet-5-5` by its full name. It answers, with a rule fixed beforehand, whether the condition the line addresses exists where the line is read. **Stage 2 (113 sessions)** is the comparison, K-before against K-after, and runs only if stage 1's gate holds and the owner then says so. If one of items 2 to 4 of the gate fails, P5c closes with the line unmerged on its branch and the label "not compared on `claude-sonnet-5-5`"; a failed model check (item 1) closes nothing and goes to the owner.

Why: it spends 17 sessions before 113, on the one question the 2026-10-07 guard raised, and it fixes what follows each outcome before any data. Main trade-off: the `command` variant is a narrower claim than Step 0's. A pass would say the line helps **when a session enters through `bk-build`**; it would say nothing about the plain-words path, where on this model sessions go through `bk-spec` and the line is not read.

**Rejected.**
- **The plain-words variant, as Step 0 ran it.** On this model `bk-build` was loaded in 1 of 8 `node-01` sessions; the two branches would differ in a text most sessions never open, and a miss would say nothing about the line.
- **Moving the line into `bk-spec`**, where sessions do enter. The failure seen on that path is the file not being read, which this line does not address; and it would change a second skill, with its own measurement (Step 0's spec rejected it for that reason). The lead of point 4 above is named at the end of this file as a possible later proposal; it is not P5c.
- **Going straight to stage 2.** 113 sessions with an unknown baseline under a variant these tasks have never been run in.
- **Closing P5c now with no session.** The evidence against is eight plain-words sessions of one task, read after the fact.
- **Measuring on `claude-sonnet-5`**, Step 0's model, by its full name. The kit is used with what the alias gives today; a result on the earlier model would not be said of it.
- **Both Step 0 lines again.** The owner's chosen recommendation of 2026-09-30 left the re-read line out.

## Planned registration, stage 1: does the condition exist? (to be approved by the owner before any session)

- **Text**: `main` at the commit recorded in the registration when it is approved; no kit text changes. Before each call `git diff <that commit> -- skills hooks agents scripts` prints nothing and the tree is clean.
- **Tasks**: `node-01` and `py-01`, as they stand on `main` (prompt, permissions, fixture, scorer), variant `command` (the prompt is the task's prompt after `/bearingkit:bk-build`).
- **Model, by its full name, and the `init` check** (the owner's two lessons, adopted in the opening message of session 5): every call passes `--model claude-sonnet-5-5`. **Before any counted session, one uncounted session** of `node-01` runs with the same flags, and the `init` event of its stream is read: it must name `claude-sonnet-5-5`; any other name stops stage 1 before it starts and the owner is told. The `init` event of every counted session is read the same way before anything is tallied; a counted session naming another model, or whose stream holds no `init` event (cut before it), counts as naming another model: nothing is judged, stage 1 is neither passed nor closed, and the owner is told and decides. **The uncounted session has a second use: it fixes the loaded-sign of gate 2.** Its stream is read for how the load of `bk-build` through the slash command shows (a `Skill` call naming it, or the skill's own text delivered into the session); what is found is written into this file, with the session's stream named, and **the owner approves that sign before any counted session**. If the stream shows no usable sign, stage 1 does not start and the owner is told. The host version in each `init` is read too and reported; a change of it between calls is reported, with no bar.
- **Sessions**: eight K sessions per task, sixteen counted, by two direct calls (`node bin/bearingkit.cjs bench --task <id> --config-dir C:/Projects/Bearingkit/_build/profile/claude --branches K --variants command --model claude-sonnet-5-5 --runs 8`), `node-01` first, from the main checkout, never two calls at once, `get_usage` read before each call. A call runs once and no session is re-run. A session the runner cut after its `init` event, or that did not complete after its `init` event, is named and is counted, item by item, the way that makes the gate below harder to hold: not loaded (item 2), O1 missed (item 3), not "read and lost" (item 4). A session cut before its `init` event, or never started because the runner stopped the call, is not counted here: it falls under the model check above (nothing is judged, the owner decides). `meta.json` must record a commit whose diff to the registered commit over `skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures` is empty, and `dirty: false`.
- **Read per session**, from its `check.json` as the scorer writes it: `Rfile` (the stack file opened), the deadline hazard (N3 on `node-01`, Y2 on `py-01`), O1, O2, and the loaded-sign of gate 2 (`Rskill` stays in the check file but is not read under `command`); and from its stream, by `stack-rule-timing.cjs` run on stage 1's two result folders only, whether the shared client (`src/client.cjs`, `stock/client.py`) was edited. A session is **"read and lost"** when `Rfile` is true, the deadline hazard is missed, and the shared client was not edited: the sessions the line could turn. A session that edited the shared client and still missed the deadline is not one of them.
- **The gate to stage 2, fixed now; all four must hold, pooled over the sixteen**:
  1. every `init` names `claude-sonnet-5-5`;
  2. bk-build's text was loaded in at least 14 of 16 sessions. `Rskill` cannot show this under `command`: a slash command leaves no `Skill` call (docs/specs/2026-10-01-stack-shell-design.md:238). The sign is fixed from the uncounted session's stream before stage 1 and put to the owner with the approval; it is counted per session in its place;
  3. O1 in at least 14 of 16 (the task is doable in this variant);
  4. "read and lost" in at least 5 of 16 (a rise of 0.30, the size Step 0 saw pooled, 9 of 16 against 4 of 16, needs at least five sessions the line could turn; it cannot turn a session that did not read the file). This also bounds the deadline hazard at 11 passes of 16, so no separate item asks for room.
- **What follows each outcome, fixed now.** If item 1 fails, or a counted session has no `init` event, nothing else is judged, none of the outcomes below applies, and the owner decides. Where item 1 holds: all four hold: the result is written up and stage 2 is put to the owner; it does not start by rule. Any one of items 2 to 4 fails: **P5c closes.** The line stays on `p4-step0-scope`, nothing merges, no stage 2 runs, and the only thing said of the line is "not compared on `claude-sonnet-5-5`", with the figures of the four items and the count of deadline passes. A close is not a finding that the line does nothing; opening another registration for it later is the owner's. Never by rule: changing a threshold above after the data.
- **Not part of any later test.** Stage 1's sessions are a calibration; they are never pooled into stage 2's branches.
- **Reported with no bar**: per task every hazard, O1, O2; skills launched; whether the shared client was edited and any sentence calling the deadline pre-existing or out of scope (the columns of `stack-rule-timing.cjs`, which today exists only on `p4-step0-scope` and would be brought to `main` unchanged in the build step); cost and duration per session.
- **Budget, not measured**: 17 sessions. The only figures at hand are for the plain-words variant on this model (2026-10-07: 40 to 69 seconds and 0.17 to 0.31 USD a session across `node-01` and `build-01` together).

## Planned registration, stage 2: the comparison (fixed now so that stage 1's data cannot shape it; it runs only after stage 1's gate holds and the owner's word)

- **Texts**: **K-before** is `main` at the commit of stage 1, pinned as a local branch `p5c-shared-code-before`. **K-after** is a branch `p5c-shared-code` cut from that same commit, with **exactly one line added**: the bullet quoted above, under "Gates" of `skills/bk-build/SKILL.md`, after the bullet that begins "No abstraction, option, or error handling". `git diff --name-only p5c-shared-code-before p5c-shared-code -- skills hooks agents scripts NOTICE upstream` must print that one file, and the driver checks it before the first session. The text is frozen at that commit before any session. Stage 2's branches are cut only after stage 1's gate holds and the second word.
- **Tasks, variant, model, `init` check**: as stage 1 (`node-01`, `py-01`, `command`, `--model claude-sonnet-5-5`, one uncounted session first, every counted `init` read before the tally; the loaded-sign is the one the owner approved for stage 1). A counted session of either branch naming another model, or whose stream holds no `init` event (cut before it), or that was never started because the runner stopped a call, counts as naming another model: the run is not judged, its figures are reported and the owner is told. No session is re-run; a session the runner cut after its `init` event, or that did not complete after its `init` event, is named and counted against the kit: for K-after as missing the deadline hazard, O1 and O2 and as not loaded; for K-before as passing the deadline hazard, O1 and O2.
- **Sessions: 24 per task for each of K-before and K-after (48 against 48 pooled); no S branch (see "Not compared with the sources" below).** Why 48: the exact power of the registered test for a rise of 0.30 is 0.799 or more at 48 a side for every baseline stage 1's gate can let through (0 to 11 of 16; the lowest is 0.7993, at 6 of 16, which the table rounds to 0.80), and at most 0.72 at 32 a side for baselines from 2 to 9 of 16 (`node evals/analysis/fisher-power.cjs`, which prints the table below and checks itself against Step 0's two registered p-values):

  | K-before passes of 16 | Rate before | Rate after (+0.30) | n = 16 | n = 24 | n = 32 | n = 48 |
  |---|---|---|---|---|---|---|
  | 0 | 0.000 | 0.300 | 0.55 | 0.89 | 0.95 | 1.00 |
  | 1 | 0.063 | 0.362 | 0.42 | 0.67 | 0.80 | 0.95 |
  | 2 | 0.125 | 0.425 | 0.33 | 0.56 | 0.72 | 0.89 |
  | 3 | 0.188 | 0.487 | 0.29 | 0.50 | 0.65 | 0.84 |
  | 4 | 0.250 | 0.550 | 0.27 | 0.48 | 0.62 | 0.81 |
  | 5 | 0.313 | 0.613 | 0.27 | 0.47 | 0.62 | 0.80 |
  | 6 | 0.375 | 0.675 | 0.27 | 0.47 | 0.62 | 0.80 |
  | 7 | 0.438 | 0.738 | 0.27 | 0.47 | 0.62 | 0.81 |
  | 8 | 0.500 | 0.800 | 0.28 | 0.49 | 0.64 | 0.83 |
  | 9 | 0.563 | 0.863 | 0.32 | 0.55 | 0.70 | 0.88 |
  | 10 | 0.625 | 0.925 | 0.40 | 0.65 | 0.78 | 0.94 |
  | 11 | 0.688 | 0.988 | 0.52 | 0.83 | 0.91 | 0.99 |

  Step 0's sixteen a side had a power of about 0.3 for the effect it saw. **The rise of 0.30 is an assumption**, taken from Step 0's pooled figures (a difference that did not reach its threshold, on another model, another variant and another base text), not a fact about this model. For a rise of 0.20 the same 48 a side give a power of about 0.43 at a baseline of 0.5: a smaller true effect would most likely be missed, and a miss would then not show the line does nothing. The 0.30 is also likely to flatter the line: it is the size of a difference picked out because it looked large.
- **How it is run**: every branch from the main checkout with `git switch` between calls on a clean tree (the measurement profile reads `skills/` only there; Step 0's correction of 2026-09-30). Per task, twelve rounds; in each, one call of K-before and one of K-after, `--runs 2`, their order alternating by round. `node-01` first, then `py-01`. A driver `evals/analysis/p5c-run.cjs`, on the pattern of `evals/analysis/step0-run.cjs` and `plan-run.cjs`, checks before each call the clean tree and the empty kit diff against the call's branch, and after it that `meta.json` names the branch and commit with `dirty: false`; it stops at the first failure. **It is written with `BARS_APPROVED = false` and refuses to start a session until the owner's word for stage 2 is recorded in this file** (a sentence that names stage 2 of P5c; a general sentence such as "tiếp tục theo khuyến nghị" is not that word, and the same holds for stage 1; nor does change 1 of the autopilot rules stand in for it when the switch says `RUN`, since bars here are of a new kind); it also refuses to start unless the `init` of stage 2's own uncounted session, run before any counted session of stage 2, names the registered model (stage 1's uncounted session does not satisfy this).
- **Not compared with the sources: a departure from the owner's rule of 2026-09-24, which the owner decides (see the points below).** That rule says a sprint that changes a skill runs its probe on both sides, and that until the comparison exists the only wording is 'not compared'. This plan runs K only. Under `command` the tasks define no S prompt (`commands` defines K only), so an S branch would run the plain prompt, not the same one. So no S session runs; whatever the result, the only thing said about the sources is 'not compared'. Step 0's K-new 9/16 against S 0/16 is not carried over (another model, another variant).
- **Primary**: sessions passing the deadline hazard (N3, Y2), pooled over both tasks, **every counted session of each branch, none left out for not loading the skill or the file**, K-after against K-before, Fisher's exact test, two-sided.
- **Bars; the line may be proposed for a merge only if all hold**:
  1. the primary: K-after above K-before with p ≤ 0.05;
  2. on each task, O1 and O2 of K-after each in at least 21 of 24, and neither below K-before's;
  3. reach: the sign named in stage 1, in at least 21 of 24 K-after sessions on each task;
  4. the guard below, run only after bars 1 to 3 hold.
- **The guard, chosen to reach the changed text** (the owner's second lesson): **`build-01`**, plain prompt, eight K-after sessions, `--model claude-sonnet-5-5`: its bars as last registered (`docs/specs/2026-10-03-bk-plan-design.md`, "Step 6, registered": O1 8 of 8; O2, O3 and P3 each at least 7 of 8), **and `bk-build` launched in at least 7 of 8**, read from the stream's Skill events (the results.md "Invoked" column), as on 2026-10-07, so that the guard's sessions load the changed file (on this model, 2026-10-07: 8 of 8). And **`node-01`**, plain prompt, eight K-after sessions: O1 and O2 each at least 7 of 8, the median of N not below 2. Said beforehand: the plain `node-01` sessions loaded `bk-build` in 1 of 8 on this model, so that half shows only that nothing else broke; the half that reaches the text is `build-01`. A guard session cut after its `init` event counts as missing every one of its bars. The `init` event of every guard session is read before its bars are. A guard session naming another model, or with no `init` event (cut before it, or never started): the guard is not judged and the owner is told.
- **Decisions fixed before the data** (the lines of `docs/specs/2026-10-06-autopilot-design.md`, carried here as that file asks):
  - Bars 1 to 3 hold, and no counted session failed the model check: the guard runs. The guard holds: the merge of the one line into `main` is **the owner's** (change 4 is not confirmed), after the gate's heavy-step review, the advisor and the audit the rules ask for. The daily install is not updated by a session.
  - A bar is missed, and no counted session failed the model check: no second freeze is planned for this text. The line was written before Step 0 and is measured as written; re-wording it after seeing which sessions failed is not a general-rule edit. The measurement closes, the line stays on its branch unmerged. If bar 1 is missed: "not shown at a rise of 0.30 with 48 sessions a side, on these two tasks entered through `bk-build`, on `claude-sonnet-5-5`"; not that the line does nothing. If bar 1 holds and bar 2, 3 or 4 is missed: the figures of every bar are said, with 'the line passed the primary and missed bar N', and never 'not shown'.
  - At most this one run of this text on these tasks. Never by rule: changing a bar, a number, the tasks, the fixtures, the scorers, the model or the analysis after the data.
  - An incident the registration has no rule for: if every bar's verdict is the same under every candidate handling, the least favourable to the kit is taken and all are logged; otherwise the session stops and the owner decides.
- **What may be said after a pass, and no wider**: the line met its bars on `node-01` and `py-01`, entered through `/bearingkit:bk-build`, on `claude-sonnet-5-5`; against the sources: not compared. Not: anything about the plain-words path; anything about "Sonnet" in general; that it replicates Step 0 (another model, another variant, another base text).
- **Reported with no bar**: per task the deadline hazard (Fisher's test per task, descriptive), every other hazard, N or Y; `Rfile`; "read and lost" per branch; the shared client edited; scope sentences; skills launched; cost median and spread; tokens only where tool counts match.
- **Budget, not measured**: 96 K sessions, 16 guard, one uncounted: 113. The weekly limit read 15% with `get_usage` at the start of session 5 (the session's own reading; it cannot be recomputed from the repository); no measurement starts above 80% of the five-hour window.

## Limits, said now

Two small fixtures with one planted deadline each. The `command` variant measures the line where it is read, not how often sessions get there. The figures of 2026-10-07 that shaped this design were seen before it was written; that is why they decide nothing here and stage 1 measures the precondition afresh. Stage 1's thresholds are judgments (what "reaches", "doable" and "could turn" mean in sixteen sessions), fixed before its data, not derived from a prior result on this variant: there is none. **The gate is noisy at sixteen sessions.** If the true share of "read and lost" sessions is exactly the threshold (5 of 16), item 4 holds with a probability of 0.59, so P5c would close by rule about four times in ten; at a true share of 0.2 it holds with 0.20, at 0.4 with 0.83, at 0.5 with 0.96 (binomial, sixteen sessions). Entering through `bk-build` also runs its step 1, which opens the stack files, so the deadline may pass often in this variant and a close at stage 1 is a likely outcome. Items 2 and 3 can also close P5c for a reason of the host or the harness and not of the line. **The count of client edits is mechanical and imperfect**: the script counts an Edit, Write or MultiEdit call on a path ending in `client.cjs` or `client.py`, so it misses an edit made through a shell command and would count a file such as `tests/test_client.py`; it is taken as the script gives it, and not corrected by eye after the data.

## Outside P5c: a lead for a later proposal

On `claude-sonnet-5-5` the plain-words path on `node-01` goes through `bk-spec`, opened the stack file in 4 of 8 sessions, and the deadline hazard followed that reading (point 4 above). `bk-spec` already says to read each file under `stackFiles`. Whether a firmer step there (as step 1 of `bk-build` did for `bk-build`: 6 of 8 against 1 of 8) raises that reach is a separate change to a second skill, with its own design and measurement. It is not part of P5c; it is put to the owner as a direction of its own in `docs/specs/2026-10-08-bk-spec-stack-reach-proposal.md`.

## What the owner is asked

1. **Approve stage 1's registration as written** (17 sessions, no kit text changed), or change it. On an approval that names stage 1, a later step records the commit of `main`, brings `stack-rule-timing.cjs` to `main`, runs the one uncounted session, and puts the loaded-sign it finds to the owner; the sixteen counted sessions run only after the owner has approved that sign.
2. **Stage 2's registration**: approve it now as the fixed plan (its run still waits for stage 1's gate and a second word), or hold it.
3. Or close P5c without a session.

With either approval the owner is also deciding these points, each a choice and none taken by a session:

- **Bars of a new kind**, which no owner-approved registration has had: stage 1's gate, which closes P5c by rule when one of its items 2 to 4 fails (a failed item 1 closes nothing; the owner decides); the reach bar of stage 2 (bar 3) and the loaded-sign it rests on; "`bk-build` launched in at least 7 of 8" in the `build-01` guard. The other bars repeat Step 0's and the guard bars of `plan-01`'s "Step 6, registered".
- **The model.** The "Luật" block of `docs/handoff/2026-09-26-p3b-node-guard.md` says measured sessions run on Sonnet 5; this plan names `claude-sonnet-5-5`, the model the alias gives today, on the owner's lesson of naming the model in full.
- **No second freeze.** The autopilot rules allow one second freeze after a missed bar; this plan gives that up for this line.
- **No comparison with the sources**, a departure from the rule of 2026-09-24 that a sprint changing a skill runs its probe on both sides: the result will carry "not compared".
- **The size of effect assumed**, 0.30, and with it 48 sessions a side.

Khuyến nghị: approve stage 1 as written; hold the approval of stage 2 until stage 1's figures are in. Its text stays as fixed here either way, so holding the approval changes nothing in what would be run.

## Revision after the audit (2026-10-08)

The first version of this file (`86de01c`) was read the same day by an auditor of another model than the main session's, on the owner's request (the request and the audit's findings are recorded in `docs/autopilot/decisions.md`, entry 21). On its findings, and before any approval, this version changes the plan in these places: the gate of stage 1 has four items instead of five (the item on room was implied by the item on "read and lost"); "read and lost" now also requires that the shared client was not edited; the noise of the gate at sixteen sessions is stated; the S branch and the comparison with the sources are dropped, and the result will say "not compared" (stage 2 falls from 129 to 113 sessions); what may be said after a miss is fixed; guard sessions have an `init` rule; the recommendation on stage 2 is to hold its approval; the 0.30 is called likely to flatter the line; a close of stage 1 is said not to show that the line does nothing; the stage-2 driver's word is said not to be replaced by change 1 of the autopilot rules; the client-edit script is run on stage 1's two result folders only; the limits add that a close at stage 1 is a likely outcome and that items 2 and 3 can close P5c for a reason of the host or the harness; 'did not complete' now reads 'after its `init` event'; the lead outside P5c points to `docs/specs/2026-10-08-bk-spec-stack-reach-proposal.md`. After the review of this revision: the outcomes of stage 1 and of a missed bar say what happens when the model check fails as well; the sentence on the sources names the departure from the owner's rule; 'any branch' reads 'either branch'; the limits of the client-edit count are stated. No threshold, and no consequence for a missed bar, loosened except the guard's: a guard session cut before its `init` event, or never started, now makes the guard not judged, where the first version counted it as missing every bar.

## Stage 1 registered (2026-10-08): the owner's approval, the commit, and what was added before any session

**The owner's word.** After the report on the revised proposal, the owner sent the general sentence "Audit kỹ các xử lý ở trên, tiếp tục theo khuyến nghị." The session did not take it as an approval (this file says a general sentence is not one) and put four questions with labelled options. To "Giai đoạn 1 của P5c (17 phiên trên claude-sonnet-5-5, không đổi chữ kit): anh duyệt bản đăng ký đã sửa không?" the owner chose **"Duyệt giai đoạn 1 (Recommended)"**, described in the question as: "Phiên ghi lời duyệt thành bản đăng ký chính thức (qua cổng, có reviewer đối kháng), đưa script đếm về main, chạy ĐÚNG MỘT phiên không đếm để đọc model và dấu hiệu nạp bk-build, rồi dừng trình anh. 16 phiên đếm chỉ chạy sau khi anh duyệt dấu hiệu đó. Duyệt cũng là nhận năm điểm ghi cuối spec (ngưỡng loại mới, model 5-5, không đóng băng lần hai, không so với nguồn, cỡ hiệu ứng 0,30). Giai đoạn 2 chưa được duyệt." So stage 1 is approved by name, with the five points; stage 2 is not approved; the switch stays `PAUSE` and this runs on the owner's word in this session, not under autopilot. The other three answers are in `docs/autopilot/decisions.md`, entry 22.

**The registered commit: `3faebb4`.** That is `main` when the approval was given. Stage 1 runs the kit as that commit has it: before each call `git diff 3faebb4 -- skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures` prints nothing and the tree is clean. The commit that records this section, and the later ones that record results, change none of those paths.

**The registration is "Planned registration, stage 1" above, unchanged in its gate, its thresholds, its tasks, its model and its reading.** Added here, before any session; each addition only adds a stop or pins an instrument, none loosens anything:

1. **The uncounted session, completed.** If the uncounted session is cut, does not complete, or its stream holds no `init` event, stage 1 does not start and the owner is told (the plan above gave this only for another model's name and for no usable sign).
2. **A dry run first.** The uncounted session's command is first run with `--dry-run`; it must print exactly one session, `cK1`.
3. **The client-edit instrument, pinned.** `evals/analysis/stack-rule-timing.cjs` is brought to `main` unchanged with this section: its git blob is `955c3cdb`, the same as `origin/p4-step0-scope:evals/analysis/stack-rule-timing.cjs`. It names a row by the folder's name without its date, so two folders of different days could give the same row name. So it is not run on `evals/results/` for the gate: after the sixteen counted sessions, the two counted folders are copied, whole and unchanged, into a new empty directory `evals/results/p5c-stage1/` (gitignored, as all of `evals/results/`), and the script is run as `node evals/analysis/stack-rule-timing.cjs evals/results/p5c-stage1`. Its column `client` is the count this file calls "the shared client was edited". The script lists only sessions whose `Rfile` is true, which is all the definition of "read and lost" needs.
4. **Folders named before they are read.** The uncounted session's folder, and later the two counted folders, are written into this file by name before any figure is taken from them.
5. **The order.** One uncounted session now. Then the session stops and puts to the owner what the stream shows: the model its `init` names, the host version, and how the load of `bk-build` through the slash command shows. **No counted session runs until the owner has approved the loaded-sign by a sentence or a label that names it.**
6. The uncounted session is run once; if the call stops before it starts or it fails for any reason, it is not re-run without the owner's word.
7. **What the report on the sign contains**, so that the owner can judge it: the exact stream event, with index and a verbatim excerpt; a predicate written as a mechanical test before it is applied; a negative control, by running that predicate on `evals/results/2026-10-07-bench-node-01-natural` (bk-build loaded in 1 of 8, per the Step 6 guard cited above): it must not fire on the 7 sessions where bk-build was not loaded (K2 to K8); on the 1 where it was loaded by a `Skill` call (K1) the result depends on what the sign is: a sign specific to slash-command entry must not fire there either, and a sign that shows any load of the skill must fire there; the report says which of the two the sign is, and if it is the first kind and so cannot be tested against a loaded session, the report says so and the owner judges the sign under addition 5; all at zero session cost; the other candidate signs seen and why each was rejected; whether the sign is host-fixed and therefore trivial; why a `node-01`-derived sign applies to `py-01`; the uncounted session's N3, O1 and `Rfile`, stated as playing no role.
8. **The copy and the tally, named.** The directory of addition 3 holds exactly the two counted folders, with file counts and a hash equal to the originals. "Read and lost" is the rows with `DL` = '.' and `client` = '.'; the script prints no such count, so the tally is made by hand from its rows and the rows are pasted with it. Under `command` its `read` column prints `no-build` and its `build` column prints '.', because there is no `Skill` call, and they carry no meaning.
9. **After the call** the Windows System log is read for a sleep event (Kernel-Power 42 or 107) inside it, as the autopilot rules ask for long runs; a counted session whose run contains such an event is treated as a session that did not complete after its `init` event, or, if it has no `init` event, as the plan says for that case; sessions of the call that ended before the event are not affected. For the uncounted session, such an event falls under addition 1.

**A limit, said now.** The measurement profile `_build/profile/claude` is untracked and outside the registered diff; its settings can change how a session behaves, and nothing here pins it. The host version is read from `init` and reported, not pinned.

**The uncounted session's command**, from the main checkout on a clean tree, `get_usage` read first (no measurement starts above 80% of the five-hour window), the turn kept alive while it runs:

`node bin/bearingkit.cjs bench --task node-01 --config-dir C:/Projects/Bearingkit/_build/profile/claude --branches K --variants command --model claude-sonnet-5-5 --runs 1`

## The uncounted session (2026-10-08): the model, the host, and the loaded-sign put to the owner; no counted session has run

**The folder**, named before anything is taken from it: `evals/results/2026-10-08-bench-node-01-command-claude-sonnet-5-5` (gitignored, owner's machine), one session, `01-command-K1`.

**How it ran.** After the commit of the registration (`1b4ae40`, pushed), from the main checkout: tree clean; `git diff 3faebb4 -- skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures` empty; `get_usage` 38% of the five-hour window; the dry run printed "1 sessions: cK1"; then the registered command, once, 04:18:55Z to 04:20:39Z, the turn kept alive. The runner reported the session complete in 58 seconds, not cut; `meta.json` records `main` at `1b4ae40` (whose diff to `3faebb4` over the registered paths is empty), `dirty: false`, model `claude-sonnet-5-5`. The Windows System log holds no Kernel-Power 42 or 107 event inside the call (the same query over the last seven days finds 18, so it can see them).

**The model and the host.** The stream has one `init` event: `"model":"claude-sonnet-5-5"`, host `2.1.291` (Step 0 ran on host `2.1.281`). So the uncounted session names the registered model.

**What the bench stream shows of the load: nothing usable.** It holds no `Skill` call (0), no event carrying the prompt, and no command tag. The string `bk-build` appears in four events only: the session-start hook's output (the protocol's own text), the `init` event's lists of slash commands and skills (present in every session whatever it does), the output of `detect-stack` (a path under `skills/bk-build/references/stacks/`), and the session's own `cat` of `node.md`. None of them says the skill's text was delivered. This is what `docs/specs/2026-10-01-stack-shell-design.md` line 238 found for an earlier host.

**The sign found: the host's own transcript of the session.** The host writes each session's transcript into the measurement profile, here `_build/profile/claude/projects/C--Projects--bearingkit-evals-bench-node-01/7c174c2a-1b76-460c-8e70-cd578537203e.jsonl` (the file is named by the `session_id` of the stream's `init` event). Its events 4 and 5 (counted from 0 over all lines of the file):

- event 4, type `user`: `<command-message>bearingkit:bk-build</command-message>\n<command-name>/bearingkit:bk-build</command-name>\n<command-args>Add an export command to our stock CLI: …`
- event 5, type `user`, `isMeta: true`, one text of 4,037 characters that begins: `Base directory for this skill: C:\Projects\Bearingkit\skills\bk-build\n\n# bk-build\n\n## Read first\n- The stack profile (run \`detect-stack\` as bk-protocol's host n…` and holds the whole of `SKILL.md` (it contains "Stack rules before anything else" and "Scout the touchpoints").

**The predicate, written as a mechanical test before it was applied to any control**: `evals/analysis/skill-loaded.cjs` (new with this section; `tests/skill-loaded.test.cjs`, four tests). For each session of a results folder it takes the `session_id` from the stream's `init` event, finds `<profile>/projects/*/<session_id>.jsonl`, and says **loaded** when that transcript holds a `user` event with `isMeta` true whose text starts with "Base directory for this skill:", whose directory ends in `skills/bk-build`, and which contains "# bk-build". A transcript not found, or a stream with no `init` event, is printed "unknown" and is never counted as loaded. An optional `--marker` also requires a given string in that text.

**Controls, at no session cost** (`node evals/analysis/skill-loaded.cjs <folder>`):

| Folder | What is known of it | The predicate |
|---|---|---|
| the uncounted session | entered by `/bearingkit:bk-build` | loaded 1 of 1 |
| `2026-10-07-bench-node-01-natural` (the negative control the registration names) | `bk-build` loaded by a `Skill` call in K1 only (`Rskill` 1 of 8) | loaded 1 of 8: K1 yes, K2 to K8 no; unknown 0 |
| the same folder, `--skill bk-spec` | `bk-spec` launched in 8 of 8 | loaded 8 of 8 |
| `2026-10-07-bench-build-01-natural` | `bk-build` launched in 8 of 8 | loaded 8 of 8 |
| the uncounted session, `--marker "Stack rules before anything else"` | a line of `main`'s `bk-build` | 1 of 1 |
| the uncounted session, `--marker "is part of the plan even where the plan is silent"` | the Step 0 line, which `main` does not have | 0 of 1 |

All sixteen sessions of 2026-10-07 name host `2.1.291`, the host of the uncounted session.

**Which kind of sign it is** (addition 7 asks): one that shows **any load of the skill**, by slash command or by `Skill` call alike, since the host records both the same way. So on the control it must fire on K1 and not on K2 to K8, and it does. It is **not host-fixed**: it is absent in seven sessions of one folder and present in eight of another.

**Other candidates seen, and why each is rejected**: the `init` event's `slash_commands` and `skills` lists (present in every session: a gate item counted on them would hold by construction); the token count of the first turn (it would need a threshold nobody registered, and it moves with the host); the session's behaviour, here `detect-stack` run first and `node.md` opened before the first edit (that is what the skill asks, not evidence that its text arrived, and `bk-spec` asks for the same reading).

**Why a sign found on `node-01` applies to `py-01`**: it is a property of the host and of the skill, not of the task: the directory and the heading it looks for are the skill's, and it reads the same on `build-01`, another fixture. It has not been seen on a `py-01` session; if it failed there, the sessions would read "no" or "unknown" and count against the gate, never for it.

**A dependency this adds, said now.** The transcripts are in the measurement profile, which is untracked. If the profile were cleared between the sessions and the reading, every session would read "unknown" and item 2 would fail. So the predicate is run on each counted folder right after its call, and its output is pasted into this file with the folder's name.

**The uncounted session's own figures play no role and are not counted anywhere**: N3 passed, O1 and O2 passed, `Rfile` true, `Rskill` false (as expected with no `Skill` call); 0.211 USD.

**Three things the owner should have in view before approving.**

1. **By the letter, the registration's stop applies.** The plan says: "If the stream shows no usable sign, stage 1 does not start and the owner is told." The stream showed none. This sign is read from the host's transcript, not from the bench stream the registration named; approving it also widens that wording. So the choice is the owner's between this sign and stopping stage 1 here; the session does not treat the transcript as "the stream".
2. **The sign depends on the host version.** On host `2.1.291` every control reads as above. On the host of Step 0, `2.1.281`, the adversarial reviewer of this record found the opposite for slash-command sessions, and the main session checked it: in `evals/results/2026-09-24-bench-review-01-command` the three K sessions, entered by `/bearingkit:bk-review` on host `2.1.281`, read "no" for `bk-review` (0 of 3; the folder's three S sessions are not expected to load it), and K1's transcript holds the raw `/bearingkit:bk-review …` text and no skill message. If the host changed between two calls of stage 1, the sessions of the later call could all read "no", item 2 would fail, and P5c would close by rule for a reason of the instrument. The registration only reports the host version. **Proposed with the sign, as one more stop:** every counted session's `init` must name host `2.1.291`; a counted session naming another host is handled as one naming another model (nothing is judged, the owner decides). This stop turns a close by rule into the owner's decision whenever any one counted session names another host, whatever items 2 to 4 show. It is proposed after the uncounted session. It adds no threshold, and an outcome that would pass also goes to the owner. Approving this stop replaces 'reported, with no bar' in line 44.
3. **What the sign shows and what it does not.** It shows that the host delivered the skill's text into the session's context. It does not show that the model read it or followed it; nothing in this registration measures that directly.

**What the owner is asked now.** Approve this as the loaded-sign of gate item 2, as worded here, with the host stop of point 2: *"`bk-build`'s text was loaded" means `node evals/analysis/skill-loaded.cjs <the counted folder>` prints `loaded` = yes for the session; "unknown" counts as not loaded; item 2 asks for at least 14 of the 16.* The same sign, with `--marker` set to the Step 0 line, would be stage 2's reach bar; that is not asked now, since stage 2 is not approved. A session with no `init` falls under the model check (lines 44, 52). A session cut or not completed after its `init`, or hit by a sleep event, counts as not loaded whatever the predicate prints (line 45, addition 9). The owner may instead stop stage 1 here, which is what the registration's letter provides. **Until the owner approves the sign by a sentence or a label that names it, no counted session runs.**

## The loaded-sign approved, with the host stop (2026-10-08), before any counted session

**The owner's word**, by label, to the question "Dấu hiệu "đã nạp bk-build" cho mục 2 của cổng giai đoạn 1 (P5c): đọc từ bản ghi phiên của chính host bằng skill-loaded.cjs. Anh quyết thế nào?": **"Duyệt dấu hiệu, kèm điểm dừng host (Recommended)"**, described in the question as: "Dấu hiệu: bản ghi phiên của host có tin nhắn isMeta mang nguyên chữ bk-build; "unknown" tính là chưa nạp; cần ít nhất 14/16. Kèm điểm dừng: phiên đếm nào ghi host khác 2.1.291 thì không xét gì, anh quyết (điểm dừng này biến một lần đóng theo luật thành quyết định của anh, bất kể các mục khác ra sao). Duyệt cũng là nới câu chữ của đăng ký: theo đúng chữ thì stream không có dấu hiệu là giai đoạn 1 không bắt đầu; dấu hiệu này lấy từ bản ghi của host, không từ stream. Nó cho thấy chữ skill đã vào ngữ cảnh, không cho thấy model đã đọc hay làm theo." And to "Nếu anh duyệt dấu hiệu: 16 phiên đếm của giai đoạn 1 (node-01 rồi py-01, 8 phiên mỗi task, khoảng 1 phút và 0,2 USD mỗi phiên theo phiên không đếm) chạy khi nào?": **"Ngay trong phiên này (Recommended)"**.

**So, in force from here for stage 1**, as the section "The uncounted session" words them:

1. Gate item 2 is counted by `node evals/analysis/skill-loaded.cjs <the counted folder>`: a session is loaded when its row reads `loaded` = yes; "unknown" counts as not loaded; at least 14 of the 16. A session with no `init` falls under the model check; a session cut or not completed after its `init`, or hit by a sleep event, counts as not loaded whatever the predicate prints.
2. The host stop: every counted session's `init` must name host `2.1.291`; a counted session naming another host is handled as one naming another model (nothing is judged, the owner decides). This replaces "reported, with no bar" for the host version in the plan's model bullet.
3. The plan's sentence "If the stream shows no usable sign, stage 1 does not start" is widened by the owner's word to the sign read from the host's transcript.
4. Between the two calls nothing is written to a tracked file: the first folder's name is given in the session's reply, the predicate's output is kept from the terminal, and both are written into this file after the py-01 call and before any tally. (Otherwise the second call would run on a tree that is not clean and its `meta.json` would not record `dirty: false`.) This fixes the moment that line 185 and addition 4 of 'Stage 1 registered' leave open: the folders' names are already in this file by point 6, and the predicate is run right after each call but pasted only after the py-01 call.
5. A call ended by the harness is treated as one stopped by the runner: sessions without a stream are never started, and the owner decides.
6. The folders, by the runner's naming rule, if both calls run on 2026-10-08 (UTC; the date is part of the name): the two counted folders are `2026-10-08-bench-node-01-command-claude-sonnet-5-5-2` and `2026-10-08-bench-py-01-command-claude-sonnet-5-5`; the unsuffixed `node-01` folder is the uncounted session's and is not copied or counted; a call made on a later UTC date gets that date in its name.

Points 4 to 6 were added on the adversarial reviewer's reading of this section, before any counted session; 4 and 5 are its own words. Nothing else of the registration changes: the gate's other items, its thresholds, the tasks, the model, the commands, the order, the checks before and after each call, and what follows each outcome are as registered. Stage 2 is not approved. **What runs now**: the two counted calls, `node-01` then `py-01`, eight sessions each, and nothing more; then the result is recorded and put to the owner.

## Stage 1 result (2026-10-08): items 1 to 3 hold, item 4 does not; by the registered rule P5c closes; the line is not compared

**The two counted folders**, named in the section above before any session (gitignored, owner's machine): `evals/results/2026-10-08-bench-node-01-command-claude-sonnet-5-5-2` and `evals/results/2026-10-08-bench-py-01-command-claude-sonnet-5-5`. Eight sessions each, sixteen counted. Nothing was written to a tracked file between the two calls.

**How it ran.** After the commit of the approval (`8ee3af6`, pushed), from the main checkout. Before each call: tree clean, `git diff 3faebb4 -- skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures` empty, `get_usage` 49% and then 54% of the five-hour window. The registered commands, each once: `node-01` 04:50:55Z to 05:03:06Z, `py-01` 05:03:24Z to 05:17:03Z, both exit 0, never two at once, the turn kept alive. Both `meta.json` record `main` at `8ee3af6` (whose diff to `3faebb4` over the registered paths is empty), `dirty: false`, model `claude-sonnet-5-5`, nothing cut. No session was re-run. The Windows System log holds no Kernel-Power 42 or 107 event inside either call (the same query over seven days finds 18).

**Every session's `init`**: one `init` event in each of the sixteen streams, each naming model `claude-sonnet-5-5` and host `2.1.291`. So item 1 holds and the host stop is not met.

**The loaded-sign**, run on each folder right after its call (`node evals/analysis/skill-loaded.cjs <folder>`):

```
2026-10-08-bench-node-01-command-claude-sonnet-5-5-2
session              model                 host      loaded
01-command-K1        claude-sonnet-5-5     2.1.291   yes
02-command-K2        claude-sonnet-5-5     2.1.291   yes
03-command-K3        claude-sonnet-5-5     2.1.291   yes
04-command-K4        claude-sonnet-5-5     2.1.291   yes
05-command-K5        claude-sonnet-5-5     2.1.291   yes
06-command-K6        claude-sonnet-5-5     2.1.291   yes
07-command-K7        claude-sonnet-5-5     2.1.291   yes
08-command-K8        claude-sonnet-5-5     2.1.291   yes
bk-build: loaded in 8 of 8; unknown 0

2026-10-08-bench-py-01-command-claude-sonnet-5-5
01-command-K1 to 08-command-K8: claude-sonnet-5-5, 2.1.291, loaded yes, each
bk-build: loaded in 8 of 8; unknown 0
```

(The transcript file names the script prints are left out here; the `py-01` rows are given in one line, each of the eight reads as the `node-01` rows do.)

**From each session's `check.json`**:

| Task | Deadline hazard | O1 | O2 | `Rfile` |
|---|---|---|---|---|
| `node-01` | N3 7 of 8 (K4 missed) | 8 of 8 | 8 of 8 | 8 of 8 |
| `py-01` | Y2 8 of 8 | 8 of 8 | 8 of 8 | 8 of 8 |

**The copy and the client-edit script.** The two counted folders were copied into a new empty `evals/results/p5c-stage1/`: 26 files each, 26 in each copy, every file's SHA-256 equal to its original's. `node evals/analysis/stack-rule-timing.cjs evals/results/p5c-stage1` lists all sixteen sessions (each opened its stack file). Its rows, the columns that count here (`client` = the shared client edited, `DL` = the deadline hazard passed; `y` yes, `.` no):

```
session                              client  DL
node-01-command-claude-sonnet-5-5-2 K1  y    y
node-01-command-claude-sonnet-5-5-2 K2  y    y
node-01-command-claude-sonnet-5-5-2 K3  y    y
node-01-command-claude-sonnet-5-5-2 K4  .    .
node-01-command-claude-sonnet-5-5-2 K5  y    y
node-01-command-claude-sonnet-5-5-2 K6  y    y
node-01-command-claude-sonnet-5-5-2 K7  y    y
node-01-command-claude-sonnet-5-5-2 K8  y    y
py-01-command-claude-sonnet-5-5 K1      .    y
py-01-command-claude-sonnet-5-5 K2      .    y
py-01-command-claude-sonnet-5-5 K3      .    y
py-01-command-claude-sonnet-5-5 K4      y    y
py-01-command-claude-sonnet-5-5 K5      .    y
py-01-command-claude-sonnet-5-5 K6      .    y
py-01-command-claude-sonnet-5-5 K7      .    y
py-01-command-claude-sonnet-5-5 K8      .    y
```

The tally, by hand from these rows as the registration says: "read and lost" is `DL` = '.' and `client` = '.': **one session, `node-01` K4.**

**The gate.**

| Item | Registered | Figure | |
|---|---|---|---|
| 1 | every `init` names `claude-sonnet-5-5` (and, by the host stop, host `2.1.291`) | 16 of 16 | holds |
| 2 | `bk-build`'s text loaded in at least 14 of 16 | 16 of 16, unknown 0 | holds |
| 3 | O1 in at least 14 of 16 | 16 of 16 | holds |
| 4 | "read and lost" in at least 5 of 16 | **1 of 16** | **does not hold** |

Deadline passes: 15 of 16.

**What follows, as registered before the data**: "Any one of items 2 to 4 fails: **P5c closes.** The line stays on `p4-step0-scope`, nothing merges, no stage 2 runs, and the only thing said of the line is "not compared on `claude-sonnet-5-5`"". So: **P5c is closed.** The Step 0 line is not merged and not compared; stage 2 does not run; no branch was cut. A close is not a finding that the line does nothing. The count of deadline passes under `command` was 15 of 16, on these two tasks. This session's own reading, not a registered conclusion: with so few misses, a rise of 0.30 looks out of reach on these fixtures. Opening another registration for the line later is the owner's.

**Reported with no bar.**
- The one "read and lost" session, `node-01` K4, wrote in its answer that it "did not touch `src/client.cjs`" and named, as an open point, "No request timeout: `getItem` has no deadline, so a hung API connection would hang the nightly job." In the session's reading that is the pattern the line was written for, seen once in sixteen. The script's `scope` column (a sentence calling the deadline pre-existing or out of scope) reads no for all sixteen. K4's answer does give an out-of-scope-type reason ("would also change `show`, so I didn't do it here"). The regex (`out of scope|pre-existing`) misses it.
- On `node-01` the seven sessions that passed the deadline all edited the shared client; on `py-01` seven of the eight that passed left it unedited and one edited it.
- Other hazards: `node-01` N1 and N2 8 of 8, X 8 of 8; `py-01` Y1 and Y3 8 of 8, X 0 of 8. `Rskill` 0 of 16, as expected with no `Skill` call.
- Cost and time per session, from each folder's `results.md`: `node-01` median 0.228 USD (0.189 to 0.249), 55.5 seconds (51 to 67); `py-01` median 0.216 USD (0.184 to 0.244), 58.5 seconds (50 to 72).
- Beside the figures of 2026-10-07, not as a comparison and not a result (another prompt, another entry path, eight sessions, read after the fact): the plain `node-01` sessions passed the deadline in 4 of 8 with the stack file opened in 4 of 8; here, entered through `bk-build`, the file was opened in 8 of 8 on `node-01` and 16 of 16 over both tasks. This is about the plain-words path and `bk-spec`, not about the Step 0 line.

**Limits.** Sixteen sessions on one day, one host version, two small fixtures. The gate was noisy by design and said so; here the figure (1 of 16) is far from its threshold (5 of 16), not near it. The client-edit count is the script's, mechanical and imperfect as stated before the data.
