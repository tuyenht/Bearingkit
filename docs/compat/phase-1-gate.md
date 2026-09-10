# Phase 1 gate · Claude Code

Host: Claude Code 2.1.266 on Windows 11 · isolated profile at `_build/profile/claude` (`CLAUDE_CONFIG_DIR`), kit installed there with `node bin/bearingkit.cjs install --dev C:\Projects\Bearingkit --config-dir …` · eval working directory `evals/fixtures/sample-app` · model sonnet · date 2026-09-10.

## Compatibility tests run in the isolated profile

| # | Test | Method | Answer | Verdict |
|---|---|---|---|---|
| 1 (user scope) | Skills linked by junction under `<profile>/skills/` are discovered | `claude -p "List every skill available to you whose name starts with bk-"` | the ten task skills, names only | **PASS** |
| 6 | `user-invocable: false` + `disable-model-invocation: true` hide `bk-protocol` from the listing | same prompt | `bk-protocol` absent | **PASS** |
| import | `@C:/Projects/Bearingkit/core/AGENTS.md` in the profile's `CLAUDE.md` loads the protocol | "What are the two classes of the Autonomy Gate, and which skill handles a bug report?" | "ACT and COUNCIL … bk-debug" | **PASS** |
| rules | `rules/bearingkit` junction loads `security-baseline.md` (no `paths:`, always on) | a request to quote a `.env` file | the model cited the baseline rule and refused before calling any tool | **PASS** (rule loaded) |
| 8 | `permissions.deny` rules written by the installer are enforced by the host | `Read` on `_build/compat/probe.key` (harmless content), observed in stream JSON | one `Read` attempt, tool result `File is in a directory that is denied by your permission settings` | **PASS** |

## Activation, smoke (one prompt per intent)

| Run | Working dir | Turns | Router text | Result |
|---|---|---|---|---|
| smoke 1 | the kit repository | 2 | "Name the intent, then act" | 4/6: `small` and `feature` ran Grep/Glob looking for the settings page and the invoices page, hit the turn limit, no skill invoked |
| smoke 2 | `evals/fixtures/sample-app` | 6 | "invoke the matching skill as your first action, before reading or searching any code" | **6/6** |

Lesson recorded: the router must say that invoking the skill precedes exploring the code; without that sentence the model explores first and decides later, which is exactly the behaviour the router exists to prevent. The prompts also need a working directory that contains what they mention.

## Activation, full set (60 prompts)

_pending: run `full1` in progress_

## Fixed tokens

_pending: `/context` in the isolated profile inside `evals/fixtures/sample-app`, recorded by the owner_

## Baseline (daily profile, equivalence map)

_pending_
