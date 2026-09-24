# Benchmark · the kit against its own sources · 2026-09-24

Status: BUILT 2026-09-24; the first task `review-01` measured on Claude Code (section "Measured"): equal outcome on every branch, the kit at 2 to 3 times its sources' tokens. The owner's three design questions are answered below. Standing rule (owner, 2026-09-24, `AGENTS.md`): "cần phải đối chiếu, kiểm chứng và so sánh hiệu quả thực sự của các skils của chúng ta với các skill mà chúng ta lấy nguồn và tổng hợp, phát triển nhé. Tôi cần dữ liệu kiểm chứng và thực sự chất lượng tốt hơn." Requirements: `docs/plans/2026-09-19-v03-remaining-skills.md`, "Khung benchmark = so với skill nguồn". Until a skill has numbers from this frame, no text says it is better than its sources, only "not compared".

## What one comparison is

One task, one fixture, one prompt, one model, one host, one isolated profile (`_build/profile/claude`). Three branches differ only in the plugins the session loads:

| Branch | Loads | How |
|---|---|---|
| K · kit | the checkout | `--plugin-dir <checkout>`; `bearingkit@inline` switched on for the session |
| S · sources | every source plugin of the skill under test, as it ships | one `--plugin-dir` per plugin, from the sha-pinned copies under `_build/upstream/` (pins in `upstream/sources.json`); each switched on for the session |
| F · floor | nothing | no `--plugin-dir` |

`--plugin-dir` takes one path and may be repeated, and `--settings` takes an inline JSON whose keys override the settings files for that session only (Claude Code CLI reference, read 2026-09-24; `docs/compat/2026-09-24-benchmark-tool-claims.md`). So the branch is fixed on the command line, and the profile's own `enabledPlugins` does not decide it. The profile is the same for all three, including whatever the host syncs into it (the init listing is recorded per session, so a difference shows).

