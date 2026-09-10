# Bearingkit v1 — Design Specification

Status: DRAFT v1.4 for owner review · Date: 2026-09-10 · Owner: tuyenht · Command prefix: `/bk-`

> **Tóm tắt (VI).** Bearingkit là bộ kỹ năng và tác nhân cho lập trình có AI hỗ trợ, dùng chung cho
> Claude Code và Google Antigravity từ **một nguồn duy nhất**. Lõi là "Kim chỉ nam": phân loại việc
> trước khi làm, hội đồng chỉ cho việc lớn, bằng chứng trước kết luận, cổng review độc lập cho đường
> nóng, bàn giao phiên. Kit hấp thụ cơ chế tốt nhất của Superpowers và plugin chính thức của Anthropic
> dưới giấy phép cho phép, học ý tưởng từ các bộ khác, và **không yêu cầu cài thêm bộ nào**. Dự án
> không cần cấu hình riêng: kit tự đọc manifest và tài liệu sẵn có. Mọi tuyên bố "tốt hơn" phải đo
> được. Bản 1.1 cắt 8 skill và 5 rules so với bản 1.0 sau audit, tách kế hoạch di trú máy của owner
> sang `docs/plans/`, và ẩn danh mọi chi tiết hệ thống riêng. Bản 1.2 chốt cài đặt một lệnh
> `npx bearingkit install` cho cả hai host, thay hai hook chặn đường dẫn bằng danh sách chặn gốc của
> host, định nghĩa kho trạng thái phiên, dàn bài `AGENTS.md`, mẫu mô tả skill và bảng chuỗi bàn giao.
> Bản 1.3 vá các lỗ hổng lộ ra khi đối chiếu lại toàn bộ báo cáo khảo sát: hook không chạy trong
> subagent, nạp lại trạng thái sau `/compact`, đo ở ngân sách liệt kê skill mặc định của host, kho tri
> thức DB đọc trực tiếp khi còn nhỏ, hợp đồng trả kết quả của subagent, quét bí mật lúc commit, ghi
> nguồn gốc từ kit cũ của owner, sửa năm mâu thuẫn. Bản 1.4 theo hai phản biện độc lập: cổng chỉ chặn
> lúc push và deploy, không chặn mỗi lượt hay mỗi commit; đo ngân sách trong hồ sơ host cách ly; review
> độc lập định nghĩa chung cho hai host; bỏ chặn thư mục thư viện; RBA chỉ cho việc COUNCIL; bảng ý định
> sang skill; giai đoạn giao hàng ghi trong spec; ẩn danh sâu hơn. Phần còn lại bằng tiếng Anh vì repo public.

---

## 1. Purpose, goals, non-goals

**Purpose.** One installable kit that makes an AI coding agent work like a disciplined senior team: understand before acting, propose only when the blast radius demands it, prove before claiming, hand off cleanly.

**Goals**

1. One source of truth (`core/`) serving Claude Code 2.1.x and Antigravity 2.0 (IDE, desktop app, `agy` CLI).
2. Zero per-project configuration. The kit reads the project as input; it never writes configuration into a project. It does write work products (plans, handoffs) into the project's conventional folders.
3. Fixed context cost under 5,000 tokens per session on Claude Code, measured with `/context`; comparable on Antigravity.
4. Skills activate from context with measured precision; a small set of deterministic hooks enforces only the invariants the model must never skip.
5. Every capability is traceable to a source with a license mode, and re-evaluated when the source changes.
6. Public-ready: MIT license, `NOTICE`, English docs with a Vietnamese companion, `doctor` in CI. No secrets, personal paths, or private system details anywhere in the repo.

**Non-goals (v1)**

- Product thinking, marketing, RAG/fine-tuning content, scaffolding templates. Optional packs later.
- Agent Teams. Parallelism uses subagents in git worktrees.
- Anything already shipped officially by Anthropic, Google, or a framework vendor (built-in `/code-review`, `/simplify`, `/loop`, LSP plugins, Chrome DevTools plugins, Laravel Boost skills). The kit defers to them.
- Copying text from proprietary sources. ClaudeKit contributes ideas only, re-implemented clean-room.
- Owner-private material: commercial theme assets, personal server access skills, the owner's DB knowledge base. These live outside the public kit.

## 2. Principles

1. **Kit holds process and technology expertise. Projects hold facts.** Facts live in the project's own docs and manifests and are read, never copied.
2. **Single source.** Everything derives from `core/`. Editing `core/` is the only upgrade step.
3. **Official first.** Native or vendor-shipped capabilities are used, not re-implemented.
4. **Absorb, attribute, re-evaluate.** MIT/Apache mechanisms are adapted with attribution; `upstream/sources.json` records provenance; `upstream-watch` tracks drift.
5. **Host-agnostic text, host-specific adapters.** Skill bodies describe actions, not tool names. Claude-only files (generated agents, hook registrations, the model map) live in the Claude adapter; Claude-only frontmatter keys may sit in core because Antigravity ignores unknown keys.
6. **Evidence before assertion.** `file:line` citations; numbers with a method or the label "not measured"; negative controls; no untested claims in commits or docs.
7. **Proportionate gates.** ACT-class work never asks. Only COUNCIL-class work stops for approval. Hooks and native deny lists enforce four invariants (secrets, unproven ship, unreviewed hot path, expired temporary bypass) and nothing else, and they enforce them at push and deploy time, never at every turn and never at a local commit.
8. **Budget is a contract.** `doctor` enforces sizes and listing tokens; CI fails on breach.

## 3. Hosts and verified mechanisms

