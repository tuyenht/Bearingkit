# Changelog

All notable changes to Bearingkit. The format follows Keep a Changelog; versions follow semver. This is the single changelog.

## Unreleased · 0.1.0 (Phase 1 in progress)

### Added
- `core/AGENTS.md`: the protocol (autonomy gate, router with intent table, evidence rules, council, definition of done, hot paths, host notes), 53 lines. The router says to invoke the matching skill before reading or searching code; without that sentence the model explored first and never invoked.
- `bk-protocol` hidden reference skill with gate patterns, personas, host tool map, evidence and council formats, RBA-lite, correction cues, the two-block handoff template.
- Ten protocol skills: `bk-next`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`.
- `scripts/detect-stack.cjs`: stack profile from manifests (Node, PHP, Python, Gradle, CMake, .NET, Go, Rust) with guardrail commands, hot-path globs, version card and PATH parity check.
- Session state store (`core/hooks/lib/state.cjs`), host payload adapters for Claude Code and Antigravity (`core/hooks/lib/host.cjs`), and the `stack-profile` hook that injects at most 120 tokens only when the session state changed, re-arms after compaction and no-ops inside subagents.
- `scripts/record-guardrail.cjs`: the writer for guardrail runs and independent reviews that the push gate reads.
- Activation eval set (60 prompts, six intents, two negatives per intent, English and Vietnamese) with a runner for Claude Code (`claude -p` stream parsing, `expect` alternatives `a|b`, an equivalence map for baseline runs against another setup, `--intent`/`--id`/`--per-intent` filters where `--per-intent` takes a spread per intent, quota read from the stream with a stop at 90% of the five-hour window) and a checklist for Antigravity. `evals/fixtures/sample-app` is copied to a temporary directory outside the repository (throwaway git history, `--stage-only` prints the path) and used as the working directory, so prompts have something to point at and the repository's own `CLAUDE.md` does not load through the ancestor chain.
- Adapters: Claude hook registrations, model map, plugin manifest; Antigravity plugin manifest and hook template; `core/mcp.json` (context7); `core/rules/security-baseline.md`.
- `bin/bearingkit.cjs install --dev <repo>` for both hosts with backups scoped to the hosts a run touches, idempotent settings merges, a secrets-only deny list, `--config-dir` for an isolated Claude profile, `--dry-run`, and `uninstall` that removes exactly what was added.

### Measured (Claude Code 2.1.266, isolated profile)
- Compatibility tests 1, 3, 6, 8, 9 plus the import and rules checks passed; gate runs on 2.1.267 after an auto-update (`docs/compat/2026-09-10-tests-1-3.md`, `docs/compat/phase-1-gate.md`).
- Activation on the six Phase 1 intents: 48/48 positives routed, 0 false activations on pure questions, after one tuning round on the `bk-review` and `bk-ship` descriptions and two label corrections (`docs/compat/phase-1-gate.md`).

### Not yet
- Fixed-token measurement with `/context` (target ≤5,000), the baseline run against the previous setup, and one clean confirmation run with the final descriptions.
- Antigravity: plugin entry, compatibility tests 2, 4, 7, activation by hand. Test 5 (hook predicate) waits for Phase 2.
- Language rules, agents, the two enforcing hooks and `hot-path-flag` (Phase 2). `README`, `LICENSE`, `NOTICE`, `upstream/sources.json` (Phase 4).