Sessions run interleaved (K, S, F, K, S, F, …), so drift in time, host version or quota falls on every branch alike. The fixture is built once per run and reset before every session (branch back to its tagged commit, `main` back to its parent, untracked files removed). The working directory is the fixture, outside the repository and with no memory file above it (the runner's existing check), so neither the repository's `CLAUDE.md` nor its `.claude/settings.local.json` (which, since this repository was activated on 2026-09-24, enables `bearingkit@bearingkit`) reaches a measured session.

## What is scored, by script

Per session, from the `stream-json` transcript:

- **Outcome**: each planted defect found or missed; each decoy flagged (a false finding) or not; the task passed when every planted defect is found and no decoy is flagged. Rules live in the task file and are matched against the final answer, one paragraph or list item at a time: a defect counts when every term group of its rule matches inside one item; a decoy counts when its terms match and the item does not say the code is safe. The matcher is deliberately simple and every scored answer is kept for audit; a disagreement between the script and a reading is reported, not silently corrected.
- **Tokens**: the result event's per-model usage summed over models (subagents included): input, output, cache creation, cache read; reported as total and as "fresh" (input + output + cache creation). Also cost as the host reports it, turns, wall time.
- **Context**: host version, number of tools and the skills listing in the init event, and every Skill or slash-command invocation. Token totals are compared only between sessions with the same number of tools in the init event (standing rule); a branch whose tool count differs is reported, not compared on tokens.
- A session cut at the time limit scores as failed and is named in the results file.

Per branch: median and spread (min–max) of each number over at least three sessions. With three runs only a large difference means anything; the results say so.

## Task 1 · `review-01`

The review probe of the `bk-review` sprint (`_build/v03-prep/build-review-probe.cjs`), moved into the repository as `evals/bench/review-01/build.cjs` and extended. Branch `feature/invoice-export` against `main` of a Next.js and Prisma app:

| Id | Kind | What | Found when an item names |
|---|---|---|---|
| D1 | planted | `DELETE` checks the tenant of the invoice in the URL, then deletes the ids from the body with no tenant scope | the bulk ids or `deleteMany`, and the tenant |
| D2 | planted | the export route accepts a logo URL on a bare `startsWith` against the CDN host, then fetches it server-side | the logo URL, `startsWith` or `fetch`, and SSRF or the prefix bypass |
| D3 | planted, outside the diff | the branch adds the status `void`; the unchanged payment-reminder job selects every invoice whose status is not `paid` or `draft`, so voided invoices get payment reminders (a registry fan-out: found only by following the new value to its readers) | the reminder job and `void` |
| X1 | decoy | the export route sums line items with Prisma's tagged-template `$queryRaw`, which Prisma sends as a prepared statement ("safe from SQL injections", Prisma raw-query docs, read 2026-09-24) | `$queryRaw` and injection, without saying it is safe |

Prompt, the same for every branch, in English so no branch gains from a language: "Review the changes on branch feature/invoice-export against main before I merge it. List the problems you find, most severe first, each with its file and line." One sentence, no skill named: what the owner types, so routing is part of the outcome (the invocations are recorded, so a branch that never reached its review skill is visible).

Source bundle for `bk-review` (its `Sources:` line and the inventory): Superpowers 5.1.0 (`requesting-code-review`, `receiving-code-review`), `code-review` and `pr-review-toolkit` of claude-plugins-official, `mattpocock-skills` 1.2.3 (it ships a Claude Code plugin manifest). `security-guidance` is question 1: it ships no skill, only hooks, and on a read-only review none of its reviews has anything to read (its LLM review runs on the diff the session itself made, and on the session's own `git commit` or `push`), while its SessionStart hook creates a Python venv and installs the Agent SDK in the profile, and its reviews call a model outside the session's token count.

Limits: 900 seconds per session (the skill forks a reviewer), 40 turns.

## Later tasks

`debug-01`: a failing test planted in the fixture, for the `bk-debug` sprint (sources: Superpowers `systematic-debugging`, and the ideas-only sources, which are not installable and so stay out of S). `build-01`: a small feature with a TDD or spec step, where `security-guidance`'s edit and commit hooks act. Each gets its own design line here before it runs.

## The runner

A new `scripts/bench.cjs` (verb `bearingkit bench`), not an extension of `scripts/evals.cjs`: that file scores routing, is already 512 lines, and shares only the helpers it exports (`parseArgs`, now exported, `parseQuota`, `quotaStop`, `authStop`, `ancestorMemoryFiles`). The old runner already takes `--plugin-dir none` for a floor, but only one plugin directory and no outcome score; the resume prompt of 2026-09-24 said the floor needed a runner change too, which was only half right. Before a run it checks that each source copy is the plugin named and sits at its pinned sha, and refuses a fixture with a memory file above it. The scorer is `scripts/lib/bench-score.cjs`. Tests first, red before green (`tests/bench.test.cjs`): branch to command line (plugin dirs and the inline settings), the matcher on written answers (found, missed, a decoy flagged, a decoy called safe), usage summed over models, median and spread, and the refusal to compare tokens across differing tool counts. Results go to `evals/results/<date>-bench-<task>.md` (untracked) with every scored answer beside it; the numbers that matter are copied into this file with the command that produced them.

## Questions for the owner, decided 2026-09-24 (labels verbatim)

1. `security-guidance`: "Bỏ ở task 1, đưa vào build-01 (Recommended)". It is out of the `review-01` bundle; `build-01` brings it in, and its Python hooks in the isolated profile are asked about again then.
2. Prompt: "Cả hai". Both variants run: `natural`, the one sentence for every branch; `command`, the same sentence behind each branch's own command. K names `/bearingkit:bk-review`. S names `/pr-review-toolkit:review-pr`, because `/code-review` of the `code-review` plugin reviews a GitHub pull request only (its allowed tools are `gh pr …` and `gh issue …`), and the fixture is a local branch with no remote; the other source plugins stay loaded. F has no command, so the `command` variant runs K and S only: 15 sessions for the task, 9 `natural` and 6 `command`.
3. Runs and model: "3 lượt, Sonnet (Recommended)".

Mechanism checked before the run (compat B1 to B4): in the isolated profile each branch loaded exactly its plugins, and all three saw 31 tools, so token totals compare. `bearingkit bench --dry-run` found the four source copies at the shas pinned in `upstream/sources.json`.

## Measured · `review-01`, 2026-09-24

Claude Code 2.1.281, isolated profile, Sonnet 5 for every session (the kit's `bk-reviewer` agent runs on Opus whatever the session's model, compat B13), 31 tools in every init event. Commands: `bearingkit bench --task review-01 --config-dir _build/profile/claude --variants natural --runs 3`, the same with `--variants command`, then `--rescore` on both folders with the final rules. Results and every answer: `evals/results/2026-09-24-bench-review-01-natural/` and `…-command/` (untracked). Five-hour window 48% before the first run and 66% after the second (the same window also carried the DB question of the migration and this session's own work, so the benchmark's share is below 18 points).

| Variant | Branch | Passed | Defects found | Decoys | Tokens total, median (min–max) | Fresh tokens | Cost USD | Seconds |
|---|---|---|---|---|---|---|---|---|
| natural | K kit | 3 of 3 | 3 | 0 | 795,055 (708,466–836,053) | 110,277 | 0.77 (0.59–0.77) | 161 (72–173) |
| natural | S sources | 3 of 3 | 3 | 0 | 383,709 (270,249–387,198) | 35,317 | 0.27 (0.18–0.29) | 75 (51–86) |
| natural | F floor | 3 of 3 | 3 | 0 | 181,677 (179,523–219,189) | 13,981 | 0.11 (0.10–0.12) | 38 (35–40) |
| command | K `/bearingkit:bk-review` | 3 of 3 | 3 | 0 | 577,098 (536,923–842,828) | 71,470 | 0.58 (0.46–0.59) | 129 (129–143) |
| command | S `/pr-review-toolkit:review-pr` | 3 of 3 | 3 | 0 | 177,407 (177,318–266,282) | 23,089 | 0.15 (0.15–0.16) | 47 (39–49) |

What it says:

- **Outcome: no difference.** All fifteen sessions found D1, D2 and D3 and none flagged the decoy, the floor included. The script's credit for D3, the one outside the diff, was read against each of the nine natural answers by eye: every one names the reminder job and the `void` status. So `review-01` does not separate the branches: Sonnet 5 with no plugin finds all three.
- **Cost: the kit loses.** With the same outcome, the kit spent 2.1 times the tokens of its sources on the natural prompt and 3.3 times on the command prompt (medians), 4.4 times the floor's; in cost, 2.9 and 3.9 times the sources' and 7 times the floor's. Part of it is the kit's design as it ships: `bk-review` forks and hands the hot path to `bk-reviewer` on Opus.
- **So on this task `bk-review` is not better than its sources; it costs more for the same result.** That is the finding to carry, not a reason to stop measuring: one easy task says nothing about defects the floor misses, which is where a review skill has to earn its tokens.

Read with it:

- **The natural prompt never reached a source skill.** In all three S sessions the model invoked the host's own `/code-review` (listed bare in every branch, compat B10), not a plugin's. The natural S row measures the host's built-in review with the source plugins loaded.
- **`/pr-review-toolkit:review-pr` ran but skipped its agents.** The command expanded (the model ran its `gh pr view` step), then decided the diff was small and reviewed it inline. That is the released command's own behaviour.
- **The kit's fork was refused tools** in the isolated profile: listing its own folder, and PowerShell and Glob for the background reviewer (compat B12). It finished anyway; whether it would cost less or find more with them is not measured.
- The independent review before the run noted that D1 to D3 match the lenses `bk-review` took from `security-guidance`, which S does not load. With the floor finding all three, that advantage did not show.
- One session (K1, natural) was woken by its background reviewer after its first answer; durations and turns are summed over its two result events (compat B11). A K command session reports 0 turns because the whole review ran inside the fork.

Next for this skill: a harder `review-02` whose difficulty is calibrated on the floor first. Candidate defects run three times on F, and a defect enters the task only if the floor misses it in at least two of three; then the three branches run. Until then, `bk-review` against its sources reads "compared on one task: equal outcome, 2 to 3 times the tokens".
