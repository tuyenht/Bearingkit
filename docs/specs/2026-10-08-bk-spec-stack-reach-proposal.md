# bk-spec: a first step that opens the stack files, as `bk-build` has · proposal of a direction · 2026-10-08

Status: **THE DIRECTION IS APPROVED by the owner on 2026-10-08, by label ("Duyệt hướng (Recommended)", `docs/autopilot/decisions.md`, entry 22); nothing else is. No text of a skill is written, no measurement is registered, no session has run.** Next, in a later session: the design with its full registration, put to the owner again before any session. It concerns text the model reads (COUNCIL). Nothing here lets a session cut a branch, write skill text or run a session. Written in session 5, after the audit of the P5c proposal named this as the larger lever (`docs/autopilot/decisions.md`, entry 21), on the owner's general sentence "Audit kỹ các xử lý ở trên, tiếp tục theo khuyến nghị.", which the session reads as covering a written proposal inside the repository and no more.

## What was seen (a description, not a result)

On `claude-sonnet-5-5`, the eight `node-01` sessions asked in plain words on 2026-10-07 (the guard of `plan-01`; `docs/specs/2026-10-03-bk-plan-design.md`, "Step 6 result"; raw files `evals/results/2026-10-07-bench-node-01-natural/`, owner's machine, untracked), read from each session's `check.json`:

| Session | `detect-stack` | `node.md` opened | Deadline hazard (N3) |
|---|---|---|---|
| K1 | ran | yes | passed |
| K2 | ran | yes | passed |
| K3 | ran | no | missed |
| K4 | not run | no | missed |
| K5 | ran | yes | passed |
| K6 | ran | yes | passed |
| K7 | not run | no | missed |
| K8 | ran | no | missed |

Every session launched `bk-spec` (8 of 8) and one went on to `bk-build`. The stack file was opened in 4 of 8, and the deadline hazard passed in exactly those four. Two sessions did not run `detect-stack`; two ran it and still did not open the file it lists.

Eight sessions of one task on one day, read after the fact, with nothing registered: nothing here is a finding. It says where to look.

## Why it points at `bk-spec`

`bk-spec` already asks for the files, as the second bullet of "Read first": "Each file the profile lists under `stackFiles`: the stack's rules, which shape the edge cases and the requirements." It has no step for it and no line of evidence for it.

`bk-build` had the same shape and the same failure, and a step fixed it there: `docs/specs/2026-10-01-bk-build-stack-reach-design.md` measured a new step 1 ("Stack rules before anything else": run `detect-stack`, open every file it lists under `stackFiles` before reading or editing code; an empty list is said, not skipped) at 6 of 8 sessions opening the stack file against 1 of 8, p = 0.041, on `php-01`, on the model the alias gave then. That step is on `main`. Its limits, from the same file: why `php-01` failed to reach its file is not known, and on the other tasks of that time the unchanged line had reached its file in 10 of 12 sessions entering through `bk-build` and in **59 of 59 through `bk-spec`**. So `bk-spec` did not have this failure then; the 4 of 8 above is one day on the model the alias gives today, on one task, `node-01`, whose sessions entered through `bk-spec`, where no such step exists.

## The direction proposed

Give `bk-spec` the same first step and the same line of evidence, in its own words, and measure it before it reaches `main`:

- a step 1 in `skills/bk-spec/SKILL.md` that runs `detect-stack` unless its output is already in the session and opens every file under `stackFiles` before the code is read, an empty list being said;
- under "Evidence to paste", the `stackFiles` list and the files opened.

The exact wording is not fixed here. It is written and frozen with the registration, on a branch, as every text the model reads.

**What a registration would hold, in outline** (to be designed, reviewed and approved before any session):

- tasks `node-01` and `py-01` in plain words, where, on `node-01`, sessions entered through `bk-spec` (not yet observed for `py-01`); the model by its full name and the `init` event read before any counted session, as the owner's lessons ask, and read for every counted session as well;
- K-before (`main`) against K-after, interleaved from the main checkout; primary: sessions that open the stack file, pooled; the deadline hazard and O1, O2 as bars that must not fall; whether `bk-spec` was launched, as the reach bar;
- an S branch with the same plain prompt (proposed, not settled), so that this time the comparison with the sources keeps the owner's rule of 2026-09-24 (the same task, fixture, model and host), with the same prompt on both sides;
- a guard on the tasks that enter through `bk-spec` and are not in the comparison;
- the number of sessions from the power of the test and not from habit: from a baseline of 0.5, a rise to 0.875 has a power of 0.19 at 8 a side, 0.49 at 16 and 0.75 at 24 (`node evals/analysis/fisher-power.cjs 0.5 0.875 <n>`); the baseline itself is one day's eight sessions and has to be measured, not assumed.

## Khuyến nghị

Approve the direction, and let its design be written alongside P5c's stage 1; which of the two is run first is the owner's to say. Why: it addresses the failure that was actually seen on the path sessions actually take on this model, and the same fix has one measured precedent in this kit. Main risk: the precedent is one task, one model, eight a side, by a narrow margin (one session the other way gives p = 0.13), and the four-of-four pattern above may be chance; a full measurement could well show no clear difference. It also makes every `bk-spec` session read more before it starts, a cost that has to be reported with the result.

**Rejected.**
- **Folding this into P5c.** P5c is the Step 0 line in `bk-build`; this is another skill and another failure. Two changes in one measurement cannot be told apart.
- **Doing it instead of P5c's stage 1.** Stage 1 costs 17 sessions and settles a lead the owner asked to have measured; the two do not compete for the same sessions.
- **Writing the step straight into `main`**, as a small edit. Text the model reads reaches `main` only with a measurement.
- **Putting the rule into `bk-protocol`** so that every skill opens the stack files. The bootstrap is at 6,485 of 6,500 characters (`docs/status.md`), and it would change every session of every task.

## What this does not touch

The second-pass text of `bk-spec` on the branch `p5a-bk-spec` (P5a, closed, not merged) is another change and stays where it is. Whether this step would be written on `main`'s `bk-spec` or would have to be reconciled with that branch is a point for the design.

## What the owner is asked

Approve this direction (then: a design with its registration, put to the owner again before any session), or drop it, or order it after P5c.
