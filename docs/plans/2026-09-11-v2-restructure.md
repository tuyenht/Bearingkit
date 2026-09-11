# Bearingkit v2 restructure plan

Status: IN PROGRESS 2026-09-11 · Spec: `docs/specs/2026-09-11-bearingkit-v2-design.md` · Executed in one session, tasks in order, each verified before the next.

**Goal:** Move the repository to the v2 layout (skills at the root, one bootstrap per host, no installer, no rule layer), keep every skill and reference unchanged in substance, and prove the result on Claude Code and Antigravity with the acceptance test.

**Architecture:** see spec §3, §4, §6. Nothing is generated at build time except the Antigravity plugin copy.

**Conventions:** LF, no BOM, conventional commits, evidence pasted in the handoff; nothing under `~/.gemini` is written before Task 9, which the owner approved with the plan.

## Tasks

- [x] **Task 0: unlink the v1 install from the isolated Claude profile** with the v1 installer before it is deleted (`uninstall --dev <repo> --config-dir _build/profile/claude`). Check: no `skills/bk-*` junctions, no import line, no kit entries in `settings.json`.
Progress 2026-09-11: Tasks 0–9 done (44 tests green; Claude Code acceptance passed on 2.1.268); Task 10 half done (copy refreshed, acceptance waits for the app); Task 11 closes the session.

- [x] **Task 1: move `core/skills` to `skills/`** (`git mv`). `bk-protocol/SKILL.md` becomes the protocol body (from `core/AGENTS.md`), the security baseline appended, the references table kept, hidden-skill frontmatter kept. Delete `core/AGENTS.md`, `core/rules/`, `core/mcp.json`, `core/hooks/stack-profile.cjs`, `core/hooks/lib/host.cjs`; move `core/hooks/lib/state.cjs` to `scripts/lib/state.cjs`. Check: `tests/skills.test.cjs` (path updated) green.
- [x] **Task 2: replace the stack-block wording** in every SKILL.md and reference ("the `[bearingkit]` stack block" → the stack profile from `detect-stack`); update `host-tools.md` and `personas.md` intro. Check: `grep -r "\[bearingkit\]" skills` finds nothing.
- [x] **Task 3: host wiring**: `.claude-plugin/{plugin.json,marketplace.json}`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json`, `GEMINI.md`, `.antigravity/plugin.json`, `hooks/hooks.json`, `hooks/hooks-cursor.json`, `hooks/session-start.cjs`. Delete `adapters/`, `scripts/install.cjs`, `tests/install.test.cjs`, `tests/host.test.cjs`, `tests/stack-profile.test.cjs`, `tests/fixtures/payloads/`. Check: `tests/manifests.test.cjs` and `tests/session-start.test.cjs` green.
- [x] **Task 4: agents/**: four files from `personas.md` with the v1 §8 fields. Check: `tests/agents.test.cjs` green.
- [x] **Task 5: `scripts/antigravity.cjs`** (install, uninstall, `--dest`, `--dry-run`, marker file), `bin/bearingkit.cjs` commands `evals`, `antigravity`, `doctor` placeholder; `antigravity-evals.cjs` arms without a pre-existing `hooks.json`. Check: `tests/antigravity-install.test.cjs` on temp directories green.
- [x] **Task 6: evals runner** passes `--plugin-dir <repo>` by default (`--plugin-dir none` for baselines). Check: `tests/evals.test.cjs` green; a one-prompt dry check reaches the CLI.
- [x] **Task 7: package.json `files`, `.gitignore`, `record-guardrail.cjs` require path.** Check: `node --test tests/*.test.cjs` all green.
- [x] **Task 8: docs**: banners on the v1 spec, the Phase 1 plan and the gate doc; `docs/hosts.md`; `README.md`; coverage matrix rows that named the installer; content backlog paths; migration plan install steps; evals README; CHANGELOG. Check: `grep -rn "core/\|adapters/\|bearingkit install" docs README.md` shows only historical mentions with a banner.
- [x] **Task 9: acceptance on Claude Code** with `claude -p --plugin-dir <repo>` in the isolated profile on the staged fixture: the gate question, then the react todo list prompt. Record in `docs/hosts.md`.
- [ ] **Task 10: Antigravity copy**: `antigravity install --dry-run`, then real; acceptance through the DevTools driver if the 2.0 app is reachable, else recorded as pending with the reason.
- [ ] **Task 11: handoff rewritten, commit, push.**
