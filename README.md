# Bearingkit

An operating protocol and skill set for **one-person software companies**: it makes the AI coding agent you already use work like a disciplined senior team — classify the request before acting, propose only when the blast radius demands it, prove before claiming, hand off cleanly.

It is **not tied to one tool**. One `skills/` source in the open Agent Skills format is installed into each host with that host's own command. **Claude Code** (as a plugin) and **Antigravity** (2.0 app and IDE) have passed acceptance; **Gemini CLI, Cursor and Codex** have their manifests in place and are listed as supported once their acceptance test passes.

## Why it exists

A capable coding agent left on defaults tends to fail in the same few ways: it edits before it understands the request, claims "done" without evidence, makes risky changes without asking, and loses the thread between sessions. Bearingkit is a small operating protocol plus a set of focused skills that close those gaps:

- **An autonomy gate.** Every request is classified first. Low-risk work inside the project is ACT (do it, then report); anything with a wide blast radius — design changes, data, servers, other repositories — is COUNCIL (propose, then wait for a human).
- **Evidence before claims.** A skill does not report success without pasting the command, test or measurement that shows it.
- **A lifecycle.** spec → plan → build → test → review → ship → close, with an independent reviewer on hot paths and a written handoff at the end of every session.
- **Loaded only where you turn it on.** Installed once per machine, activated per project; a project you have not activated sees nothing of it.
- **The same discipline on every host.** Switching between Claude Code and Antigravity — or adding another agent later — does not mean rewriting your rules: the protocol and skills are one source, and each host gets them through its own native mechanism.

It is written by a solo developer who runs a small software practice with AI agents doing most of the hands-on work, and it is used daily on that work. The question behind every part of it: *does this let one person do the work of a whole team, safely?*

## Status

Pre-release (`0.1.0-phase1`, tagged 2026-09-11; working towards v0.3). Started September 2026; MIT licensed. Figures below are as recorded in [`docs/status.md`](docs/status.md), which says how each was measured.

| | Today |
|---|---|
| Skills in the catalog | 18 of 18 (17 skills plus the protocol) |
| Hosts that passed acceptance | Claude Code, Antigravity (2.0 app and IDE); Gemini CLI, Cursor, Codex pending |
| Skill activation from plain-language prompts (EN and VI) | precision and recall ≥ 0.9 on both accepted hosts (Claude Code 2026-09-16: recall 0.958, precision 1.000) |
| Outcome benchmark against the source skills | in progress — **no task yet meets the v1.0 bar** (kit ≥ source on pass rate *and* fewer tokens); where a comparison has not been run, no text claims the kit is better |
| npm package, Claude Marketplace listing | not yet |

**How claims are made here.** Each skill is distilled from named open-source skills (see [`NOTICE`](NOTICE) and `upstream/sources.json`) and is judged against those sources — same task, fixture, model and host, run with the kit and with the source skills as they ship — not only against its own previous version. Results that did not replicate are recorded as such.

## Roadmap

- **v0.3** (current): the remaining lifecycle skills distilled and measured (`bk-spec`, `bk-ship`, `bk-close`), the last stack file, the v0.3 gate.
- **Publication**: npm package (`bearingkit`), a listing on the Claude Marketplace, README in English and Vietnamese, CI.
- **v1.0**: an outcome benchmark of 12 tasks against the source skills, `upstream-watch` to report changes in each source, acceptance on the remaining hosts.

The detailed plan is [`docs/plans/2026-09-26-v03-roadmap.md`](docs/plans/2026-09-26-v03-roadmap.md).

## Install once, use where you say

The kit is installed once for your machine and switched on per project: a project you have not activated sees nothing of it — no protocol, no skill in the listing, no hook.

```
bearingkit install                    # the store for Antigravity, and the two commands to run for Claude Code
cd <your project> && bearingkit activate
bearingkit status                     # what is installed, what this project has on, what is out of date
```

The other three verbs are `update` (pull the checkout, refresh the store), `deactivate` and `uninstall`. Every command takes `--host all|antigravity|claude` (default all; a host you do not have is skipped), a project path (default: the working directory), and `--dry-run`, which says what would change and writes nothing.

**How to spell `bearingkit`.** The package is not published yet, so today the command is the checkout's own entry point:

```
node <checkout>/bin/bearingkit.cjs status
```

After publication: `pnpm add -g bearingkit` (or `npm i -g bearingkit`) and then plain `bearingkit …`; `pnpm dlx bearingkit …` and `npx bearingkit …` run it once without installing, and both need the matching package manager on your PATH.

**What each host needs.** `activate` writes one entry in that host's own configuration file inside the project — `.agents/plugins.json` for Antigravity, `.claude/settings.local.json` for Claude Code — and nothing else; in a git clone both are ignored locally through `.git/info/exclude` unless you pass `--no-git-exclude`. Claude Code also needs its own two commands once per machine, because only its CLI may write under `~/.claude`; `bearingkit install` prints them, together with the `extraKnownMarketplaces` entry that makes Claude Code follow the repository on its own.

| Host | State |
|---|---|
| Claude Code | acceptance passed; install with `claude plugin marketplace add <repository URL>` (not a development checkout: the install copies untracked files too, `docs/hosts.md`) then `claude plugin install bearingkit@bearingkit`, activate per project as above; development: `claude --plugin-dir <checkout>` |
| Antigravity 2.0 | acceptance passed; `bearingkit install` writes the store, `bearingkit activate` declares it in a project. Measured on the app 2026-09-20: an activated project lists the kit's skills and runs its hooks, a project without the entry lists none of them ([docs/compat/2026-09-19-per-project-activation.md](docs/compat/2026-09-19-per-project-activation.md)) |
| Antigravity IDE | acceptance passed; it honours a project's `.agents/plugins.json` exactly as 2.0 does (measured 2026-09-20: the activated folder lists the kit's skills, and a running IDE picks the declaration up when the folder is opened) |
| Gemini CLI | `gemini extensions install https://github.com/tuyenht/Bearingkit`; acceptance pending |
| Cursor, Codex, Copilot CLI, Factory Droid | manifests are in place; listed as supported after their acceptance test |

Details, uninstall and the acceptance status per host: [docs/hosts.md](docs/hosts.md).

## What you get

- **The protocol** (`skills/bk-protocol/SKILL.md`), loaded at session start: the autonomy gate (ACT acts and reports; COUNCIL proposes and waits), a router from intent to skill, evidence rules, the council format, the definition of done, hot-path review, a security baseline.
- **Skills**, invoked by the router from plain language in English or Vietnamese: `bk-spec`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-audit`, `bk-next`, `bk-design`, `bk-setup`, `bk-ops`, `bk-db`, `bk-map`, `bk-research`, `bk-perf`. Each skill is a short body with gates and the evidence it must paste, plus references read on demand.
- **Agents** for hosts that define them: an independent reviewer, a researcher, a query optimizer, a design critic.
- **Provenance**: every adapted source is named in `NOTICE` and `upstream/sources.json`.

## Development

```
node --test tests/*.test.cjs
node bin/bearingkit.cjs evals --config-dir <isolated Claude profile>
```

Design: `docs/specs/2026-09-11-bearingkit-v2-design.md`. Session state for contributors: the newest file in `docs/handoff/`. Working agreement: `AGENTS.md`.

## License

MIT — see [LICENSE](LICENSE) (`Copyright (c) 2026 tuyenht`); third-party notices in [NOTICE](NOTICE).
