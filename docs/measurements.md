# Bearingkit measurements: an English index

This page lists every number quoted on [bearingkit.dev](https://bearingkit.dev) and in the README, with where it is recorded and how to check it. It holds no number of its own. The project's dashboard is [`docs/status.md`](status.md), written in Vietnamese and rewritten each session; where the two differ, `docs/status.md` is right and this page is stale.

Last checked against `docs/status.md`: 2026-10-09.

## Counts

| Number | Value | How to check |
|---|---|---|
| Skills | 17, plus the protocol (`bk-protocol`) | `ls skills/` |
| Agents that passed the acceptance test | 2: Claude Code, Antigravity 2.0 app | [`docs/hosts.md`](hosts.md) |
| Routing test prompts | 96, of which 44 Vietnamese and 52 English | `evals/activation/phase-1.jsonl`, field `lang` |
| Automated tests | 248 passing, 0 failing, on Windows, 2026-10-09 | `node --test tests/*.test.cjs` |
| Sources studied | 23 | `upstream/sources.json` |
| Source items inventoried | 1,295 from 22 sources: 46 to adapt, 610 kept as ideas, 639 dropped | `node scripts/inventory-items.cjs totals docs/specs/2026-09-18-item-inventory.md` (the inventory itself is in Vietnamese) |
| Stack rule files in `bk-build` | 8 | `ls skills/bk-build/references/stacks/` |
| Fixed context on Claude Code | about 4,010 tokens against a budget of 5,000: a figure carried forward from 2026-09-23, after `bk-research` and before the 17th skill; not re-read since | `docs/status.md`, section 2, row 5 |

## Routing: does a request open the right skill

- Measured on the 60-prompt core set (six intents: question, small change, feature, bug, review, ship).
- Claude Code, 2026-09-16: recall 0.958, precision 1.000. Antigravity 2.0, 2026-09-17, rescored 2026-09-20: recall and precision 0.979.
- That run predates `bk-db`, `bk-ops`, `bk-map`, `bk-research` and `bk-perf` (their design files in `docs/specs/` are dated 2026-09-18 to 2026-09-23). Their prompts are in the 96-prompt set and have not been re-run.
- Record: [`docs/compat/2026-09-16-daily-driver-gate.md`](compat/2026-09-16-daily-driver-gate.md).
- Routing says nothing about the quality of the code that follows.

## Each skill against the skills it was adapted from

Same task, starting code, model and agent on both sides; small samples. A skill with no row here has not been compared, and nothing says it is better than its source.

| Skill or file | Result | Record |
|---|---|---|
| `bk-review` | equal outcome on one task; the kit used 2 to 3 times its sources' tokens | [`2026-09-24-benchmark-kit-vs-sources-design.md`](specs/2026-09-24-benchmark-kit-vs-sources-design.md) |
| `bk-debug` | equal outcome | `docs/status.md`, section 2, row 7; design: [`2026-09-25-bk-debug-design.md`](specs/2026-09-25-bk-debug-design.md) |
| `bk-plan` | met its registered bars on task `plan-01` with `claude-sonnet-5-5`, on the second run; better than `superpowers:writing-plans` on that task and that model only; median cost 1.27 times the source's | [`2026-10-03-bk-plan-design.md`](specs/2026-10-03-bk-plan-design.md) |
| `node.md`, `python.md`, `php-laravel.md` | no clear difference (`node-01` p = 1.0, `py-01` p = 0.2, `php-01` p = 1.0; eight sessions a side) | `docs/status.md`, line "Mốc v0.3"; designs: [`2026-09-26-stack-node-python-design.md`](specs/2026-09-26-stack-node-python-design.md), [`2026-09-28-stack-php-laravel-design.md`](specs/2026-09-28-stack-php-laravel-design.md) |
| `shell.md` | above using no skill and above a pack with no shell skill, on a PowerShell 5.1 task, repeated on a second day; against its own source, no clear difference | [`2026-10-01-stack-shell-design.md`](specs/2026-10-01-stack-shell-design.md) |
| `c-cpp.md` | no clear difference from one of its two sources; the other was not compared | [`2026-10-08-stack-c-cpp-design.md`](specs/2026-10-08-stack-c-cpp-design.md) |

## Cost

- Against its sources, where cost was recorded: about 1.3 times (`plan-01`) to 3 times (`review-01`) the tokens.
- Against using no skill at all: about 1.9 to 2.1 times on three tasks with Sonnet (`debug-01`, `test-01`, `build-01`), and about 7 times on `review-01`, which uses an Opus reviewer. Recorded in `docs/status.md`, section 2, row 7.

## Not shown

- No task yet meets the v1.0 bar: at least the sources' pass rate and fewer tokens.
- Bearingkit has not been measured against a hand-assembled stack of packs. The design is proposed, no session has run: [`2026-10-08-kit-vs-stack-proposal.md`](specs/2026-10-08-kit-vs-stack-proposal.md).
- Antigravity IDE has not passed the acceptance test. Gemini CLI, Cursor, Codex, Copilot CLI and Factory Droid are untested.
