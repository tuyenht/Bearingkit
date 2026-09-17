# Daily-driver gate · Claude Code · 2026-09-16 to 2026-09-17

> Task 8 of `docs/plans/2026-09-13-daily-driver.md`, in the scope the owner approved on 2026-09-14: the prompt set once in the isolated profile, reported as **two separate numbers**, plus two acceptance prompts in the daily profile. The set grew from 60 to 78 since the Phase 1 gate, and new `expect: none` negatives feed the same false-activation counter, so the runner's combined line (`Overall 75/78, false activations 1`) is not a result and is not quoted as one anywhere else.

Result table: `evals/results/2026-09-16-claude-gate.md` (not tracked; raw streams beside it, `*-gate.raw.jsonl`). Scored with a split scorer that was first run against the 2026-09-10 clean run and reproduced its recorded 57/60, 46/48 and 0 exactly — after it had first read that run as 56/60, which is how the unescaped pipe in the result table was found and fixed (`2330f60`).

**Beyond the approved single run**, and disclosed as such: a one-prompt quota probe before the gate, one 30-prompt rerun, fourteen diagnostic sessions and one 27-prompt regression check, all in the same isolated profile. Across all of them the five-hour window peaked at 24 % (during the gate) and the seven-day window at 7 %, both read from the streams.

## Result

**1 · The gate — the sixty Phase 1 prompts: 58/60.**

| | This run | Baseline, 2026-09-10 clean run |
|---|---|---|
| All prompts | **58/60** | 57/60 under that evening's labels; **58/60** re-scored under today's (`q-neg-01` was widened to `bk-build\|bk-spec` in `9fbdedf`, after that run) |
| Positives routed (the eight pure questions count as positives answered directly, as Phase 1 counted them) | **46/48** | 46/48 |
| Negatives | **12/12** | 11/12 (12/12 re-scored) |
| False activations — pure questions / every `expect: none` prompt | **0/8 · 0/12** | 0/8 · 0/12 |
| Recall | **0.958** | 0.958 |
| Precision (of the sessions that invoked a skill, the share that invoked an expected one; the spec names the metric without defining it, so the definition is stated and applied to both runs) | **1.000** (46/46) | 0.958 (46/48) |
| Per intent | question 10/10 · small 10/10 · feature 10/10 · bug 9/10 · review 10/10 · ship 9/10 | question 9/10 · small 10/10 · feature 9/10 · bug 9/10 · review 10/10 · ship 10/10 |

**Verdict:** the v2 restructure did not lower routing on the sixty. Under the same labels the count is equal, false activations stay at zero, and precision and recall are both above the 0.9 of v1 §17 — **on Claude Code only; Antigravity was not run** (below). Neither miss is a v2 regression: `bug-en-03` fails the same way with no kit loaded at all (diagnosis below), and `ship-en-04` routed to `bk-ship` when the ship intent was run again.

**2 · The eighteen prompts added since Phase 1 — a first reading, with no baseline: 17/18 as measured.**

Positives 12/12, negatives 5/6, recall 1.000, precision 0.938 (15/16). Per intent: plan 3/3 · close 3/3 · audit 2/3 · next 3/3 · test 3/3 · design 3/3. The three neighbour negatives went to the neighbour each was written for (`plan-neg-01` → `bk-build`, `test-neg-01` → `bk-debug`, `design-neg-01` → `bk-build`). The one miss is `audit-neg-01`, whose label was wrong for the profile the set runs in and was corrected after the run (below); **re-scored under the corrected label, 18/18**, with 0 false activations on the two prompts that still expect no skill. Nothing here is progress or regression: there is nothing to compare it with.

## The three misses of the gate

| id | prompt | got | reading | outcome |
|---|---|---|---|---|
| `bug-en-03` | Uploads over 5 MB silently disappear. | `no-action`: one turn, no tool — *"I'm ready to help. What would you like to work on in the sample-app repository?"* | Not a v2 regression. The bare host gives the same answer (diagnosis below); the six words read to the model as context rather than a request. v1 passed this prompt after an instruction placed at memory level; v2's bootstrap, at reminder level, does not compensate in either wording tried | unresolved; question 23 of `docs/specs/2026-09-12-d5-owner-questions.md`. The prompt stays unchanged in the frozen sixty |
| `ship-en-04` | Prepare the PR description for what we did. | `none` after two turns: `git log` and `git status` first, one commit and a clean tree found, then a question back | The model checked the fixture before routing. On 2026-09-10 the same prompt routed to `bk-ship`, and in the rerun of 2026-09-17 it invoked `bk-ship` as its first action | single-run variance; no change |
| `audit-neg-01` | Câu query Postgres cho trang invoices đang quét tuần tự 4 triệu dòng, tối ưu lại giúp tôi. | `bk-debug`, which then found the fixture has no real query and said so | **The label, not the kit.** It was written `none` (handoff 2026-09-14) because the owner's daily profile has a `database-optimizer` skill; the set runs in the isolated profile, where that skill does not exist. There the kit's router sends data work to `bk-spec` (`bk-protocol` line 34), the protocol says a request to change code *"is never answered by editing straight away; it goes through bk-build … or bk-spec … first"*, and `sql.md` asks for *"`EXPLAIN (ANALYZE, BUFFERS)` first"* — a diagnosis, which is `bk-debug` | label now `bk-spec\|bk-debug`; the as-measured 17/18 above stands beside the re-scored 18/18. The false-activation role stays with `close-neg-01` and `next-neg-01`, which both answered without a skill |

