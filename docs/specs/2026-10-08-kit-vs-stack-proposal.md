# The kit against a stack of packs · design and planned registration · 2026-10-08

Status: **PROPOSED. No session, counted or uncounted, may run until the owner approves this file and answers the questions at the end.** The bars are registered here before any data, and none may change after data. A cloud session wrote this file on the owner's instruction. It changes nothing under `skills/`, `scripts/`, `evals/` or `tests/`.

## Why this measurement

The README, the site and `PROVENANCE.md` now lead with "one kit instead of a stack". Today that claim rests on how the two setups work, not on a measurement.

The existing benchmark (`docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md`) compares the kit with the sources of **one skill at a time** (branch S). A user's real alternative is several **whole packs installed together**, all loaded in every session. Nothing in the repository measures that alternative yet. Until something does, every public text keeps saying "not measured" for it.

## Branches

The runner, the isolated profile, the fixture reset and the interleaving stay as the benchmark spec defines them. One branch is added.

| Branch | Loads | How |
|---|---|---|
| K · kit | the checkout | as in the benchmark spec |
| St · stack | a fixed set of whole packs, as they ship, all switched on together | one `--plugin-dir` per pack, from sha-pinned copies under `_build/upstream/` |
| F · floor | nothing | as in the benchmark spec |

**The runner does not accept St today.** `scripts/bench.cjs` takes only K, S and F and throws on any other branch name. Adding St, with its tests, is a code change that is reviewed before M1 runs (see Order, step 0).

**Proposed composition of St (question 1).** These are the kit's main sources that ship as Claude Code plugins. All of them except `feature-dev` and `frontend-design` already load as plugins in this repository's S branches. Those two are plugins in the pinned repository but have never been loaded by the runner, so step 0 checks that they load:

- obra/superpowers: the whole plugin, at the pin in `upstream/sources.json`.
- anthropics/claude-plugins-official: `code-review`, `pr-review-toolkit`, `feature-dev`, `frontend-design` and `code-modernization`.
- mattpocock/skills (`mattpocock-skills`).
- jeffallan/claude-skills (`fullstack-dev-skills`).

**Excluded by default: `security-guidance`.** Its SessionStart hook creates a Python environment in the profile, and its reviews call a model outside the session's token count. Including it would understate St's cost. The benchmark spec left it "asked about again". It enters St only if the owner says so, and its outside calls are then reported as unmeasured.

## What is measured

### M1 · Fixed context

- Read `/context` at session start in the isolated profile, three times per branch, on the same host version.
- Report the tokens that the skills listing, the hooks and the injected context add over F.
- This reading is deterministic and cheap, so it runs first.

### M2 · Activation on plain requests

The prompts are the 96 of `evals/activation/phase-1.jsonl`, 44 of them Vietnamese. Each prompt gets one first turn per branch, K and St. For every turn, the Skill or slash-command invocations come from the init event and the transcript.

Counted per branch:

- **(a) False activations:** a skill opened on a prompt whose expectation is `none`.
- **(b) Multiple openings:** more than one skill opened on a single prompt.
- **(c) Off-intent openings:** a skill opened whose intent class does not match the prompt.

Counting (c) for St needs a table that maps each pack skill to one of the kit's intent classes. That table is registered with this file before any data (question 2).

### M3 · Outcome and cost on existing tasks

**Proposed tasks (question 5):** `shell-01`, `node-01`, `py-01`, `php-01`, `test-01` and `build-01`, each scored by its own registered rules and statistics. Their Sonnet floor calibration matters for what M3 can show:

| Task | Floor calibration on Sonnet |
|---|---|
| `shell-01` | passed |
| `test-01`, `node-01`, `py-01`, `php-01` | not usable (guard path) |
| `build-01` | usable by the letter, confounded in fact |

So only `shell-01` has room to separate branches on outcome.

Three tasks are excluded:

- **`plan-01`**: its registration allows no third run of the current `bk-plan` text on it (`docs/specs/2026-10-03-bk-plan-design.md`).
- **`debug-01` and `review-01`**: the owner's answer recorded in the benchmark spec was to try Haiku and stop small tasks. They enter only on Haiku, or on the owner's word.

**Sessions:** eight per branch per task, interleaved K, St, F, on one model (`claude-sonnet-5-5`, unless the owner names another) and one host version.

**Reported per branch:** each task's own score, tokens (total and fresh), cost as the host reports it, and turns.

**Expected readout.** Before `shell-01`, no Sonnet task could tell any branch from the floor on outcome (`docs/status.md`). M3 may well show no outcome difference. In that case cost is its main readout, and the results say so.

### M4 · The autonomy gate under pressure

- This needs a new task, `gate-01`. Its most natural fix requires a schema migration, a data deletion or a push to a remote, and it is scored on whether the session acted without asking.
- Building it is a separate step with its own design file. Approving this file does not approve it (question 4).

## Bars, registered before data

All tests are two-sided, as in every registration in this repository.

| Measure | What may be said if met | Bar |
|---|---|---|
| M1 | "At session start the kit adds N tokens; the stack adds M" | Always reported; no bar, because the reading is deterministic |
| M2 (a), (b), (c) | "The kit opened a skill it should not have on x of 96 prompts, the stack on y" | "Fewer" only if two-sided Fisher p < 0.05; otherwise "no clear difference" |
| M3 outcome | "On task T, kit and stack scored …" | The statistic and threshold that task's own registration uses (exact two-sided permutation test for count scores, two-sided Fisher for pass/fail). "Better" only if p < 0.05 |
| M3 cost | "The kit cost c₁, the stack c₂, median per session" | Always reported. "Cheaper" only if the min–max ranges of the two branches do not overlap |

**"No clear difference" never means "equal".** With eight sessions a side it does not show that the two are the same, as `docs/specs/2026-10-01-stack-shell-design.md` records. No sentence of the form "at least as good" may come from this measurement unless a non-inferiority margin is registered here first.

**The tool-count rule.** The benchmark spec compares tokens only between sessions with the same number of tools. In this measurement, the difference in loaded tools *is* the treatment. This file proposes a narrow exception: for St against K only, tokens and cost are compared even though the tool counts differ, and the tool counts are printed next to them (question 3).

**What may never be said from this measurement:**

- anything about hosts other than Claude Code;
- anything about models other than the one run;
- anything about tasks that were not run;
- that the kit is better than any single pack inside the stack.

## Order and expected effort

0. Add St to `scripts/bench.cjs` with tests, check that `feature-dev` and `frontend-design` load, and have the change reviewed.
1. Run M1. Minutes per branch.
2. Run M2. About 192 short sessions.
3. Run M3. About 144 sessions.
4. Design, build and run M4, each step separately.

The session counts are planned, not measured costs. The caps in `docs/autopilot/state.md` apply: no measurement starts above 80% of the five-hour window, and autopilot work stops at the 70% weekly cap.

## Questions for the owner

1. **The stack composition.** Should `security-guidance` stay excluded?
2. **The intent-class mapping table for St.** Should it be drafted in this file for approval before M2?
3. **The narrow exception to the tool-count rule** for St against K.
4. **`gate-01`.** Should it get a separate design file with its own registration?
5. **The M3 task list and model.** Also: run M1 and M2 first and publish them on their own, before M3?
