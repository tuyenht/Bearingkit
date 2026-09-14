# Bearingkit

A protocol and skill set that makes an AI coding agent work like a disciplined senior team: classify the request before acting, propose only when the blast radius demands it, prove before claiming, hand off cleanly. One `skills/` source in the Agent Skills format, installed into each host with the host's own command.

## Install

| Host | Command |
|---|---|
| Claude Code | `/plugin marketplace add tuyenht/Bearingkit` then `/plugin install bearingkit@bearingkit`; development: `claude --plugin-dir <checkout>` |
| Antigravity 2.0 | `npx bearingkit antigravity install` |
| Gemini CLI | `gemini extensions install https://github.com/tuyenht/Bearingkit` |
| Cursor, Codex, Copilot CLI, Factory Droid | manifests are in place; listed as supported after their acceptance test |

Install separately for each host you use. Details, uninstall and the acceptance status per host: [docs/hosts.md](docs/hosts.md).

## What you get

- **The protocol** (`skills/bk-protocol/SKILL.md`), loaded at session start: the autonomy gate (ACT acts and reports; COUNCIL proposes and waits), a router from intent to skill, evidence rules, the council format, the definition of done, hot-path review, a security baseline.
- **Skills**, invoked by the router from plain language in English or Vietnamese: `bk-spec`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-audit`, `bk-next`, `bk-design`; the remaining core skills (`bk-map`, `bk-research`, `bk-perf`, `bk-db`, `bk-ops`) arrive with v0.3. Each skill is a short body with gates and the evidence it must paste, plus references read on demand.
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