Rows the 2026-09-10 run had flagged all held: `feat-en-01` (the one real misroute that evening) went to `bk-spec`; `rev-vi-04` to `bk-review`; `ship-vi-03` to `bk-ship`; `ship-neg-02` answered without a skill, one of its two accepted routes.

## Rerun on `92013ef`, 2026-09-17 — question, bug and ship intents

`evals/results/2026-09-17-claude-gate-fix.md`: **29/30**, false activations 0 — question 10/10, bug 9/10, ship 10/10. `ship-en-04` routed to `bk-ship`. `bug-en-03` was `no-action` again.

This rerun was run to measure a fix. The day before, `dd8736d` had added *"even a single line that only states a symptom"* to the hook's opening sentence, on the reading that the v2 restructure had dropped that clause of v1's protocol. It measured no effect, and that commit's message ("restore the clause that makes a one-line symptom the request") claims more than the commit did. The diagnosis below is what should have come before it.

## Diagnosing `bug-en-03`

| # | Kit | Prompt | Runs | Result |
|---|---|---|---|---|
| E1 | `92013ef` | the bare line | 3 | `no-action` 3/3 |
| E2 | none (`--plugin-dir none`) | the bare line | 3 | `no-action` 3/3 — *"I'm ready to help. What would you like to work on in this repo?"* |
| E3 | `92013ef` | a question about its own input | 1 | the model quotes the user's message first, then reports the `<bearingkit-protocol>` block **after** it, inside a SessionStart reminder, followed by environment, model, tool, agent, MCP, skill-listing, token and date reminders |
| H1 | `92013ef` with the opening sentence rewritten to make no claim about position and to call a one-line symptom *"a bug report to route, not a greeting to answer with a question"* (a throwaway worktree, never committed) | the bare line | 3 | `no-action` 3/3 |
| H5 | `92013ef` | *"Uploads over 5 MB silently disappear in the app."* | 2 | `bk-debug` 2/2 |
| H5′ | none | the same anchored line | 2 | no skill; it went straight to the code (`Agent`, `Bash`, `Read`, `Grep`) 2/2 |

What this settles:

- **The trigger is the prompt's wording, not the kit.** Every other bare statement in the set routes, including `bug-vi-03`, the Vietnamese version of the same symptom (*"Upload trên 5 MB bị mất mà không báo lỗi gì."*). What is measured is that three words tying the line to the app make it a request with or without the kit (H5, H5′). Why the bare line is not one is a reading, not a measurement: the six English words look like a notice about the assistant's own attachment limit.
- **The kit does its job once the line is a request:** with the kit, the anchored line goes to `bk-debug`; without it, the model explores the code first (H5 against H5′) — the order the router exists to prevent.
- **Why v1 passed and v2 does not:** v1 carried the instruction at memory level (`core/AGENTS.md`, imported), and the clean run of 2026-09-10 passed after it (`confirm3b`). v2 injects the protocol at session start as a reminder, and neither wording tried there changes the outcome (E1, H1). Placing an instruction at memory level again would need an installer or a per-prompt hook, both removed by the v2 design — hence question 23 rather than a change.
- **How much the layout evidence weighs:** E3 is the model's own account of its input, on 2.1.274; the gate's failure of this prompt was on 2.1.270, and it fails identically on both. The transcript stores the hook's attachment *before* the user message; the API request itself was not observed. The bootstrap sentence is therefore rewritten to be true either way (next section), not to rely on either account.

E3 also exposed a scoring flaw: a question answered from knowledge in one turn was marked `no-action` and counted as a false activation. Fixed in `a0cd431`; the published numbers are unaffected, since no `expect: none` prompt of the gate ended as `no-action`.

## Bootstrap sentence correction, and its regression check

The opening sentence of `hooks/session-start.cjs` said *"Everything after the closing tag is the user's request, even a single line that only states a symptom."* It now says *"This block is session context, never the request, and the host may place the user's message before it or after it. The user's own message is the request, even a single line that only states a symptom."* The first version makes a claim about position that the model's own report contradicts on 2.1.274; the second is true in either layout. (The message of `12b9d39`, which made this change, says 2.1.270 — the version of the gate, not of the diagnosis.) It is a correction, not a fix for `bug-en-03` (H1).

