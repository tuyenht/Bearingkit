# Working on the Bearingkit repository

This file is for agents developing the kit itself. Claude Code reads it through `CLAUDE.md`; Antigravity reads it directly. The product's own instruction file is `skills/bk-protocol/SKILL.md`, which `hooks/session-start.cjs` injects at session start; it was `core/AGENTS.md` until the v2 restructure (`97843c4`) removed `core/`. Do not confuse the two.

## Where the truth lives

- Design: `docs/specs/` (current: `2026-09-11-bearingkit-v2-design.md`; decisions log is its §15; the v1 spec stays for its §3 host mechanics and §18 field lessons).
- Owner migration: `docs/plans/2026-09-10-owner-migration.md`.
- Session state, open threads, pending decisions: the newest file in `docs/handoff/`. Read it first when resuming; rewrite it before the last commit of a session.
- Project status across sessions — milestone, per-item state, what is waiting on the owner: `docs/status.md`. It is a dashboard that only counts and points; it holds no decision of its own (questions and decisions stay in `docs/specs/2026-09-12-d5-owner-questions.md`). Rewrite it with the handoff, before the last commit of a session.
- Nothing important lives only in chat history. If a decision or fact is not in the repo, it does not exist for the next session.

## Conventions

- Reply in the language the maintainer writes in (currently Vietnamese). Short replies: one verdict, the rejected options, no theatrics, no formulaic confirmation prompts.
- Every major block of work ends with two clearly separated lists, "done" and "remaining", so the maintainer can follow progress at a glance (owner's instruction, 2026-09-10).
- Autonomy: ACT (do it, then report) for anything inside this repository, and for **reading** `~/.claude` or `~/.gemini` through a kit command whose no-write invariant is enforced by a test — today that is `bearingkit doctor`, measured by `tests/doctor.test.cjs`, which runs it in a home of its own and compares the tree byte for byte before and after. COUNCIL (propose, then wait) for design or scope changes, for any **write** under `~/.claude` or `~/.gemini` (`bearingkit antigravity install` and `uninstall`), for other repositories, and for any server. Reading those directories by any other means — an ad-hoc command, a tool with no such invariant — stays COUNCIL. When unsure, COUNCIL. (Owner's decision, 2026-09-15; question 21 of `docs/specs/2026-09-12-d5-owner-questions.md`.)
- Repository conventions win over skill defaults: specs in `docs/specs/`, plans in `docs/plans/`, handoffs in `docs/handoff/`. Never create `docs/superpowers/` or `.planning/`.
- Never print environment variables or secret-looking values in tool output; redact `*_API_KEY`, tokens, passwords. If something leaks, say so and ask the owner to rotate it.
- Never quote numbers (stars, versions, counts) you have not verified; say "unverified" and grade the source.
- The owner's production SaaS repository and server are out of scope. The kit never reads or modifies them; their lessons are already anonymized in spec §18.
- Commits: conventional commits, no attribution lines, LF endings, no BOM. Push after each coherent change.