| Mechanism | Claude Code 2.1.266 | Antigravity 2.0 (built-in docs dated 2026-09-05) |
|---|---|---|
| Always-on instructions | `~/.claude/CLAUDE.md` with `@path` import | `AGENTS.md`/`GEMINI.md` hierarchical; plugin `rules/AGENTS.md` |
| Skills | `~/.claude/skills/<name>/SKILL.md`, plugin `skills/` | `.agents/skills/<name>/SKILL.md`, `~/.gemini/config/skills/`, plugin `skills/` |
| Skill frontmatter | Agent Skills spec + extensions (`context`, `background`, `agent`, `model`, `effort`, `paths`, `hooks`, `disable-model-invocation`, `user-invocable`); listing capped near 1% of context by default, least-used descriptions dropped first | Agent Skills spec (`name`, `description` required); unknown keys ignored |
| Rules | `~/.claude/rules/**/*.md` with `paths:` globs; project instructions outrank user-level rules | `.agents/rules/*.md` with `trigger: always_on | model_decision | manual | glob` (enum verified in the binary; glob key name is test #2) |
| Agents | `agents/*.md` with `model`, `effort`, `tools`, `disallowedTools`, `permissionMode`, `maxTurns`, `memory`, `isolation: worktree`; a built-in read-only Explore agent exists | No persona files, no subagents; personas live in `bk-protocol` references |
| Hooks | SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, PreCompact, PostCompact, others; hooks also run inside subagents (`agent_type` in the payload); a registration predicate `if:` per the 2.1.266 docs (test #5) | PreToolUse, PostToolUse, PreInvocation (before each model turn), PostInvocation, Stop; command type only, synchronous |
| Memory and transcripts | Auto-memory index `MEMORY.md` loaded each session; transcripts under `~/.claude/projects/<project>/` | Knowledge items; transcript location not verified |
| Hook payload | snake_case (`tool_name`, `tool_input`); output `hookSpecificOutput.permissionDecision` | camelCase (`toolCall.name`, `toolCall.args`); output `decision`; PostToolUse output must be `{}` |
| Plugin | `.claude-plugin/plugin.json`, marketplace.json | `plugin.json`, `hooks.json`, `mcp_config.json`, `rules/`, `skills/`; registered via `~/.gemini/config/plugins.json` `entries.path` |
| MCP | `.mcp.json` / `claude mcp add` | `mcp_config.json` (global or plugin) |
| Subagent model routing | `CLAUDE_CODE_SUBAGENT_MODEL` env, per-agent `model` | Host model selection; not scriptable |
| Diagnostics | `/context`, `/skill-doctor` (seven-day window, not always available), `/cost` | Skills & Customizations panel (which skills loaded; no token count) |

**Differences handled by design**

- Antigravity PostToolUse cannot inject context → the hook writes a state flag; the next PreInvocation injects it.
- Antigravity has no SessionStart → bootstrap via always-on plugin `rules/AGENTS.md` plus PreInvocation on the first invocation.
- Claude plugins do not carry a `rules/` folder in current docs, and plugin skills are namespaced → the installer links directly into `~/.claude/{skills,rules,agents}` instead of relying on a plugin install; the marketplace stays a secondary channel.
- Skill discovery is one level deep on both hosts → flat `skills/` only.
- Both hosts have native path deny lists (Claude `permissions.deny`, Antigravity Permission Grants) → the kit configures them instead of shipping path-blocking hooks.
- Claude caps the skill listing at about 1% of context by default and, on overflow, drops the descriptions of the least-used skills → activation evals and `doctor` measure the whole host listing at the default budget; the installer never raises `skillListingBudgetFraction`.
- Claude hooks also fire inside subagents (payload carries `agent_type`) → every kit hook no-ops inside a subagent.
- `/compact` drops the conversation and loaded files but re-reads instruction files → `stack-profile` re-arms on PostCompact so the profile is back in context.
- Antigravity has no subagents → "independent review" is defined for both hosts as a review recorded from a context that did not author the change: on Claude the `bk-reviewer` subagent; on Antigravity a fresh conversation running `/bk-review` (the state store compares session ids) or an explicit human review note.
- Host measurements are only meaningful in a clean profile → the Phase 1 gate is measured in an isolated host profile that contains nothing but the kit (Claude: a dedicated config directory), never on a profile that still carries other kits.

## 4. Repository layout

```
bearingkit/
  core/                          # single source of truth, host-agnostic
    AGENTS.md                    # protocol (≤120 lines): gate, router, evidence rules, council, handoff chain
    skills/<bk-name>/            # SKILL.md (spec frontmatter plus Claude extension keys such as `context`, ignored by Antigravity) + references/ + scripts/
    rules/<lang>.md              # 8 language rules + security-baseline.md; dual frontmatter; ≤120 lines each
    hooks/*.cjs                  # Node scripts; host detected from payload shape; no network, no LLM
    mcp.json                     # MCP servers the kit recommends (context7, Playwright); added only by `install --mcp`
    kit.config.example.json      # per-machine values only (local source paths, KB path); the real file is gitignored
  adapters/
    claude/                      # .claude-plugin/plugin.json, hooks/hooks.json, model-map.json, agents/ (generated, gitignored)
    antigravity/                 # plugin.json, hooks.json, mcp_config.json (generated from core/mcp.json), rules/AGENTS.md (copied by install), skills/ (link created by install, gitignored)
  upstream/sources.json          # provenance: repo, tag, sha, license, mode, tracked files, derived map; local sources by name and version only
  evals/
    activation/                  # prompts per host per intent, expected skill or "none"; format defined in the Phase 1 plan
    skills/<skill>/tests/*.md    # prompt + expected; Skillmark-compatible, run locally only
    tasks/                       # five scripted standard tasks for the tokens-per-task axis
  bin/bearingkit.cjs             # npm bin: install · update · uninstall · doctor · evals · upstream-watch
  scripts/                       # Node only: install.cjs · doctor.cjs · evals.cjs · upstream-watch.cjs · detect-stack.cjs · generate-agents.cjs · record-guardrail.cjs
  tests/                         # unit tests: hook payload adapters (both hosts), detect-stack, doctor, installer dry-run
  docs/                          # ARCHITECTURE.md · CHANGELOG.md · CONTRIBUTING.md · specs/ · plans/ · handoff/ · upstream/ · compat/ (results of the compatibility tests)
  .claude-plugin/marketplace.json   # secondary channel
  package.json · LICENSE (MIT) · NOTICE · README.md · README.vi.md
  AGENTS.md · CLAUDE.md          # working agreement for developing the kit itself (CLAUDE.md imports AGENTS.md); not the product
```

## 5. One source, two hosts, two install modes

| Component | Source | Claude Code | Antigravity |
|---|---|---|---|
| Protocol | `core/AGENTS.md` | `@<repo>/core/AGENTS.md` in `~/.claude/CLAUDE.md` | plugin `rules/AGENTS.md` link, always-on |
| Skills | `core/skills/bk-*` | link `~/.claude/skills/bk-*` (both modes; the plugin is a discovery channel only) | plugin `skills/` link |
| Language rules | `core/rules/*.md` | link `~/.claude/rules/bearingkit/` (both modes, done by `install`) | plugin `rules/*.md` link; fallback = hidden skills triggered by description, never always-on; `security-baseline.md` folds into the plugin's `rules/AGENTS.md` either way |
| Agents | `core/skills/bk-protocol/references/personas.md` | `scripts/generate-agents.cjs` writes `adapters/claude/agents/*.md` from the personas and `adapters/claude/model-map.json` | personas read from `bk-protocol` |
| Hooks | `core/hooks/*.cjs` | `adapters/claude/hooks/hooks.json` | `adapters/antigravity/hooks.json` |
| MCP | `core/mcp.json` | `install --mcp` runs `claude mcp add`; off by default because tool schemas cost context | `mcp_config.json` generated from `core/mcp.json` |

**One installer, both hosts.** `npx bearingkit install` (npm package `bearingkit`, bin in `bin/bearingkit.cjs`) does everything: links `core/skills/bk-*` into `~/.claude/skills/`, `core/rules` into `~/.claude/rules/bearingkit/`, generated agents into `~/.claude/agents/`; merges hook registrations and the native deny list into `~/.claude/settings.json`; adds the `@…/core/AGENTS.md` import to `~/.claude/CLAUDE.md`; registers `adapters/antigravity` in `~/.gemini/config/plugins.json`; adds MCP servers. It unpacks the kit into `~/.bearingkit/kit/<version>/` so hook commands have a stable absolute path, backs up every file it touches into `~/.bearingkit/backups/<timestamp>/`, marks every entry it writes into a host settings file with a `bearingkit` key so merges stay idempotent and `uninstall` knows what to remove, is idempotent, has `--dry-run`, prints a diff of what changed, and `npx bearingkit uninstall` restores the backups. `npx bearingkit update` fetches the new version and re-links. Directory links are junctions on Windows (no admin) and symlinks elsewhere; single files such as the Antigravity `rules/AGENTS.md` are copied on install and refreshed by `update`.

**Dev mode** for the kit author: `npx bearingkit install --dev <repo>` points the same links at the working checkout, so an edit in `core/` is live in the next session on both hosts.

The Claude marketplace entry is a secondary channel for discovery; it is not required and is not the recommended path, because plugin skills are namespaced and plugins do not carry rules.

**Command naming.** Directory `core/skills/bk-spec` gives `/bk-spec` on both hosts in both modes. The `bk-` directory name is the contract.

**Repo state.** Skills that need live repository state (`bk-next`, `bk-ship`, `bk-close`) read it from the state store and from the version control commands they run themselves; no host-specific pre-injection syntax is used, so the linked skill files stay identical on both hosts.

## 6. Zero per-project configuration

`scripts/detect-stack.cjs` reads manifests and lockfiles and prints one JSON object to stdout (exit 0; exit 2 when no manifest is found): languages, frameworks with exact installed majors, package manager, test and build commands, lint and type-check commands, VCS presence, and an environment-parity check that the referenced binaries exist. Guardrail commands are derived from what exists, for example `pnpm test` plus `tsc --noEmit` for a TypeScript project or `pest` plus `pint` for Laravel; the full manifest-to-command table and an example output live next to the script and in the Phase 1 plan. Without git, verification falls back to file mtimes and syntax checks.

Skills read the project's own instruction files (`AGENTS.md`, `CLAUDE.md`, `README`, `docs/`) for facts: architecture, conventions, review checklists, hot paths, forbidden actions, secrets policy. No required format; sections titled like "review checklist", "KPI", "hot paths", "do not" are used when present. Hot paths default to auth, sessions, roles and permissions, payments and money movement, data deletion, migrations, uploads, user-authored HTML or URLs, tenant scoping, external API contracts. A hot-path touch means an independent review before push; COUNCIL (§11.3) means stopping for approval before acting; where the two lists overlap, both apply.

**Vendor deference.** If the project ships vendor skills or guidelines (for example Laravel Boost under `.claude/skills/` and `.ai/`), the kit uses them for that framework and does not apply its own generic rules for it. Host precedence backs this: on Claude, project instructions and project rules outrank user-level rules, so kit rules linked under `~/.claude/rules/` never override a project's own guidance.

Work products the kit writes into a project, in the project's conventional places: `plans/<yymmdd-hhmm>-<slug>/`, `docs/handoff/<date>.md`, `docs/architecture-map.md` from `bk-map`, and `.claude/lessons.log` when that file already exists (creating it once is the opt-in). Location lookup order: what the project's instruction file says, then an existing folder with that role, then the default above. These are project content, not kit configuration. Proposed edits to a project's own instruction files are always COUNCIL-class: shown as a diff, never applied silently.

## 7. Skill catalog

Conventions: description ≤300 characters and ≤100 tokens measured (bilingual cues are trimmed to ≤200 characters if one real description exceeds that), English first with Vietnamese cues, "Use when … / Not for …"; SKILL.md body ≤100 lines; heavy material in `references/`, cited by the relative path `references/<file>` which survives linking on both hosts; each skill ends with a suggested next step. **Modes are inferred from context.** Only four flags exist, and only to force behavior the model might skip when its own detection misses: `--browser` (rendered verification when UI detection failed), `--security`, `--deploy`, `--docs`. Heavy skills (`bk-audit`, `bk-review`, `bk-design`) run in a forked context and wait for the result; the Claude keys for that sit in the core frontmatter and are ignored elsewhere. Where a lesson is marked v1.1 in §18, the matching output below is v1.1 too.

### 7.1 Core (17)

| Skill | Intent | Gates and outputs | Adapted from |
|---|---|---|---|
| `bk-protocol` (hidden on Claude with the frontmatter keys that remove it from the listing, test #6; visible but inert on Antigravity) | Shared references: gate criteria and the pattern table (`references/gate-patterns.md`), council roles, personas (`references/personas.md`), evidence rules, RBA-lite, the fix-of-fix rule (a fix to a reviewed change gets the same independent review), host tool map (`references/host-tools.md`: action, Claude tool, Antigravity tool), the correction-cue list | — | Owner's protocol; Superpowers using-superpowers (MIT) |
| `bk-map` | Understand an unfamiliar codebase; produce or refresh an architecture map | Writes `docs/architecture-map.md` with `file:line` anchors (ACT); proposes instruction-file edits as a diff (COUNCIL) | feature-dev code-explorer (Apache) |
| `bk-research` | Answer with sources and confidence labels | Query plan, independent sources, claim labels | Built-in deep-research workflow; ClaudeKit research (ideas) |
| `bk-next` | Recommend the next step from real repo state | Reads git, plans, handoff | Owner's earlier `next` |
| `bk-spec` | Restate the ask, edge cases, assumptions; classify ACT or COUNCIL; pin requirements | RBA-lite for COUNCIL-class tasks only, with fail conditions (fewer than three edge cases, rollback "N/A", placeholder text, a breaking change without approval, unverified dependencies) that send an incomplete RBA back for completion; ACT tasks skip RBA; stops only when COUNCIL | Owner's earlier `spec`; Superpowers brainstorming (MIT); spec-kit (MIT, ideas); ClaudeKit requirement gate (ideas) |
| `bk-audit` | Council investigation, propose-first; lenses chosen by context: risk prediction, edge-case decomposition, security, performance, doc-vs-code reconcile | One verdict, priority matrix, rejected options | Owner's earlier `audit` and audit prompts; ClaudeKit predict/scenario (ideas); claude-security lenses (Apache) |
| `bk-plan` | Written plan with phases, exit criteria, evidence per phase; resolves the active plan from session state, then the branch name, then asks (works on `main` and detached HEAD) | `plans/<yymmdd-hhmm>-<slug>/` | Superpowers writing-plans (MIT); spec-kit tasks (MIT); ClaudeKit branch→plan (ideas) |
| `bk-build` | Execute a plan: scout first, subagents in worktrees with file ownership, migration safety when a migration is touched | No-side-effects proof (the change touches only the files the plan names, shown by the diff); preserve-working-code (never rewrite working code to change style); human stop for destructive migrations only, additive ones proceed; every subagent returns one of four states (done, done-with-concerns, blocked, needs-context) with a defined controller action, and never retries the same approach after blocked; worktrees branch from the current HEAD; on Antigravity, where there are no subagents, `bk-build` scouts inline and executes sequentially | Superpowers executing-plans, subagent-driven, worktrees (MIT); ClaudeKit cook gates (ideas) |
| `bk-test` | Tests as contract; TDD by default; `--browser` forces rendered verification for UI | Red→green evidence; negative control | Superpowers TDD (MIT); pr-review-toolkit test lens (Apache) |
| `bk-debug` | Root cause before fix; escalate to council after 3 failed attempts | Four phases | Superpowers systematic-debugging (MIT) |
| `bk-review` | Adversarial review; `--security` forces the security lens; simplification lens delegates to built-in `/simplify` on Claude and runs inline on Antigravity; records the independent review in the state store | Confidence-scored findings (≥80 reported); hot-path independent gate; fix-of-fix rule; sticky decisions: a finding reverses a decision marked `verified by file:line` only with new evidence, and user-confirmed decisions are surfaced with the trade-off, never silently reversed | Owner's earlier `review`; official code-review method (Apache); pr-review-toolkit lenses (Apache); Superpowers receiving-code-review (MIT) |
| `bk-perf` | Measure, then optimize: web vitals, memory, asset budgets; DB delegates to `bk-db` | Numbers with method or "not measured" | Owner's LCP and memory-leak practice |
| `bk-ship` | Finish safely: run detected guardrails, paste output, staged-diff secret scan, conventional commit, PR body; no "done" without verification | Records each guardrail run and exit code in the state store through `scripts/record-guardrail.cjs` (it is the writer `ship-gate` reads); declared-gates check against CI (v1.1); a code diff with no test diff is named, not blocked (v1.1) | Superpowers finishing-branch and verification (MIT); commit-commands (Apache); Owner's earlier `ship` |
| `bk-ops` | `--deploy` pre-flight with rollback (drift check v1.1); incident investigation from alert to code | Read-only first; any remote or production change is COUNCIL-class | Owner's ops practice; Spartan deploy and incident (ideas) |
| `bk-close` | End-of-session handoff in two blocks, durable knowledge (facts, decisions, rejected options, lessons) and resume payload (state, pending decisions, next steps) verified against git; `--docs` adds doc-drift proposals (v1.1); retro and journal when useful | Writes `docs/handoff/<date>.md` in that two-block shape; lists live temporary bypasses; flags uncommitted instruction-file edits; prompts for a lessons line at most once per session when a correction occurred; no secrets | Owner's earlier `close`; ClaudeKit watzup/retro/journal (ideas); claude-md-management (Apache) |
| `bk-design` | Distinctive UI with a critic pass: contrast, reduced motion, focus, asset budgets | Design plan → self-critique → build | frontend-design (Apache); owner's design-critic |
| `bk-db` | Database performance: decision tree, EXPLAIN-driven diagnosis; optional provenance KB when configured, read directly while it is small, searched in the user's own phrasing | Three tiers never mixed: vendor documentation, the provenance KB, and the agent's own reasoning, each labelled; compares logical reads and plan shape, not wall-clock; hints are diagnostics, never fixes | Owner's database playbook |

### 7.2 Optional (phase 3)

`bk-preview` (visual explain, diff and plan review in Markdown and HTML; clean-room), `bk-guard` (the known-failure guard pattern, with the Prisma 7 + Next example).

### 7.3 Description template and handoff chain

Every description follows one shape, English first, Vietnamese cues second, ≤300 characters:

```
<Action in one clause>. Use when: <cue phrases EN>; <cue phrases VI>. Not for: <nearest neighbor skill>.
```

Example, `bk-review`: "Review a diff or proposal before commit, hunting bugs, hot-path risk and untested claims. Use when: review, PR, before commit, soi diff, rà code, trước khi commit. Not for: explaining code, use bk-map."

All skills read the stack profile and the project's instruction files first. Each ends by naming the next step; the chain has stops only at COUNCIL-class points:

| From | Default next | Alternate |
|---|---|---|
| `bk-map`, `bk-research` | `bk-spec` | answer directly when the ask was a question |
| `bk-spec` | `bk-plan` when COUNCIL or more than three files; `bk-build` when ACT and at most three files | `bk-audit` when the ask is an investigation |
| `bk-audit` | `bk-plan` | `bk-spec` when scope is still unclear |
| `bk-plan` | `bk-build` | — |
| `bk-build` | `bk-test`, then `bk-review` | `bk-debug` on unexpected failure |
| `bk-debug` | `bk-test` | `bk-audit` after three failed attempts |
| `bk-review` | `bk-ship` | back to `bk-build` on blocking findings |
| `bk-ship` | `bk-close` | `bk-ops --deploy` when a deploy follows |
| `bk-close` | end | — |

### 7.4 Removed after audit

`bk-refactor` (built-in `/simplify`), `bk-devtools` (official Chrome DevTools plugins), `bk-laravel` (Laravel Boost), `bk-loop` (built-in `/loop`), `bk-admin` (commercial theme assets, private pack), `bk-react-perf` (a link in the React rule), `bk-ops --ssh` (personal skill), `bk-kb-author` (belongs to the owner's DB knowledge base repo, which does not have it yet; its authoring plan is tracked in that repo, not here).

Deferred, recorded so they are not lost silently: second-model review loop (`--second-opinion`), epic decomposition into ordered features, output styles (Antigravity has none), diff-size advisory before ship, worktree health audit.

## 8. Agents (Claude Code adapter)

| Agent | Model / effort | Tools | Purpose |
|---|---|---|---|
| `bk-researcher` | sonnet / medium | read + web | Sourced research with confidence labels |
| `bk-reviewer` | opus / high, `memory: project` | read-only | Independent gate for hot paths; never the author of the change; keeps load-bearing facts and accepted trade-offs |
| `bk-query-optimizer` | sonnet / medium | read + shell | EXPLAIN-based diagnosis for `bk-db`; uses only the connection the project already exposes, prefers a read-only role, never prints credentials |
| `bk-design-critic` | sonnet / medium | read + browser | Anti-generic and accessibility review |

Four agents. Scouting uses the host's built-in read-only Explore agent on Claude (official first; a `bk-scout` persona was dropped for that reason) and runs inline on Antigravity. Persona text lives once in `bk-protocol/references/personas.md`; `scripts/generate-agents.cjs` produces the Claude agent files from it and from `adapters/claude/model-map.json`, which users on cheaper plans can lower; a host-level force setting for subagent models overrides it by design. The adapter uses the host's native fields for read-only tool sets and turn limits instead of prompt text.

## 9. Language rules

Dual frontmatter, ≤120 lines each:

```yaml
---
paths: ["**/*.ts", "**/*.tsx"]    # Claude Code
trigger: glob                      # Antigravity
glob: "**/*.ts,**/*.tsx"           # key name confirmed by test #2; emit both `glob` and `globs` if needed
---
```

**v1 (8 language files plus 1 baseline):** typescript-react (Next, Vue, Electron), node, python, php-laravel, sql (PostgreSQL, MySQL, SQLite), shell (bash, PowerShell), kotlin (Android, Compose), c-cpp. Plus `security-baseline.md`, always-on, ≤40 lines, budgeted in §14; on Antigravity it is folded into the plugin's `rules/AGENTS.md`. Everywhere the spec says "8 rules" it means these eight language files; the baseline is counted separately.

**Planned, community-welcome:** java-spring, csharp-dotnet, go, rust, swift, dart-flutter.

Content is distilled from the owner's prior kits and MIT sources, and from official framework docs. No vendored third-party text without a permissive license. Each rule opens with a version card, one line such as `Written against: Laravel 12, PHP 8.4, Livewire 4`; `stack-profile` injects the same shape from the lockfiles.

## 10. Hooks, native deny lists, session state

**Native deny lists instead of path-blocking hooks.** The installer writes deny rules for secret files only (`**/.env*`, key material) into Claude `permissions.deny` and Antigravity Permission Grants. Dependency and build folders are not denied: reading installed library source is how the kit avoids inventing APIs, and asset budgets need the build output; hosts already skip those folders in search. The host matches paths, not command text, so nothing is blocked by a word inside a quoted string. A user who needs a blocked file lifts the rule in the host's own settings.

**Session state store.** Hooks and skills share `~/.bearingkit/state/<host>-<session-id>.json`, keyed by Claude `session_id` or Antigravity's conversation id (test #7 confirms the field name), never inside the project. Fields: stack profile hash, last injection hash, branch, dirty tree, active plan and phase, code files changed (files whose extension is in the stack profile's source extensions; docs never count), guardrail runs with exit codes (written by `bk-ship` through `record-guardrail.cjs`), hot-path touched (written by `hot-path-flag`), independent review recorded with the reviewing session id (written by `bk-review`), temporary-bypass markers seen. Writes are atomic (temp file, rename); a typed example lives in the Phase 1 plan. Files older than seven days are pruned by the next run.

Two enforcing hooks, two helpers. All are Node scripts with unit-tested payload adapters for both hosts, no network, no LLM calls, under 100 ms. All four no-op when the payload marks a subagent, so scouts and researchers cost nothing and cannot be blocked. The two enforcing hooks fire on push and deploy commands only, never on a local commit and never on Stop, and each fires at most once per state hash. Where the host supports a registration predicate, the adapter scopes them with it; otherwise the script matches only the narrow `git push` and deploy command shapes.

| Hook | Claude event | Antigravity event | Behavior and conditions |
|---|---|---|---|
| `stack-profile` (helper) | SessionStart, UserPromptSubmit, PostCompact | PreInvocation | Injects ≤120 tokens only when the state hash (stack, majors, branch, plan and phase, dirty tree, hot-path flag, handoff presence) changed; an example block lives in the Phase 1 plan; PostCompact resets the injection hash because compaction drops the earlier injection |
| `hot-path-flag` (helper) | PostToolUse Edit/Write | PostToolUse → state → PreInvocation | Records that a hot path was touched, by path or by content patterns on code lines (never comments) |
| `ship-gate` | PreToolUse on push and deploy | PreToolUse on push and deploy | Fires only when code files changed in this session and either no guardrail run is recorded or a hot path was touched without an independent review recorded; names `/bk-ship` or `/bk-review --security`; also scans the diff being pushed for secret patterns and blocks on a hit; once per state hash; docs-only sessions and local commits never trigger it |
| `temp-bypass-gate` | PreToolUse on push and deploy | PreToolUse on push and deploy | Blocks while code in the diff being pushed, or in files touched this session, is marked TEMPORARY or REMOVE with no expiry or an expired one; lists the markers; never scans the whole repository |

## 11. Auto-activation

**`core/AGENTS.md` outline** (≤120 lines; this file decides most of the kit's intelligence):

| Block | Lines | Content |
|---|---|---|
| Identity | 5 | What the kit is; answer in the user's language; read the stack profile first |
| Autonomy Gate | 15 | ACT and COUNCIL criteria, the gate's tie-breaker ("unsure → COUNCIL"), "ACT never asks" |
| Router | 15 | Ten intents → skill (table below); questions answered directly; the 1% rule: if there is a one-percent chance a skill applies, check it, and drop it when it does not fit |
| Evidence rules | 15 | `file:line`; numbers with method or "not measured"; negative control; no untested claims; unverified is not a defect; below a stated confidence on a technology, say so and consult pinned docs or `bk-research` first; verified decisions are sticky |
| Council protocol | 10 | 2–4 relevant roles, one option each, debate conflicts, one verdict, rejected options, no theatrics, no execution until decided; the verdict tie-breaker is the priority order quality → performance → operability → schedule |
| Definition of done | 6 | Guardrails run and pasted; rendered check for UI; nothing marked done without evidence |
| Handoff chain and hot paths | 10 | The §7.3 chain; default hot paths; independent review rule including fix-of-fix |
| Host notes | 6 | Tool map pointer, where state lives, how to lift a deny rule |

1. **Descriptions route.** Action first, "Use when" with cue phrases and symptoms, "Not for". Tuned by activation evals per host.
2. **Always-on router in `core/AGENTS.md`, about 15 lines.** Classify each request into one of ten intents; questions are answered directly; the 1% rule applies; the handoff chain spec → plan → build → review → ship → close stops only at COUNCIL-class points. Until a Phase 2 skill exists, its intent routes to the fallback in the table.

| Intent | Skill | Until the skill exists |
|---|---|---|
| question | answer directly | — |
| small change (ACT, ≤3 files) | `bk-build` with `bk-test` | — |
| feature | `bk-spec` | — |
| bug | `bk-debug` | — |
| review | `bk-review` | — |
| ship | `bk-ship` | — |
| design | `bk-design` (Phase 2) | `bk-spec` |
| data | `bk-db` (Phase 2) | `bk-spec` |
| ops | `bk-ops` (Phase 2) | `bk-spec`, with remote changes COUNCIL |
| research | `bk-research` (Phase 2) | answer with sources and confidence labels from `bk-protocol` |

3. **Autonomy Gate classifier.** `bk-spec` and `stack-profile` pre-classify from paths and content using the pattern table in `bk-protocol/references/gate-patterns.md`: a change is COUNCIL when it touches a COUNCIL area (migrations, schema, auth, sessions, roles, module contracts, multi-module impact, remote or production systems) **and** is non-trivial (changes behavior, or exceeds about twenty lines); comments, formatting, tests, docs and lint fixes are ACT even inside those areas; behavior-preserving refactor, app-layer fixes, code to an agreed contract, tasks in an approved plan → ACT. Unsure → COUNCIL. ACT never asks.
4. **State injection** by `stack-profile`.
5. **Deterministic gates** by the two enforcing hooks and the native deny lists (§10).
6. **Learning loop.** Host memory stores routing preferences; `bk-close` writes the handoff and, at most once per session, prompts for an append-only lessons line in `.claude/lessons.log` (format: `RULE | scope | WHEN … THEN … NOT … | evidence | date`) when the session state shows a guardrail failure after the agent's own change, or the user's turns contained a correction cue from the fixed list in `bk-protocol`; it only prompts, never writes a rule by itself; rules derive only from user turns and test results; `doctor` flags skills with zero calls in 30 days from its own local-only scan of transcripts (§3 gives the locations); evals re-tune descriptions on change.
7. **Anti-over-trigger.** Heavy skills run forked and wait for their result, and need explicit signals; below a moderate match the agent picks the most likely skill and states the assumption, and asks only when the request itself is COUNCIL-class; explanations never summon the council.

Metrics: activation precision and recall; hook false-block rate; manual invocations per session.

## 12. Upstream learning

`upstream/sources.json` records, per source: repo or path, tag, sha, license, mode (`adapt`, `ideas-only`, `reference`), tracked files, and a `derived` map from kit skills to source files. Sources at v1: obra/superpowers (MIT, adapt), anthropics/claude-plugins-official (Apache-2.0, adapt; includes the security-guidance pattern list used by `hot-path-flag` for content detection), github/spec-kit (MIT, ideas-only), claudekit-engineer (proprietary, ideas-only, refreshed before each delta report), vercel-labs/agent-skills (no license file, reference), Antigravity built-in docs (reference), the owner's protocol text (owner-authored, adapt, committed into `core/` in Phase 1), the owner's previous kit (owner-authored, adapt: RBA fail conditions, the known-failure guard, asset budgets; third-party text vendored inside it is excluded). Local sources are recorded by name and version only; their paths live in the gitignored `kit.config.json`.

Flow, monthly or on demand: `upstream-watch` fetches each source, diffs tracked files since the locked sha, writes `docs/upstream/<date>-<source>.md`; `bk-audit` decides absorb or skip; changes land in `core/`; evals must stay at or above baseline and fixed tokens must not grow; the sha is advanced.

License table, verified 2026-09-10: Superpowers MIT; anthropics/claude-plugins-official Apache-2.0 including frontend-design and claude-code-setup; spec-kit MIT; context7 MIT; Skillmark MIT; fullstack-dev-skills MIT; anthropics document-skills under Anthropic terms, not open; vercel-labs/agent-skills no license file; ClaudeKit proprietary.

## 13. Evals and doctor

- Static tier in CI on every PR: `doctor` (sizes, `name` equals directory, no BOM, no nested skills, no dead references, provenance present for anything citing upstream, fixed-token estimate under budget, no upstream-named folders, no personal paths or secrets; README and CHANGELOG counts versus `core/` from v1.1). `doctor` fails loudly on a missing prerequisite; it never reports OK for a check it could not run.
- Activation evals: prompts per host per intent, including negative controls whose expected answer is "no skill" (plain questions, explanations), so precision is real; scoped to the intents whose skills exist in the current phase; measured in the isolated host profile at the default skill-listing budget; on Antigravity the measure is activation only, recorded by hand from the Skills panel, and tokens are marked "not measured"; run on skill or description changes and monthly, not nightly. Before the owner's current setup is removed, the same prompt set is run against it once, as the baseline every later claim compares to.
- Skill evals: prompt + expected outcome, Skillmark-compatible; run locally only, never uploaded to a leaderboard; a `--changed` mode runs only skills changed since the last commit; cost per tier is published.
- Project mode (`doctor --project`, v1.1): declared gates versus CI, CI red streaks, ignored plan or handoff folders, live temporary bypasses, duplicate instruction sets, stale clones, code commits without test changes, plugins whose hooks call interpreters missing on this OS.
- Five comparison axes recorded in README with dates: correctness on evals, tokens per standard task (the five scripted tasks in `evals/tasks/`, totals from local transcripts), hosts covered per install, evidence gates passed, feature lag versus upstream.

## 14. Token budget contract

| Item | Budget (Claude) | Measurement |
|---|---|---|
| `core/AGENTS.md` | ≤2,300 tokens | `/context` |
| Skill listing (17 core; `bk-protocol` hidden) | ≤1,700 tokens; one real bilingual description is measured before the count is trusted | `/context`, `/skill-doctor` |
| Agents listing (4) | ≤300 tokens | `/context` |
| `security-baseline.md` (always-on) | ≤300 tokens | `/context` |
| Language rules with no matching file open | 0 | `/context` |
| Auto-memory index (`MEMORY.md`, loaded every session) | ≤200 tokens; `bk-close` proposes short entries | `/context` |
| **Total fixed** | **≤5,000 tokens** (sum of the rows above: 4,800) | `/context` at the phase-1 gate, isolated profile |
| Hook injection (transient, not counted as fixed) | ≤120 tokens, only on state change | hook output |
| MCP tool schemas (opt-in via `install --mcp`) | measured and recorded, not budgeted | `/context` |

Antigravity numbers are recorded only after measurement. All measurements use the host's default skill-listing budget in an isolated host profile; the installer never changes the budget.

## 15. Compatibility, versioning, uninstall

- Semantic versioning; `CHANGELOG.md` is the single changelog. Minimum hosts: Claude Code 2.1.266 (the version every mechanism in §3 was verified on), Antigravity 2.0 with the customization system (plugins.json, hooks.json).
- Delivery phases (the owner's migration plan sequences the same phases on one machine): **Phase 1**, `core/AGENTS.md`, `bk-protocol` and the ten protocol skills, `detect-stack`, `stack-profile`, both adapters, `install --dev`, compatibility tests, activation prompts for the six Phase 1 intents; gate: 10/10 activation on those intents on both hosts, ≤5,000 fixed tokens in the isolated profile. **Phase 2**, language rules, agents, the three remaining hooks, native deny lists, the six remaining core skills. **Phase 3**, optional skills. **Phase 4**, upstream watch, evals, docs, CI, public release from a squashed history.
- Node 20+ required for the installer, hooks and scripts; nothing else.
- A renamed or removed skill keeps an alias for one minor version (installer alias plus the marketplace `renames` map) and is listed in `CHANGELOG.md`.
- `npx bearingkit uninstall` removes links, settings entries, plugin registration, MCP entries, and restores the backups it made. The installer never moves or deletes user files that it did not create.
- Compatibility tests before v1.0, results recorded in `docs/compat/`, each with a pass criterion; tests 1 and 3 run before any adapter is written because a failure changes the install design: (1) Claude discovers linked skills, rules and agents through junctions (pass: a linked skill appears in the listing and invokes); (2) Antigravity rule frontmatter key `glob` versus `globs`, and whether plugin `rules/*.md` accept triggers (pass: a rule loads only when a matching file is open); (3) Claude Code tolerates unknown frontmatter keys in rules and the `@` import tolerates a file with frontmatter (pass: no warning, rule applies); (4) Antigravity Permission Grants can be written by the installer, otherwise the deny list is documented as a manual step there; (5) Claude hook registration predicate exists as documented (else narrow command matching in the script); (6) the frontmatter keys that hide `bk-protocol` from the Claude listing work as documented; (7) the Antigravity hook payload's conversation id field name.

## 16. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Activation regresses after consolidation | medium / high | Keep proven cue phrases; activation evals gate before archiving old commands |
| Vietnamese-only cues trigger poorly for English prompts | medium / medium | English first, Vietnamese cues second |
| Old and new kits active at once | high if unmanaged / high | Phase 1 gate measured in an isolated host profile; the migration plan disables old kits before enabling the new one on the daily profile; `doctor` detects duplicate instruction sets |
| `ship-gate` or `stack-profile` become nagging | medium / medium | Fire only on real state change and only after code changes without guardrails; measure false-block rate |
| Absorbing upstream shifts maintenance to us | certain / medium | `upstream-watch` and evals are v1 deliverables |
| Windows link issues | medium / medium | Directory junctions; generated copies where a rename is required |
| Timeline optimism | high / medium | Phase gates; ship phase 1 alone and measure |
| License or privacy drift from contributors | medium / high | `doctor` blocks unknown-license vendoring, personal paths, secrets |
| Installer or hook damages the user's setup (a previous kit's hook moved 108 skill folders aside and never restored them because its restore event was unregistered) | low / high | Backup before every write; idempotent JSON merge; never moves user files; no hook has a deferred undo step; `uninstall` restores; installer dry-run covered by tests |

## 17. Success metrics (v1.0)

- Fixed context ≤5,000 tokens on Claude, measured; single install per host.
- Activation precision ≥0.9 and recall ≥0.9 on the prompt set, both hosts.
- Zero kit configuration files inside any project.
- Every skill carries provenance and license mode; `NOTICE` complete.
- `upstream-watch` produces a delta report for every source at least monthly.

## 18. Field lessons from a production SaaS (2026-06 → 2026-09)

Source: the owner's Laravel multi-tenant SaaS built solo with AI assistance, inspected across its repository history, its two server checkouts, its 22 plan folders, council and audit reports, and reviewer agent memory. Identifying details are omitted on purpose. Each lesson names the capability it adds and whether it is v1 or v1.1.

| # | Lesson | Capability | Version |
|---|---|---|---|
| L1 | A temporary bypass marked "remove when done" outlived its purpose by months | `temp-bypass-gate`; `bk-close` lists live bypasses | v1 |
| L2 | Guardrails declared in the project's instructions were never wired into CI; CI stayed red for weeks because of an environment mismatch | `doctor --project` declared-gates reconciler and CI-red-streak check; `bk-ship` compares CI runtime config with the real runtime | v1.1 |
| L3 | Ten commits of UI styling shipped unstyled because tests asserted class strings, not rendered pages; a widget needed five fix PRs in one day | `bk-test --browser` mandatory for UI diffs; screenshot plus asset check is the evidence | v1 |
| L4 | Several classes of auth and tenancy defects were found only by later audits, then fixed | `hot-path-flag` by path and content, forcing `bk-review --security` with `bk-reviewer`; invariants become regression-locking tests | v1 |
| L5 | The best guardrails introspect the schema or forbid patterns by regex, so a forgotten isolation rule fails CI by itself | Invariant-to-test generator in `bk-build` | v1.1 |
| L6 | A destructive migration was safe only because a human wrote the reader-grep-beyond-the-ORM rule into the plan | Migration safety inside `bk-build`: classify additive vs destructive, repo-wide reader grep, tested rollback, concurrent index, human stop | v1 |
| L7 | Twenty-two plan folders and every council report lived only in a gitignored folder on one server; the best handoff prompt was untracked | `bk-close` writes the handoff into the repo; `doctor` warns on ignored plan folders | v1 |
| L8 | One stale fact needed three commits to purge from docs, docblock, fixture, comment; version pins drifted between docs and lockfiles | Fact registry and drift detector in `bk-close --docs` and `doctor` | v1.1 |
| L9 | The model proposed syntax from older majors exactly as the owner predicted | Version card from lockfiles injected by `stack-profile`; rule: for majors newer than training, consult pinned docs via context7 first | v1 |
| L10 | A generated CI step used a package manager the machine did not have | Environment-parity preflight in `detect-stack` | v1 |
| L11 | Every admin color pair failed contrast, fonts were unsubset, an empty JS chunk was preloaded; found manually after deploy | `bk-design` critic and `bk-perf` asset budgets | v1 |
| L12 | A production checkout drifted from development, with uncommitted live edits and leftover containers | `bk-ops --deploy` drift check | v1.1 |
| L13 | The reviewer agent's project memory of load-bearing facts and accepted trade-offs made later reviews faster and safer | `bk-reviewer` with `memory: project`; `bk-close` proposes memory entries | v1 |
| L14 | Design-vs-code audits in two reconcile rounds with verified, mismatch, gap and decision sections, each diff labelled ACT or COUNCIL | Reconcile template inside `bk-audit` | v1 |
| L15 | The project already used vendor-shipped skills with an override layer | Vendor deference in `bk-protocol` and `doctor` | v1 |
| L16 | The owner's own hardening made the ship command execute ACT tasks directly and convene a council only for COUNCIL-class work | Autonomy Gate classifier; ACT never asks | v1 |
| L17 | A learning log added to the process never received a line | Learning loop triggered by detected corrections and guardrail failures | v1 |
| L18 | Multi-step state changes without a transaction produced silent 404s; boundary validation missed a past-time case; rate-limiter state leaked across tests | Review lenses: multi-step mutation implies transaction; validate at the boundary; test isolation of singletons | v1 |
| L19 | Test-first was stated but not enforced: dozens of feature commits against two test commits | `doctor --project` reports code commits without test changes; `bk-ship` names it | v1.1 |
| L20 | Two protocol lines the kit lifts verbatim exist only as uncommitted edits on one machine; the best handoff prompt was untracked | Phase 1 copies source text into `core/` before anything else; `bk-close` flags uncommitted instruction-file edits | v1 |

Owner-authored text lifted verbatim into `core/`: the Autonomy Gate with its tie-breaker, the Council Protocol including "no theatrics", the Definition of DONE, the UX-for-non-technical-users and reversibility checklist items, the two-block handoff with its reconcile protocol, the four-step spec ritual, the evidence-or-unverified line, the propose-from-real-state line, the no-rubber-stamp reviewer stance, the version-drift warning, the priority order quality → performance → operability → schedule as the tie-breaker, "no test = not done", and "prevent traps by architecture, not by manual discipline". Reference content distilled from the same source (rule residue for SQL and PHP, review lens items, a per-entity definition of done, a long-lived-worker reload matrix, an SEO lens, a design-token validator) is listed in `docs/plans/2026-09-10-content-backlog.md` for Phase 1 and 2 writing.

## 19. Decisions log

| Date | Decision |
|---|---|
| 2026-09-09 | Consolidate into one kit; absorb rather than install; two hosts from one source |
| 2026-09-09 | Projects carry no kit configuration; skills read project docs and manifests; work products go to conventional project folders |
| 2026-09-10 | Name `Bearingkit`, prefix `/bk-`, identical commands on both hosts |
| 2026-09-10 | v1 language rules: TS/JS, Node, Python, PHP/Laravel, SQL, shell, Kotlin, C/C++; others planned |
| 2026-09-10 | ClaudeKit: ideas only; Superpowers: absorbed, plugin removed after phase 2 |
| 2026-09-10 | Field lessons L1–L18 adopted; Autonomy Gate classifier and temporary-bypass tracker added; ACT never asks |
| 2026-09-10 | Audit v1.1: 17 core skills, 5 agents, 8 rules, 6 hooks; modes inferred with four forced flags; Node-only scripts; owner migration moved to `docs/plans/`; private material excluded from the public kit |
| 2026-09-10 | Audit v1.2: single installer `npx bearingkit install` for both hosts and modes; native deny lists replace `scout-block` and `privacy-block`, leaving 4 hooks; session state store defined; `AGENTS.md` outline, description template and handoff chain specified |
| 2026-09-10 | The kit repository dogfoods its own handoff rule: session state lives in `docs/handoff/<date>.md`, the working agreement in root `AGENTS.md` (imported by `CLAUDE.md`); chat history is never a source of truth |
| 2026-09-10 | Audit v1.4 from two independent reviews (buildability; goals and pre-mortem): enforcing hooks fire on push and deploy only, never on Stop or local commits, once per state hash; `bk-ship` is the writer of guardrail runs; independent review defined for both hosts; Phase 1 gate measured in an isolated host profile with negative-control prompts and a baseline run of the previous setup; deny lists cover secrets only; RBA-lite scoped to COUNCIL tasks; classifier requires a COUNCIL area and a non-trivial change; intent-to-skill table; `bk-scout` dropped for the built-in Explore agent; MCP opt-in; personas single-sourced in `bk-protocol`; budget rebalanced to 4,800 with the baseline rule and memory index; minimum Claude Code 2.1.266; compatibility tests 5–7; delivery phases in the spec; deeper anonymization (L1, L4, L12, previous command names). Schemas and examples (state store, stack profile, injection block, eval file format, gate patterns) are deliverables of the Phase 1 plan, not of this spec |
| 2026-09-10 | Audit v1.3 after re-reading every research report against the spec: hooks no-op inside subagents and re-arm after compaction; measurements at the host's default listing budget; auto-memory index inside the budget; `bk-db` reads a small KB directly; subagent return contract, sticky verified decisions, RBA fail conditions; staged-diff secret scan in `ship-gate`; owner's previous kit and security-guidance patterns added as sources; five contradictions corrected (extension keys in core, kb-author location, plan-folder count, installer-risk wording, zero-call data source); content backlog file created |

## 20. Glossary

- **Kim chỉ nam** — Vietnamese for "compass" and, by extension, "guiding principle"; the owner's engagement protocol that Bearingkit generalizes.
- **ACT / COUNCIL** — the two classes of the Autonomy Gate: ACT executes and reports; COUNCIL proposes and waits.
- **Council** — a structured multi-perspective debate that ends in one verdict and a priority matrix; used for COUNCIL-class tasks only.
- **Hot path** — code where a mistake costs money, data, or trust; always gets an independent review gate.
- **RBA-lite** — a short Reasoning-Before-Action block: objective, scope, rollback, at least three edge cases, decision.