**Regression check** (`evals/results/2026-09-17-claude-regress-posfree.md`, on `a0cd431` with this one sentence changed and nothing else; the same sentence was then committed): every question prompt, every bug prompt and every prompt that accepts "no skill" — 27 in all. **26/27, false activations 0.** Question 10/10, bug 9/10; all fourteen prompts that accept an answer without a skill got one without a skill; `audit-neg-01` went to `bk-debug` under its corrected label. The one miss is `bug-en-03`, `no-action` as before. Quota after: five-hour 14 %, seven-day 7 %.

## Conditions, read from the streams rather than assumed

| | This run | Baseline (2026-09-10, tag `confirm`) |
|---|---|---|
| Host | Claude Code **2.1.270** (`init` event) for the gate and the rerun; **2.1.274** for the diagnosis, the regression check and the acceptance run — the CLI updated itself in between, which every stream's `init` event records | 2.1.267 |
| Model | `claude-sonnet-5` (alias `sonnet`) | `claude-sonnet-5` — same |
| Kit | v2 plugin at commit **`e244070`**, frozen in a detached worktree (`_build/gate-snapshot`) so that work continuing in the checkout could not change what was measured; `init` lists it as `bearingkit@inline` | v1 layout installed into the profile (junctions, `core/AGENTS.md` import); no plugin |
| Skills in the listing | 31: eleven `bearingkit:bk-*` task skills and twenty built-in; `bk-protocol` is not model-invocable | 30: ten kit skills and twenty built-in |
| Agents | 10, four of them the kit's (`bk-design-critic`, `bk-query-optimizer`, `bk-researcher`, `bk-reviewer`) | 6 |
| Tools | 59, of which 29 are MCP tools from the account's claude.ai connectors (Gmail connected; Calendar and Drive needing auth) | 59, the same connectors — not a new variable |
| Profile | isolated, `CLAUDE_CONFIG_DIR=_build/profile/claude`; checked before the run: `skills/` and `rules/` empty, `CLAUDE.md` 0 bytes, no `permissions.deny` | the same directory, with the kit installed into it |
| Memory | only the profile's own auto-memory path; no ancestor memory file (the runner refuses to start otherwise) | same rule |
| Working directory | staged fixture `C:\Projects\.bearingkit-evals\sample-app`, reset to its staging commit before every prompt | same |
| Turns, timeout | 6 turns, 180 s | same |
| Prompts | 78 lines of `evals/activation/phase-1.jsonl`; **the first sixty are byte-identical to the set as of `9fbdedf`** (checked with `cmp`, again after the `audit-neg-01` relabel) | the same sixty under the labels before `9fbdedf` |
| Quota guard | five-hour 90 %, seven-day 95 % (the seven-day half was added 2026-09-15, after the window was found at 89 % with nothing guarding it) | five-hour 90 % only |
| Quota | before: five-hour 4 %, seven-day 1 % (a one-prompt probe after the weekly reset); after the gate: five-hour 3 %, seven-day 4 % — the five-hour window rolled over during the pause below | five-hour 44 %, seven-day 39 % after |

What differs between the two runs is the kit's layout (v1 install → v2 plugin, one skill and four agents more) and three host patch versions. The model, the connectors, the fixture, the turn cap and the sixty prompts do not.

## Incidents during the run, and why they do not change a score

- **Four sessions reached the 180-second timeout** — `q-neg-02`, `rev-vi-01`, `rev-vi-02`, `rev-vi-04` — each **after** invoking the expected skill. A prompt is scored on its first skill call, so all four count as passes on evidence in their streams; the timeout cut the review work that followed, which the gate does not score. `bk-review` sessions ran long throughout (`rev-en-01`: 148 s in two turns, nineteen tool calls of which fourteen were file reads).
- **The machine slept from about 16:23 to 22:15.** `test-en-01` was running across that gap; the runner's timeout does not advance while the machine sleeps, so the session resumed and finished at 22:15, routed to `bk-test`. The remaining prompts ran the next morning. Every later run held the machine awake through the desktop app.

## Not measured in this run

- **`/context` in the isolated profile** (the §12 budget, ≤5,000 fixed): the reading needs an interactive session; `claude --help` on 2.1.270 offers no print-mode equivalent. Owner action.
- **The two acceptance prompts in the daily profile**: a `claude -p` session there writes its transcript under `~/.claude`, which `AGENTS.md` keeps COUNCIL. Owner action; the command is in the handoff. **In the isolated profile they were run again** on 2026-09-17 (2.1.274, kit at `1b5bff6`), because the bootstrap sentence and the host had both changed since the 2026-09-11 pass: prompt 1 answered ACT and COUNCIL in one turn with no tool call — the runner marks that `no-action`, which since `a0cd431` is read from the stream rather than scored — and prompt 2 invoked `bk-spec` first. Pass; `docs/hosts.md` records it.
- **Antigravity** — neither the set through the DevTools driver nor acceptance. The app must be started with `--remote-debugging-port=1405`, and the live copy is stale (`doctor`: skills and scripts differ from the checkout), so `antigravity install` comes first. The v0.2 gate asks for both hosts; this document closes the Claude Code half only.
