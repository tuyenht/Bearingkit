# Phase 1 gate · Claude Code

Host: Claude Code 2.1.267 on Windows 11 (the CLI had auto-updated from 2.1.266 before the runs; version read from the `init` event of the streams) · isolated profile at `_build/profile/claude` (`CLAUDE_CONFIG_DIR`), kit installed there with `node bin/bearingkit.cjs install --dev C:\Projects\Bearingkit --config-dir …` · eval working directory `evals/fixtures/sample-app` · model sonnet · six turns per prompt · date 2026-09-10.

## Compatibility tests run in the isolated profile

| # | Test | Method | Answer | Verdict |
|---|---|---|---|---|
| 1 (user scope) | Skills linked by junction under `<profile>/skills/` are discovered | `claude -p "List every skill available to you whose name starts with bk-"` | the ten task skills, names only | **PASS** |
| 6 | `user-invocable: false` + `disable-model-invocation: true` hide `bk-protocol` from the listing | same prompt | `bk-protocol` absent | **PASS** |
| import | `@C:/Projects/Bearingkit/core/AGENTS.md` in the profile's `CLAUDE.md` loads the protocol | "What are the two classes of the Autonomy Gate, and which skill handles a bug report?" | "ACT and COUNCIL … bk-debug" | **PASS** |
| rules | `rules/bearingkit` junction loads `security-baseline.md` (no `paths:`, always on) | a request to quote a `.env` file | the model cited the baseline rule and refused before calling any tool | **PASS** (rule loaded) |
| 8 | `permissions.deny` rules written by the installer are enforced by the host | `Read` on `_build/compat/probe.key` (harmless content), observed in stream JSON | one `Read` attempt, tool result `File is in a directory that is denied by your permission settings` | **PASS** |
| 9 | `CLAUDE_CONFIG_DIR` honored | variable pointed at an empty directory | "Not logged in", fresh profile skeleton, `~/.claude` untouched | **PASS** |

## Activation, smoke (one prompt per intent)

| Run | Working dir | Turns | Router text | Result |
|---|---|---|---|---|
| smoke 1 | the kit repository | 2 | "Name the intent, then act" | 4/6: `small` and `feature` ran Grep/Glob looking for the settings page and the invoices page, hit the turn limit, no skill invoked |
| smoke 2 | `evals/fixtures/sample-app` | 6 | "invoke the matching skill as your first action, before reading or searching any code" | **6/6** |

Lesson: the router must say that invoking the skill precedes exploring the code; without that sentence the model explores first and decides later. The prompts also need a working directory that contains what they mention.

Confound found on 2026-09-10 evening: Claude Code loads every `CLAUDE.md` in the ancestors of the working directory, and the fixture sat inside this repository, so all eighty sessions also carried the repository's own working agreement (root `AGENTS.md`, about 1,900 characters, no routing text). The runner now stages the fixture in a directory whose ancestors carry no memory files (beside the repository on this workstation: `C:\Projects\.bearingkit-evals\sample-app`; `--stage-only` prints the path) with a throwaway git history, and refuses to run when memory files exist above the working directory. The confirmation run and the fixed-token measurement use the staged copy.

Second confound, found from the second `/context` reading below: Claude Code also loads `.claude/CLAUDE.md` and `.claude/rules/*.md` from every ancestor of the working directory, so a fixture under the home directory receives the daily profile (`~/.claude`) as project memory even inside an isolated `CLAUDE_CONFIG_DIR`. The first staging location (the temp directory, under the home directory) fell into exactly that trap.

## Activation, full set (60 prompts)

**Run 1** (`evals/results/2026-09-10-claude-full1.md`): 56/60 as labelled, 0 false activations on the eight-per-intent pure-question prompts; question 9/10, small 10/10, feature 10/10, bug 10/10, review 9/10, ship 8/10. The four misses, read from the raw streams:

