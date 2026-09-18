# Content program: from thirty sources to one standard skill set

Status: IN PROGRESS · Step 1 done 2026-09-18 (`docs/specs/2026-09-18-item-inventory.md`, 20 of 22 sources; catalog confirmed, D5 question 27) · Spec: `docs/specs/2026-09-11-bearingkit-v2-design.md` §5, §16 · Planned 2026-09-11, after the v2 restructure plan.

The owner's requirement (2026-09-11): cover every source in the coverage matrix, classify the overlapping skills across them, and distill them into the kit's own skills, raised to the quality bar of spec §5.3, covering the work of a one-person software company that drives AI agents.

## Step 1 · Inventory (one session)

- One research agent per source with a local or fetchable copy: Superpowers, the official plugins repository, fullstack-dev-skills, Spartan (ideas only until its license is verified), the ClaudeKit remnants on the workstation (ideas only), mattpocock/skills, addyosmani/agent-skills, karpathy-skills, spec-kit, anthropics/skills (frontend-design, mcp-builder), vercel agent-skills, awesome-cursorrules (rule sets, for the stack files), cloudflare/skills, the owner's previous kit. Sources without a local copy are fetched into the gitignored `_build/upstream/` with the sha recorded in `upstream/sources.json`.
- Each agent returns rows: source item · what it does in one line · kit skill it maps to · decision (absorb, idea, drop) · reason · license note. The prompt gives the agent the catalog and taxonomy of spec §5.1, the dedup rule of §5.2 and the quality bar of §5.3, never the conversation.
- Merge into `docs/specs/<date>-skill-inventory.md`; the owner's agent resolves conflicts and fixes the final catalog and the packs. Gaps found by the audit of 2026-09-11 are checked here: product discovery, AI-feature engineering, dependency hygiene, infrastructure and deploy depth, a light UX flow.

## Step 2 · Per-skill sprints (one short session each, lifecycle order)

Order since 2026-09-18 (D5 question 27): `bk-ops`, `bk-db`, `bk-map`, `bk-research`, `bk-perf`; then the existing skills, distilled from their inventory rows (`bk-spec`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-next`, `bk-audit`, `bk-design`, `bk-setup`); then the packs `bk-product` and `bk-agent`. Until then the order was the lifecycle chain first, then the domain skills, then packs. Done: `bk-ops` (2026-09-18, Claude Code; Antigravity after the copy is reinstalled). For each skill: read the inventory rows assigned to it, read the sources they name, write or revise the body and references, add or refresh `tests/` (three prompts), extend the activation set, run the acceptance test once on Claude Code, record provenance, commit. Mandatory sources already sequenced in `2026-09-10-content-backlog.md` keep their order inside this step.

## Step 3 · Stack files

`skills/bk-build/references/stacks/<stack>.md` for the eight stacks of spec §5.5, each written from the matching awesome-cursorrules set, fullstack-dev-skills expert, vendor docs and the owner's field lessons, with a version card (the mechanism, who refreshes it and when: spec §16).

## Step 4 · Release gate v0.2

Activation set on both hosts, token reading, skill tests, acceptance tests; numbers into `docs/compat/`; matrix measurement column filled; CHANGELOG; tag; the shas landed today in `upstream/sources.json` become the drift-watch baseline (spec §16).

## Rules for every sprint

- Substance over structure: decision rules, checklists and failure patterns are taken; folder defaults, flowcharts, shouting and per-platform sections are not.
- No text from a source without a verified permissive license; ideas are re-written clean-room.
- A body line without a source or a field lesson behind it is removed.
- Measurements only at Step 4; a sprint ends with tests green and one acceptance run, nothing more.
- Below a stated confidence on a stack major newer than the model's training, the agent writing that reference text consults context7 or `bk-research` first, never from memory — the same rule the finished skill applies at runtime (`skills/bk-protocol/references/evidence.md:7`; mechanism and cadence: spec §16).
