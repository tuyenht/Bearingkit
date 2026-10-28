---
name: bk-review
description: "Review a diff or proposal before push, hunting bugs, hot-path risk and untested claims; judges whether a change is safe to merge. Use when: review, PR, safe to merge, soi diff, rà code, merge được chưa. Not for: committing or pushing, use bk-ship."
context: fork
background: false
---

# bk-review

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say), the project's review checklist in its instruction files (the abbreviated hotlist there is compared against the full list), and `bk-protocol/references/evidence.md`.
- The loop, before anything else: run `node <kit>/scripts/review-loop.cjs start` from the repository root (`<kit>` as bk-protocol's host notes say). It prints the round, this round's scope, and every finding already posted in this loop, kept in `.review-loop.md` (git-ignored, reset by the next commit); exit 3 is the cap (Gates). Run it as a command of its own, nothing chained, so the host can allow it; if it still cannot run, say so, then read and write `.review-loop.md` by hand in the format it opens with.
- The diff: in round 1, the one given, or else the diff against the base branch; in a later round, only the diff the loop prints.
- `references/code-review-exchange.md`: what an independent reviewer receives and returns, how feedback is handled.
- `references/review-lenses.md` before the first pass: the passes, the confidence rubric and its anchors, and the list of what is not a finding.
- `references/security-lens.md` whenever the security lens runs (step 5).

## Steps
1. Lenses, in this order: correctness, hot-path risk, untested claims, silent failures (swallowed errors, missing transactions across multi-step mutations, unbounded inputs), type design for any type the change introduces, comments added or changed, smells (named as possible, with the move), a weakened bar (a threshold moved, a test skipped, a new suppression), simplification (delegate to the host's built-in simplifier when one exists, otherwise inline). Each lens reads something different — the project's rules, the diff alone, the history of those lines, what earlier reviews said about them: `references/review-lenses.md`.
2. Score each finding 0–100 against the rubric in `references/review-lenses.md`, and drop it through that file's not-a-finding list before reporting. Report at 80 and above, each with `file:line`, the failure scenario, and the smallest fix. List what was checked and found sound.
3. Hot path touched: the review must come from someone who did not write the change. Dispatch an independent reviewer (a subagent on hosts that have them, a fresh conversation elsewhere) when this conversation wrote the change, when the diff is large (over 400 changed lines or 15 files), or when a hot-path candidate still scores 50–79; otherwise this review is the independent one and the report says so. Record either with `record-guardrail.cjs --review "<files>"`.
4. Apply the sticky-decision rule: a finding that reverses a verified or user-confirmed decision is presented as a question with the trade-off, not applied.
5. The security lens runs when the diff touches a hot path, an entry point or a sink, or when asked; `--security` forces it even when nothing matched. It traces source to sink, refutes each candidate by naming attacker and victim, and scores what survives with the same rubric: `references/security-lens.md`.
6. A finding `.review-loop.md` already holds, an independent reviewer's included, is not a new finding: if still unfixed it is listed as open with its round and not written again. Record each new one under this round's heading, one line: `file:line` · bug class · what. Name the class so the fix covers every instance: the finding lists the other places in the scope where the same class occurs, or says there are none.

## Gates
- No approval without the checked-list.
- Round 1 reviews the whole change at full depth. A later round reviews only the diff the loop prints (the fix and what changed with it), reruns the checks, and never posts a finding already in `.review-loop.md`: one still unfixed is listed as open with its round, not scored again.
- At most 3 rounds on an ordinary change. When `start` exits 3, run no fourth round: report to the owner what is still open and propose rethinking the approach instead of another patch. A hot path (bk-protocol's list) goes beyond 3 only on the owner's word (`start --beyond-cap`).
- A fix to a reviewed hot-path change gets the same independence (step 3), on the fix diff.

## Evidence to paste
- The round ("round 2 of 3"), the findings table, the checked list, the review record when a hot path was involved.

## Next step
- bk-ship when nothing blocks; on blocking findings back to bk-build, whose fix comes back here as the next round.

Sources: obra/superpowers 5.1.0 (MIT) via references/code-review-exchange.md, anthropics/claude-plugins-official (Apache-2.0) via references/review-lenses.md and references/security-lens.md, and mattpocock/skills (MIT) via references/review-lenses.md; attribution in NOTICE. Ideas only, no text: addyosmani/agent-skills and jeffallan/claude-skills (MIT), c0x12c/ai-toolkit (no license: the three-round cap), and the Claude Code team's post on code review of 2026-10-15 (fix-diff rounds, no repeats, the bug class).
