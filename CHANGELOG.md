# Changelog

All notable changes to Bearingkit. The format follows Keep a Changelog; versions follow semver. This is the single changelog.

## Unreleased · 0.1.0 (Phase 1 in progress)

### Added
- `docs/specs/2026-09-10-coverage-matrix.md`: one row per source the kit replaces or absorbs (Superpowers, the official plugins, spec-kit, ClaudeKit, Spartan, context7, Skillmark, fullstack-dev-skills, vercel agent-skills, document-skills, the owner's previous kit, Antigravity docs), with status and the measurement each "better" claim rests on; rows for the owner's remaining repositories to follow.
- `core/AGENTS.md`: the protocol (autonomy gate, router with intent table, evidence rules, council, definition of done, hot paths, host notes), 53 lines. The router says to invoke the matching skill before reading or searching code; without that sentence the model explored first and never invoked.
- `bk-protocol` hidden reference skill with gate patterns, personas, host tool map, evidence and council formats, RBA-lite, correction cues, the two-block handoff template.
- Ten protocol skills: `bk-next`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`. Frontmatter values are quoted (strict YAML; Antigravity dropped bare values with `: `), guarded by `tests/skills.test.cjs`.
- `scripts/detect-stack.cjs`: stack profile from manifests (Node, PHP, Python, Gradle, CMake, .NET, Go, Rust) with guardrail commands, hot-path globs, version card and PATH parity check.
- Session state store (`core/hooks/lib/state.cjs`), host payload adapters for Claude Code and Antigravity (`core/hooks/lib/host.cjs`), and the `stack-profile` hook that injects at most 120 tokens only when the session state changed, re-arms after compaction and no-ops inside subagents. The injected block closes with `[/bearingkit]` so a terse request after it is not read as context.
- `scripts/record-guardrail.cjs`: the writer for guardrail runs and independent reviews that the push gate reads.
- Activation eval set (60 prompts, six intents, two negatives per intent, English and Vietnamese) with a runner for Claude Code (`claude -p` stream parsing, `expect` alternatives `a|b`, an equivalence map for baseline runs against another setup, `--intent`/`--id`/`--per-intent` filters where `--per-intent` takes a spread per intent, quota read from the stream with a stop at 90% of the five-hour window) and a checklist for Antigravity. `evals/fixtures/sample-app` is staged in a directory whose ancestors carry no memory files (beside the repository by default; throwaway git history; `--stage-only` prints the path) and used as the working directory, so prompts have something to point at and neither the repository's own `CLAUDE.md` nor a daily profile under the home directory loads through the ancestor chain; the runner refuses to run otherwise. The staged copy is reset to its staging commit before every prompt, since sessions edit and even commit files.
- Adapters: Claude hook registrations, model map, plugin manifest; Antigravity plugin manifest and hook template (named-hook wrapper, one `PreInvocation` handler); `core/mcp.json` (context7); `core/rules/security-baseline.md`. On Antigravity the install is one directory under `~/.gemini/config/plugins/` (junction, or a copy with `--antigravity-copy`); no registry file is written; the hook command is relative and points at a generated launcher inside the plugin, because the host resolves command tokens against the plugin directory.
- `bin/bearingkit.cjs install --dev <repo>` for both hosts with backups scoped to the hosts a run touches, idempotent settings merges, a secrets-only deny list, `--config-dir` for an isolated Claude profile, `--dry-run`, and `uninstall` that removes exactly what was added.

### Measured (Claude Code 2.1.266, isolated profile)
- Compatibility tests 1, 3, 6, 8, 9 plus the import and rules checks passed; gate runs on 2.1.267 after an auto-update (`docs/compat/2026-09-10-tests-1-3.md`, `docs/compat/phase-1-gate.md`).
- Activation on the six Phase 1 intents: 48/48 positives routed, 0 false activations on pure questions, after one tuning round on the `bk-review` and `bk-ship` descriptions and two label corrections (`docs/compat/phase-1-gate.md`).
- Confirmation: one clean sixty-prompt run at 57/60 with 0 false activations; its three misses led to a widened label, narrower `bk-build` cues and the closing marker on the injected block; the affected intents rerun at 10/10 (`docs/compat/phase-1-gate.md`).
- Fixed context of the kit: about 2,650 tokens of the 5,000 budget (`/context` on 2.1.267 in the isolated profile: memory files 1.9k, ten skill descriptions 750, no agents yet); host overhead outside the budget in the same session was 3.4k system prompt, 28.3k tool definitions and 2.75k built-in skills.

### Not yet
- A clean baseline run 2 (run 1 recorded: 11/18 with the equivalence map, positives routed 6/12, 0 false activations; its sessions shared and edited the fixture), next quota window.
- Antigravity: installed as a plugin junction; compatibility tests 2 and 7 (runtime confirmation) and activation by hand pending; test 4 recorded as a manual step. Test 5 (hook predicate) waits for Phase 2.
- Language rules, agents, the two enforcing hooks and `hot-path-flag` (Phase 2). `README`, `LICENSE`, `NOTICE`, `upstream/sources.json` (Phase 4).
