# Working on the Bearingkit repository

This file is for agents developing the kit itself. Claude Code reads it through `CLAUDE.md`; Antigravity reads it directly. The product's own instruction file is `core/AGENTS.md`; do not confuse the two.

## Where the truth lives

- Design: `docs/specs/` (current: `2026-09-10-bearingkit-v1-design.md`; decisions log is its §19).
- Owner migration: `docs/plans/2026-09-10-owner-migration.md`.
- Session state, open threads, pending decisions: the newest file in `docs/handoff/`. Read it first when resuming; rewrite it before the last commit of a session.
- Nothing important lives only in chat history. If a decision or fact is not in the repo, it does not exist for the next session.

## Conventions

- Reply in the language the maintainer writes in (currently Vietnamese). Short replies: one verdict, the rejected options, no theatrics, no formulaic confirmation prompts.
- Every major block of work ends with two clearly separated lists, "done" and "remaining", so the maintainer can follow progress at a glance (owner's instruction, 2026-09-10).
- Autonomy: ACT (do it, then report) for anything inside this repository. COUNCIL (propose, then wait) for design or scope changes and for anything that touches `~/.claude`, `~/.gemini`, other repositories, or any server. When unsure, COUNCIL.
- Repository conventions win over skill defaults: specs in `docs/specs/`, plans in `docs/plans/`, handoffs in `docs/handoff/`. Never create `docs/superpowers/` or `.planning/`.
- Never print environment variables or secret-looking values in tool output; redact `*_API_KEY`, tokens, passwords. If something leaks, say so and ask the owner to rotate it.
- Never quote numbers (stars, versions, counts) you have not verified; say "unverified" and grade the source.
- The owner's production SaaS repository and server are out of scope. The kit never reads or modifies them; their lessons are already anonymized in spec §18.
- Commits: conventional commits, no attribution lines, LF endings, no BOM. Push after each coherent change.
