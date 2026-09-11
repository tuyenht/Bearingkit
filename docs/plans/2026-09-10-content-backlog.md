# Content backlog for Phase 1 and 2 writing

Status: OPEN · Spec: `docs/specs/2026-09-10-bearingkit-v1-design.md` · Source: the 2026-09-10 re-read of every research report produced while designing the kit

These are reference items, not design changes. Each names the file it belongs in. Identifying details of the owner's projects are omitted; the lessons are generic.

## `core/rules/sql.md` and `core/rules/php-laravel.md`

- Tenant or row isolation is enforced by the database engine (policies, constraints), never by application discipline alone.
- Migrations run under a privileged role; the runtime role is restricted.
- Column "graduation" rule: a JSON attribute becomes a real column once it is filtered, sorted or joined on.
- No native ENUM columns; use a lookup table or a checked text column.
- Never self-upgrade a framework major inside a task; no heavy dependency without a recorded decision.
- Long-lived worker reload matrix: which change classes (config, routes, container bindings, compiled views, env) need a worker restart versus running in a fresh process. Belongs in `php-laravel.md` and `bk-ops`.

## `bk-review` references

- The hotlist in the project's instructions is abbreviated; compare against the full checklist before signing off.
- When no diff is given, fetch it (`git diff` against the base) instead of asking.
- Lens items beyond spec L18: N+1 and per-request query budget; unbounded user-payload sizes (denial of service); slug collision that surfaces as a 500; redirect chains after a rename; hard-coded locale.
- SEO lens, outside what Lighthouse or axe check: server-rendered markup, semantic headings, canonical and Open Graph tags, JSON-LD, sitemap and robots, breadcrumbs, `rel=prev/next`.

## `bk-spec` and `bk-plan` references

- Per-entity definition of done template: tenant key and isolation, i18n pattern, boundary validation plus a database constraint, an index derived from real queries plus a query budget, an audit entry on sensitive change, an architecture test per invariant.
- Plan validation: three to eight questions on assumptions, risks, trade-offs and architecture before the plan is accepted.
- Council report shape: scope · method · verdict · evidence table with `file:line` and severity · what was done well · locked-constraint note.

## `bk-design` references

- Design-token validator: flag utility classes or variants not declared in the theme (they fall back to defaults silently) and background tokens used as text colours.

## `bk-build` and `bk-test` references (v1.1)

- Guardrail archetypes: schema-introspecting coverage test; regex or AST chokepoint test; concurrency hammer against the live worker pool.
- Branch-topology assistant: detect squash merges and emit the `rebase --onto` recipe (`bk-next`, v1.1).

## Phase 2 seeding step (owner's explicit ask)

- Run the official `claude-code-setup` recommender once on three representative projects of different stacks; collect its hook, MCP and subagent suggestions; adopt into `core/` only what repeats across projects; never apply its per-project output to a project. Antigravity's built-in customization guide plays the same role there.

## `evals/`

- `--changed` mode: run only skills changed since the last commit.
- Lint allowlists require a written reason.
- Publish cost per tier (static, LLM-judged, end-to-end) so contributors know what a run costs.

## Mandatory sources (owner's requirement, 2026-09-10), first work of Phase 2

Each item ports substance, not structure: the source's decision rules, checklists and failure patterns go into `references/` of the target skill (≤100-line bodies stay as they are), with the source named in `NOTICE` and recorded in `upstream/sources.json`. The coverage matrix row moves to "absorbed" when the item closes.

1. **Superpowers 5.1.0 (MIT, cached at the owner's plugin cache).** `bk-spec/references/brainstorming.md` (one question at a time, options before design, the design-to-spec handoff); `bk-plan/references/writing-plans.md` (bite-sized tasks, no placeholders, self-review against the spec); `bk-build/references/executing.md` (executing-plans, subagent-driven development with the two-stage review, dispatching parallel agents, worktrees); `bk-test/references/tdd.md` (red, green, refactor; the rationalisations list); `bk-debug/references/systematic-debugging.md` (four phases, root-cause tracing, condition-based waiting, defense-in-depth); `bk-review/references/code-review-exchange.md` (requesting and receiving review); `bk-ship/references/finishing.md` (finishing a development branch, verification before completion); `bk-protocol/references/meta-routing.md` (what using-superpowers does that the router must keep). writing-skills becomes a `doctor` check on `core/skills/`.
2. **Official code-review and pr-review-toolkit (Apache-2.0; fetch the repository first, no local copy).** `bk-review/references/method.md` (the review flow), `bk-review/references/lenses.md` (the toolkit's lenses, merged with the owner's lenses already listed above), the test lens into `bk-test/references/`. `NOTICE` entry for the plugin repository.
3. **Official frontend-design (Apache-2.0).** `bk-design/SKILL.md` plus `references/distinctive-ui.md`; the kit adds the critic pass the plugin lacks (contrast, reduced motion, focus order, asset budgets, from the owner's design-critic).
4. **Official claude-code-setup (Apache-2.0).** The seeding step (already listed above) and `doctor`: on a repository, produce the recommendation the plugin would, then apply what the kit already provides and list the rest.

Exit criterion for the group: the outcome benchmark (spec §17) runs against a Superpowers-only profile and the kit matches or beats it; numbers in `docs/compat/`.

## Follow-ups from the owner's repository list (2026-09-11), after the mandatory group

Rows 13–24 of the coverage matrix. Each item lands with the same discipline as the mandatory group (references over structure, `NOTICE`, `upstream/sources.json` derived map, matrix row status).

1. **karpathy-skills (ideas only, no license file).** Two protocol lines: scope discipline (edit only what the task names) as a `bk-build` gate sentence, "no speculative abstraction" as a protocol sentence in `core/AGENTS.md`; re-measure fixed context.
2. **mattpocock/skills (MIT).** `bk-spec/references/grill-me.md` (question until nothing is ambiguous, merged with brainstorming's one question at a time); diagnose and triage checklists into `bk-debug/references/`; zoom-out and improve-codebase-architecture into `bk-audit/references/`; compare its handoff with the two-block template and take what is missing.
3. **addyosmani/agent-skills (MIT).** interview-me, idea-refine and doubt-driven questions into `bk-spec/references/`; task-breakdown rules into `bk-plan/references/`; incremental-implementation into `bk-build/references/`; context-engineering checks into `doctor`.
4. **awesome-cursorrules (CC0).** When each of the eight language rules is written, read the matching set first and cite it.
5. **Verification tools.** `core/mcp.json` gains an opt-in playwright-mcp entry; `bk-test` and `bk-design` name one browser tool per install (agent-browser or playwright-mcp); `doctor` reports agent-browser and biome/Pint presence; `detect-stack` lists biome, Pint and PHPStan as guardrail commands when configured (unit test on a fixture).
6. **pr-agent (MIT).** `bk-review`'s independent-review definition accepts a pr-agent run on CI as the second context; the outcome benchmark gets a row comparing findings on the seeded-bug fixture.
7. **Aider (ideas).** The repo-map idea (definitions of every file, compressed) informs `bk-map`.
8. **Phase 3 and 4 candidates, no work now.** mcp-builder as an optional skill; Cloudflare skills only behind a `wrangler.toml` detection; the reference MCP servers in the opt-in list; the `npx skills` CLI as a secondary install channel; OpenCode, gemini-cli and Cline as host candidates with their own compatibility tests.
