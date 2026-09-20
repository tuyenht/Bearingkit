# Bearingkit

A protocol and skill set that makes an AI coding agent work like a disciplined senior team: classify the request before acting, propose only when the blast radius demands it, prove before claiming, hand off cleanly. One `skills/` source in the Agent Skills format, installed into each host with the host's own command.

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
| Claude Code | acceptance passed; install with `claude plugin marketplace add <repo or checkout>` then `claude plugin install bearingkit@bearingkit`, activate per project as above; development: `claude --plugin-dir <checkout>` |
| Antigravity 2.0 and the IDE | acceptance passed; `bearingkit install` writes the store, `bearingkit activate` declares it in a project. That a declared store loads is the host's documented mechanism and is still being verified on the app (`docs/specs/2026-09-19-per-project-activation-design.md`); until then `bearingkit antigravity install` installs the older global copy, which every workspace loads |
| Gemini CLI | `gemini extensions install https://github.com/tuyenht/Bearingkit`; acceptance pending |
| Cursor, Codex, Copilot CLI, Factory Droid | manifests are in place; listed as supported after their acceptance test |

Details, uninstall and the acceptance status per host: [docs/hosts.md](docs/hosts.md).

## What you get

- **The protocol** (`skills/bk-protocol/SKILL.md`), loaded at session start: the autonomy gate (ACT acts and reports; COUNCIL proposes and waits), a router from intent to skill, evidence rules, the council format, the definition of done, hot-path review, a security baseline.
- **Skills**, invoked by the router from plain language in English or Vietnamese: `bk-spec`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-audit`, `bk-next`, `bk-design`, `bk-setup`, `bk-ops`, `bk-db`, `bk-map`; the remaining core skills arrive with v0.3, in the order `bk-research`, `bk-perf`. Each skill is a short body with gates and the evidence it must paste, plus references read on demand.
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
