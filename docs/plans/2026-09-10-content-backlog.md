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
