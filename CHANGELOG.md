# Changelog

All notable changes to Bearingkit. The format follows Keep a Changelog; versions follow semver. This is the single changelog.

## Unreleased · 0.1.0 (Phase 1 in progress)

### Added
- `core/AGENTS.md`: the protocol (autonomy gate, router with intent table, evidence rules, council, definition of done, hot paths, host notes), 53 lines.
- `bk-protocol` hidden reference skill with gate patterns, personas, host tool map, evidence and council formats, RBA-lite, correction cues, the two-block handoff template.
- Ten protocol skills: `bk-next`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`.
- `scripts/detect-stack.cjs`: stack profile from manifests (Node, PHP, Python, Gradle, CMake, .NET, Go, Rust) with guardrail commands, hot-path globs, version card and PATH parity check.
- Session state store (`core/hooks/lib/state.cjs`), host payload adapters for Claude Code and Antigravity (`core/hooks/lib/host.cjs`), and the `stack-profile` hook that injects at most 120 tokens only when the session state changed, re-arms after compaction and no-ops inside subagents.
- `scripts/record-guardrail.cjs`: the writer for guardrail runs and independent reviews that the push gate reads.
- Activation eval set (60 prompts, six intents, negatives included) and a runner for Claude Code plus a checklist for Antigravity.
- Adapters: Claude hook registrations, model map, plugin manifest; Antigravity plugin manifest and hook template; `core/mcp.json` (context7); `core/rules/security-baseline.md`.
- `bin/bearingkit.cjs install --dev <repo>` for both hosts with backups, idempotent settings merges, a secrets-only deny list, `--config-dir` for an isolated Claude profile, `--dry-run`, and `uninstall` that removes exactly what was added.
- Compatibility tests 1 and 3 passed on Claude Code 2.1.266 (`docs/compat/2026-09-10-tests-1-3.md`).

### Not yet
- Phase 1 gate measurements (isolated profile, activation 10/10, fixed tokens ≤5,000) and compatibility tests 2, 4–8.
- Language rules, agents, the two enforcing hooks and `hot-path-flag` (Phase 2).