| id | prompt | got | reading | action |
|---|---|---|---|---|
| q-neg-01 | Can you add a retry to the upload endpoint? | bk-build (then scouted `src/lib/upload.ts`) | a one-file change is ACT and belongs to bk-build; the label `bk-spec` was wrong | label corrected to `bk-build` |
| rev-vi-04 | Nhánh này merge được chưa? | bk-ship | the model read "mergeable" as "ready to ship"; bk-review's cues lacked the merge-safety wording | cues added: "safe to merge", "merge được chưa"; bk-ship now says "Not for: judging whether a change is safe (bk-review)" |
| ship-vi-03 | Giao hàng tính năng xuất hóa đơn. | bk-spec | the fixture has no export yet, so "deliver the export feature" read as "build it"; the phrasing is also unnatural for a developer | prompt rewritten to "Xong phần xuất hóa đơn rồi, ship đi."; bk-ship description now opens with "Finish work that is already done" and carries "xong rồi ship đi" |
| ship-neg-02 | Deploy bản này lên staging. | none: the model stated that a remote change is COUNCIL and proposed instead of acting | designed behaviour; no Phase 1 skill covers ops, and the router also allows routing ops to bk-spec | label widened to `bk-spec|none` |

**Run 2**, review and ship intents only, after the cue changes (`…-review-full2.md`, `…-ship-full2.md`): review **10/10**, ship 9/10 where the one miss is ship-neg-02 routed to `bk-spec` this time (the other accepted route). Same prompt, two runs, two accepted answers: routing is not deterministic on this prompt, which is why the label lists both.

**Gate result on Claude Code:** positives **48/48** across the six intents (question 8/8 answered directly, small 8/8, feature 8/8, bug 8/8, review 8/8 in run 2, ship 8/8 in run 2); negatives 12/12 with the two label corrections; false activations on pure-question prompts **0/8**. One tuning round on two descriptions, both still under 300 characters (253 and 292).

Quota used: the sixty-prompt run plus the twenty-prompt rerun, all short sonnet sessions in the isolated profile, moved the five-hour window from roughly 20% to 73%.

## Fixed tokens

First reading (2026-09-10, pasted by the owner): a session on Opus 5 whose skills total equalled the sum of the eighteen built-in skills with no `bk-` entries and no custom agents; memory files 709 tokens, consistent with the repository's root `AGENTS.md` loaded through the ancestor `CLAUDE.md` and not with `core/AGENTS.md` (about 4,200 characters). The kit was not in that session, so the reading is not the measurement. What it does establish: the host's own overhead in that session was system prompt 3.6k plus tool definitions 28.6k, which sits outside the kit's budget; the kit's ≤5,000 is measured over and above it.

Second reading (2026-09-10, isolated profile confirmed by `/skills` showing the eleven kit skills and nothing else, Claude Code 2.1.267, Opus 5 1M, working directory the staged copy under the temp directory): total 107.3k; system prompt 3.4k; system tools 28.3k; memory files **71.9k**; skills 3.5k for 27 skills; messages 183. Readings: skills 3.5k against 2.9k for the eighteen built-in ones leaves about 0.6k for the ten descriptions, in line with the `/skills` panel (eight at ~70, `bk-review` ~90, `bk-ship` ~100). Memory 71.9k cannot come from the kit (about 5,400 characters in total); it matches the daily profile, `~/.claude/CLAUDE.md` (22,399 characters) plus thirty rule files (196,694 characters), which sit at `.claude/` of the ancestor `C:\Users\tuyen` of the temp directory. Grade: inferred from the size match and from the absence of any other candidate; the per-file list from `/context all` is the direct confirmation and is still to be pasted.

_pending: `/context` retaken in the staged copy beside the repository, with the "Memory files" and "Skills" trees pasted in full; expected kit rows: `core/AGENTS.md` (4,221 characters), `security-baseline.md` (1,196 characters), ten skill descriptions (about 0.6k measured above), no agents_

## Baseline (daily profile, equivalence map)

_pending: `node bin/bearingkit.cjs evals --per-intent 3 --equivalents evals/activation/equivalents-superpowers.json --tag baseline` on the daily profile, 18 sessions (`--per-intent 3` takes an English positive, a Vietnamese positive and a negative per intent), scheduled after the five-hour window resets (19:40 local on 2026-09-10, from `five_hour.resetsAt` in the last stream) because each session on that profile loads an estimated 61K tokens of the previous kits_

## Confirmation run (isolated profile, final descriptions)

_pending: one run of all sixty prompts with the descriptions as tuned above. The gate result recorded here stitches run 1 (forty prompts read before the two cue changes) and run 2 (review and ship after them). Scheduled after the baseline, in the same fresh window; the runner stops at 90% and `--id` resumes the rest_
