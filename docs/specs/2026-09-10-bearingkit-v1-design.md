# Bearingkit v1 — Design Specification

Status: DRAFT v1.3 for owner review · Date: 2026-09-10 · Owner: tuyenht · Command prefix: `/bk-`

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
> nguồn gốc từ kit cũ của owner, sửa năm mâu thuẫn. Phần còn lại bằng tiếng Anh vì repo public.

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
5. **Host-agnostic text, host-specific adapters.** Skill bodies describe actions, not tool names. Claude-only fields live in the Claude adapter.
6. **Evidence before assertion.** `file:line` citations; numbers with a method or the label "not measured"; negative controls; no untested claims in commits or docs.
7. **Proportionate gates.** ACT-class work never asks. Only COUNCIL-class work stops for approval. Hooks and native deny lists enforce four invariants (secrets, unproven ship, unreviewed hot path, expired temporary bypass) and nothing else.
8. **Budget is a contract.** `doctor` enforces sizes and listing tokens; CI fails on breach.

## 3. Hosts and verified mechanisms

| Mechanism | Claude Code 2.1.266 | Antigravity 2.0 (built-in docs dated 2026-09-05) |
|---|---|---|
| Always-on instructions | `~/.claude/CLAUDE.md` with `@path` import | `AGENTS.md`/`GEMINI.md` hierarchical; plugin `rules/AGENTS.md` |
| Skills | `~/.claude/skills/<name>/SKILL.md`, plugin `skills/` | `.agents/skills/<name>/SKILL.md`, `~/.gemini/config/skills/`, plugin `skills/` |
| Skill frontmatter | Agent Skills spec + extensions (`context`, `agent`, `model`, `effort`, `paths`, `hooks`, `disable-model-invocation`, `user-invocable`) | Agent Skills spec (`name`, `description` required); unknown keys ignored |
| Rules | `~/.claude/rules/**/*.md` with `paths:` globs | `.agents/rules/*.md` with `trigger: always_on | model_decision | manual | glob` (enum verified in the binary; glob key name is test #2) |
| Agents | `agents/*.md` with `model`, `effort`, `tools`, `memory`, `isolation: worktree` | No persona files; personas live in `bk-protocol` references |
| Hooks | SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, others | PreToolUse, PostToolUse, PreInvocation, PostInvocation, Stop; command type only, synchronous |
| Hook payload | snake_case (`tool_name`, `tool_input`); output `hookSpecificOutput.permissionDecision` | camelCase (`toolCall.name`, `toolCall.args`); output `decision`; PostToolUse output must be `{}` |
| Plugin | `.claude-plugin/plugin.json`, marketplace.json | `plugin.json`, `hooks.json`, `mcp_config.json`, `rules/`, `skills/`; registered via `~/.gemini/config/plugins.json` `entries.path` |
| MCP | `.mcp.json` / `claude mcp add` | `mcp_config.json` (global or plugin) |
| Subagent model routing | `CLAUDE_CODE_SUBAGENT_MODEL` env, per-agent `model` | Host model selection; not scriptable |
| Diagnostics | `/context`, `/skill-doctor`, `/cost` | Skills & Customizations panel |

**Differences handled by design**

- Antigravity PostToolUse cannot inject context → the hook writes a state flag; the next PreInvocation injects it.
- Antigravity has no SessionStart → bootstrap via always-on plugin `rules/AGENTS.md` plus PreInvocation on the first invocation.
- Claude plugins do not carry a `rules/` folder in current docs, and plugin skills are namespaced → the installer links directly into `~/.claude/{skills,rules,agents}` instead of relying on a plugin install; the marketplace stays a secondary channel.
- Skill discovery is one level deep on both hosts → flat `skills/` only.
- Both hosts have native path deny lists (Claude `permissions.deny`, Antigravity Permission Grants) → the kit configures them instead of shipping path-blocking hooks.
- Claude caps the skill listing at about 1% of context by default and, on overflow, drops the descriptions of the least-used skills → activation evals and `doctor` measure the whole host listing at the default budget; the installer never raises `skillListingBudgetFraction`.
- Claude hooks also fire inside subagents (payload carries `agent_type`) → every kit hook no-ops inside a subagent.
- `/compact` drops the conversation and loaded files but re-reads instruction files → `stack-profile` re-arms on PostCompact so the profile is back in context.

## 4. Repository layout

```
bearingkit/
  core/                          # single source of truth, host-agnostic
    AGENTS.md                    # protocol (≤120 lines): gate, router, evidence rules, council, handoff chain
    skills/<bk-name>/            # SKILL.md (spec frontmatter plus Claude extension keys such as `context`, ignored by Antigravity) + references/ + scripts/
    rules/<lang>.md              # dual frontmatter; ≤120 lines each
    agents/<bk-name>.md          # short personas; Claude adapter adds model/effort/tools
    hooks/*.cjs                  # Node scripts; host detected from payload shape; no network, no LLM
    mcp.json                     # MCP servers the kit recommends (context7, Playwright)
    kit.config.example.json      # per-machine paths only; the real file is gitignored
  adapters/
    claude/                      # .claude-plugin/plugin.json, hooks/hooks.json, agents/ (generated), skills/ (link)
    antigravity/                 # plugin.json, hooks.json, mcp_config.json, rules/AGENTS.md (link), skills/ (link)
  upstream/sources.json          # provenance: repo, tag, sha, license, mode, tracked files, derived map
  evals/
    activation/                  # 10 prompts per host per intent, expected skill
    skills/<skill>/tests/*.md    # prompt + expected; Skillmark-compatible
  bin/bearingkit.cjs             # npm bin: install · update · uninstall · doctor · upstream-watch
  scripts/                       # Node only: install.cjs · doctor.cjs · upstream-watch.cjs · detect-stack.cjs
  tests/                         # unit tests: hook payload adapters (both hosts), detect-stack, doctor, installer dry-run
  docs/                          # ARCHITECTURE.md · CHANGELOG.md · CONTRIBUTING.md · specs/ · plans/ · handoff/ · upstream/
  .claude-plugin/marketplace.json   # secondary channel
  package.json · LICENSE (MIT) · NOTICE · README.md · README.vi.md
  AGENTS.md · CLAUDE.md          # working agreement for developing the kit itself (CLAUDE.md imports AGENTS.md); not the product
```

## 5. One source, two hosts, two install modes

| Component | Source | Claude Code | Antigravity |
|---|---|---|---|
| Protocol | `core/AGENTS.md` | `@<repo>/core/AGENTS.md` in `~/.claude/CLAUDE.md` | plugin `rules/AGENTS.md` link, always-on |
| Skills | `core/skills/bk-*` | link `~/.claude/skills/bk-*` (dev mode) or plugin `skills/` (public) | plugin `skills/` link |
| Language rules | `core/rules/*.md` | link `~/.claude/rules/bearingkit/` (both modes, done by `install`) | plugin `rules/*.md` link; fallback = hidden skills triggered by description, never always-on |
| Agents | `core/agents/*.md` | generated `adapters/claude/agents/*.md` with model map | personas referenced by `bk-protocol` |
| Hooks | `core/hooks/*.cjs` | `adapters/claude/hooks/hooks.json` | `adapters/antigravity/hooks.json` |
| MCP | `core/mcp.json` | `install` runs `claude mcp add` | `adapters/antigravity/mcp_config.json` |

**One installer, both hosts.** `npx bearingkit install` (npm package `bearingkit`, bin in `bin/bearingkit.cjs`) does everything: links `core/skills/bk-*` into `~/.claude/skills/`, `core/rules` into `~/.claude/rules/bearingkit/`, generated agents into `~/.claude/agents/`; merges hook registrations and the native deny list into `~/.claude/settings.json`; adds the `@…/core/AGENTS.md` import to `~/.claude/CLAUDE.md`; registers `adapters/antigravity` in `~/.gemini/config/plugins.json`; adds MCP servers. It backs up every file it touches, is idempotent, prints a diff of what changed, and `npx bearingkit uninstall` restores the backups. `npx bearingkit update` fetches the new version and re-links. Links are directory junctions on Windows (`mklink /J`, no admin) and symlinks elsewhere.

**Dev mode** for the kit author: `npx bearingkit install --dev <repo>` points the same links at the working checkout, so an edit in `core/` is live in the next session on both hosts.

The Claude marketplace entry is a secondary channel for discovery; it is not required and is not the recommended path, because plugin skills are namespaced and plugins do not carry rules.

**Command naming.** Directory `core/skills/bk-spec` gives `/bk-spec` on both hosts in both modes. The `bk-` directory name is the contract.

**Deterministic repo state on Claude.** The Claude adapter may prepend shell pre-injection blocks (`!` plus a backtick command such as `git status --short`) to `bk-next`, `bk-ship` and `bk-close`, so those skills start from real state without a hook. Antigravity gets the same facts from the state store through PreInvocation.

## 6. Zero per-project configuration

`scripts/detect-stack.cjs` reads manifests and lockfiles and returns a stack profile: languages, frameworks with exact installed majors, package manager, test and build commands, lint and type-check commands, VCS presence. Guardrail commands are derived from what exists (`pnpm test`, `tsc --noEmit`, `pest`, `pint`, `phpstan`, `pytest`, `ruff`, `gradle test`, `cmake --build` + `ctest`, `dotnet test`, `go test`, `cargo test`). Without git, verification falls back to file mtimes and syntax checks.

Skills read the project's own instruction files (`AGENTS.md`, `CLAUDE.md`, `README`, `docs/`) for facts: architecture, conventions, review checklists, hot paths, forbidden actions, secrets policy. No required format; sections titled like "review checklist", "KPI", "hot paths", "do not" are used when present. Hot paths default to auth, sessions, roles and permissions, payments and money movement, data deletion, migrations, uploads, user-authored HTML or URLs, tenant scoping, external API contracts.

**Vendor deference.** If the project ships vendor skills or guidelines (for example Laravel Boost under `.claude/skills/` and `.ai/`), the kit uses them for that framework and does not apply its own generic rules for it. Host precedence backs this: on Claude, project instructions and project rules outrank user-level rules, so kit rules linked under `~/.claude/rules/` never override a project's own guidance.

Work products the kit writes into a project, in the project's conventional places: `plans/<yymmdd-hhmm>-<slug>/`, `docs/handoff/<date>.md`, `docs/architecture-map.md` from `bk-map`, and `.claude/lessons.log` when that file already exists (creating it once is the opt-in). These are project content, not kit configuration. Proposed edits to a project's own instruction files are always COUNCIL-class: shown as a diff, never applied silently.

## 7. Skill catalog

Conventions: description ≤300 characters, English first with Vietnamese cues, "Use when … / Not for …"; SKILL.md body ≤100 lines; heavy material in `references/`; each skill ends with a suggested next step. **Modes are inferred from context.** Only four flags exist, and only to force behavior the model might skip: `--browser`, `--security`, `--deploy`, `--docs`.

### 7.1 Core (17)

| Skill | Intent | Gates and outputs | Adapted from |
|---|---|---|---|
| `bk-protocol` (hidden) | Shared references: gate criteria, council roles, evidence rules, RBA-lite, host tool map | — | Owner's protocol; Superpowers using-superpowers (MIT) |
| `bk-map` | Understand an unfamiliar codebase; produce or refresh an architecture map | Writes `docs/architecture-map.md` with `file:line` anchors (ACT); proposes instruction-file edits as a diff (COUNCIL) | feature-dev code-explorer (Apache) |
| `bk-research` | Answer with sources and confidence labels | Query plan, independent sources, claim labels | Built-in deep-research workflow; ClaudeKit research (ideas) |
| `bk-next` | Recommend the next step from real repo state | Reads git, plans, handoff | Owner's `/bs:next` |
| `bk-spec` | Restate the ask, edge cases, assumptions; classify ACT or COUNCIL; pin requirements | RBA-lite with fail conditions: fewer than three edge cases, rollback "N/A", placeholder text, a breaking change without approval, or unverified dependencies send the task back to COUNCIL; stops only when COUNCIL | Owner's `/bs:spec`; Superpowers brainstorming (MIT); spec-kit (MIT); ClaudeKit requirement gate (ideas) |
| `bk-audit` | Council investigation, propose-first; lenses chosen by context: risk prediction, edge-case decomposition, security, performance, doc-vs-code reconcile | One verdict, priority matrix, rejected options | Owner's `/bs:audit` and audit prompts; ClaudeKit predict/scenario (ideas); claude-security lenses (Apache) |
| `bk-plan` | Written plan with phases, exit criteria, evidence per phase; resolves the active plan from session state, then the branch name, then asks (works on `main` and detached HEAD) | `plans/<yymmdd-hhmm>-<slug>/` | Superpowers writing-plans (MIT); spec-kit tasks (MIT); ClaudeKit branch→plan (ideas) |
| `bk-build` | Execute a plan: scout first, subagents in worktrees with file ownership, migration safety when a migration is touched | No-side-effects proof; preserve-working-code; every subagent returns one of four states (done, done-with-concerns, blocked, needs-context) with a defined controller action, and never retries the same approach after blocked; worktrees branch from the current HEAD, not the default branch | Superpowers executing-plans, subagent-driven, worktrees (MIT); ClaudeKit cook gates (ideas) |
| `bk-test` | Tests as contract; TDD by default; `--browser` forces rendered verification for UI | Red→green evidence; negative control | Superpowers TDD (MIT); pr-review-toolkit test lens (Apache) |
| `bk-debug` | Root cause before fix; escalate to council after 3 failed attempts | Four phases | Superpowers systematic-debugging (MIT) |
| `bk-review` | Adversarial review; `--security` forces the security lens; simplification lens delegates to built-in `/simplify` on Claude | Confidence-scored findings (≥80 reported); hot-path independent gate; fix-of-fix rule; sticky decisions: a finding reverses a decision marked `verified by file:line` only with new evidence, and user-confirmed decisions are surfaced with the trade-off, never silently reversed | Owner's `/bs:review`; official code-review method (Apache); pr-review-toolkit lenses (Apache); Superpowers receiving-code-review (MIT) |
| `bk-perf` | Measure, then optimize: web vitals, memory, asset budgets; DB delegates to `bk-db` | Numbers with method or "not measured" | Owner's LCP and memory-leak practice |
| `bk-ship` | Finish safely: run detected guardrails, paste output, staged-diff secret scan, conventional commit, PR body; no "done" without verification | Declared-gates check against CI; a code diff with no test diff is named, not blocked | Superpowers finishing-branch and verification (MIT); commit-commands (Apache); Owner's `/bs:ship` |
| `bk-ops` | `--deploy` pre-flight with drift check and rollback; incident investigation from alert to code | Read-only first; explicit confirmation for remote changes | Owner's ops practice; Spartan deploy and incident (ideas) |
| `bk-close` | End-of-session handoff: durable-knowledge proposals plus resume payload verified against git; `--docs` adds doc-drift proposals; retro and journal when useful | Writes `docs/handoff/<date>.md`; lists live temporary bypasses; prompts a lessons line when a correction occurred; no secrets | Owner's `/bs:close`; ClaudeKit watzup/retro/journal (ideas); claude-md-management (Apache) |
| `bk-design` | Distinctive UI with a critic pass: contrast, reduced motion, focus, asset budgets | Design plan → self-critique → build | frontend-design (Apache); owner's design-critic |
| `bk-db` | Database performance: decision tree, EXPLAIN-driven diagnosis; optional provenance KB when configured, read directly (index plus matching articles) while it is small instead of a CLI round-trip, searched in the user's own phrasing | Three-tier knowledge never mixed; compares logical reads and plan shape, not wall-clock; hints are diagnostics, never fixes | Owner's database playbook |

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
| `bk-spec` | `bk-plan` when COUNCIL or multi-step; `bk-build` when ACT and small | `bk-audit` when the ask is an investigation |
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
| `bk-scout` | haiku / low | read-only | Parallel scouting with `file:line` output, timeout per segment |
| `bk-researcher` | sonnet / medium | read + web | Sourced research with confidence labels |
| `bk-reviewer` | opus / high, `memory: project` | read-only | Independent gate for hot paths; never the author of the change; keeps load-bearing facts and accepted trade-offs |
| `bk-query-optimizer` | sonnet / medium | read + shell | EXPLAIN-based diagnosis for `bk-db`; uses only the connection the project already exposes, prefers a read-only role, never prints credentials |
| `bk-design-critic` | sonnet / medium | read + browser | Anti-generic and accessibility review |

The model map is a table in the adapter; users on cheaper plans can lower it, and a host-level force setting for subagent models overrides it by design. The adapter uses native agent fields where they exist: `maxTurns` for `bk-scout`'s per-segment timeout, `disallowedTools` and `permissionMode` for read-only agents, instead of prompt text. Antigravity has no persona files; the same persona text is referenced by `bk-protocol`.

## 9. Language rules

Dual frontmatter, ≤120 lines each:

```yaml
---
paths: ["**/*.ts", "**/*.tsx"]    # Claude Code
trigger: glob                      # Antigravity
glob: "**/*.ts,**/*.tsx"           # key name confirmed by test #2; emit both `glob` and `globs` if needed
---
```

**v1 (8 files, the stacks the kit is exercised on):** typescript-react (Next, Vue, Electron), node, python, php-laravel, sql (PostgreSQL, MySQL, SQLite), shell (bash, PowerShell), kotlin (Android, Compose), c-cpp. Plus `security-baseline.md`, always-on, ≤40 lines.

**Planned, community-welcome:** java-spring, csharp-dotnet, go, rust, swift, dart-flutter.

Content is distilled from the owner's prior kits and MIT sources, and from official framework docs. No vendored third-party text without a permissive license. Each rule opens with a version card: which majors it was written against.

## 10. Hooks, native deny lists, session state

**Native deny lists instead of path-blocking hooks.** The installer writes deny rules for secret files (`**/.env*`, key material) and dependency or build folders (`node_modules`, `vendor`, `dist`, `build`, `.venv`, `target`) into Claude `permissions.deny` and Antigravity Permission Grants. The host matches paths, not command text, so nothing is blocked by a word inside a quoted string. A user who needs a blocked file lifts the rule in the host's own settings.

**Session state store.** Hooks share `~/.bearingkit/state/<host>-<session-id>.json`, keyed by Claude `session_id` or Antigravity `conversationId`, never inside the project. Fields: stack profile hash, last injection hash, code files changed, guardrail runs with exit codes, hot-path touched, independent review recorded, temporary-bypass markers seen. Files older than seven days are pruned by the next run.

Two enforcing hooks, two helpers. All are Node scripts with unit-tested payload adapters for both hosts, no network, no LLM calls, under 100 ms. All four no-op when the payload marks a subagent, so scouts and researchers cost nothing and cannot be blocked. Where the host supports a registration predicate (Claude `if: Bash(git commit:*)`), the adapter scopes `ship-gate` and `temp-bypass-gate` with it instead of parsing command text in the script.

| Hook | Claude event | Antigravity event | Behavior and conditions |
|---|---|---|---|
| `stack-profile` (helper) | SessionStart, UserPromptSubmit, PostCompact | PreInvocation | Injects ≤120 tokens only when the state hash changed: stack and majors, guardrails, branch, active plan and phase, dirty tree, hot-path touched, handoff present; PostCompact resets the injection hash because compaction drops the earlier injection |
| `hot-path-flag` (helper) | PostToolUse Edit/Write | PostToolUse → state → PreInvocation | Records that a hot path was touched, by path or content |
| `ship-gate` | PreToolUse on commit/push; Stop | PreToolUse; Stop | Fires only when code files changed in this session and either no guardrail run is recorded or a hot path was touched without an independent review recorded; names `/bk-ship` or `/bk-review --security`; also scans the staged diff for secret patterns and blocks on a hit, the secrets invariant at commit time; docs-only sessions never trigger it |
| `temp-bypass-gate` | PreToolUse on commit/push/deploy | PreToolUse | Blocks while code marked TEMPORARY or REMOVE has no expiry or an expired one; lists the markers |

## 11. Auto-activation

**`core/AGENTS.md` outline** (≤120 lines; this file decides most of the kit's intelligence):

| Block | Lines | Content |
|---|---|---|
| Identity | 5 | What the kit is; answer in the user's language; read the stack profile first |
| Autonomy Gate | 15 | ACT and COUNCIL criteria, tie-breaker, "ACT never asks" |
| Router | 15 | Ten intents → skill; questions answered directly; the 1% rule |
| Evidence rules | 15 | `file:line`; numbers with method or "not measured"; negative control; no untested claims; unverified is not a defect; below a stated confidence on a technology, say so and consult pinned docs or `bk-research` first; verified decisions are sticky |
| Council protocol | 10 | 2–4 relevant roles, one option each, debate conflicts, one verdict, rejected options, no theatrics, no execution until decided |
| Definition of done | 6 | Guardrails run and pasted; rendered check for UI; nothing marked done without evidence |
| Handoff chain and hot paths | 10 | The §7.3 chain; default hot paths; independent review rule including fix-of-fix |
| Host notes | 6 | Tool map pointer, where state lives, how to lift a deny rule |

1. **Descriptions route.** Action first, "Use when" with cue phrases and symptoms, "Not for". Tuned by activation evals per host.
2. **Always-on router in `core/AGENTS.md`, about 20 lines.** Classify each request into one of ten intents (question, small change, feature, bug, review, ship, design, data, ops, research); questions are answered directly; the 1% rule applies; the handoff chain spec → plan → build → review → ship → close stops only at COUNCIL-class points.
3. **Autonomy Gate classifier.** `bk-spec` and `stack-profile` pre-classify from paths and content: migrations, schema, auth, sessions, roles, module contracts, multi-module impact → COUNCIL; behavior-preserving refactor, tests, app-layer fixes, lint fixes, code to an agreed contract, docs, tasks in an approved plan → ACT. Unsure → COUNCIL. ACT never asks.
4. **State injection** by `stack-profile`.
5. **Deterministic gates** by the two enforcing hooks and the native deny lists (§10).
6. **Learning loop.** Host memory stores routing preferences; `bk-close` writes the handoff and prompts for an append-only `RULE` line when the session state shows a guardrail failure after the agent's own change, or the user's turns contained a correction cue (a short configurable list); it only prompts, never writes a rule by itself; rules derive only from user turns and test results; `doctor` flags skills with zero calls in 30 days from its own scan of local transcripts, because `/skill-doctor` reports a seven-day window and is not always available; evals re-tune descriptions on change.
7. **Anti-over-trigger.** Heavy skills run `context: fork`, with `background: false` whenever a verdict must come back before the conversation continues, and need explicit signals; below moderate match ask one short question; explanations never summon the council.

Metrics: activation precision and recall; hook false-block rate; manual invocations per session.

## 12. Upstream learning

`upstream/sources.json` records, per source: repo or path, tag, sha, license, mode (`adapt`, `ideas-only`, `reference`), tracked files, and a `derived` map from kit skills to source files. Sources at v1: obra/superpowers (MIT, adapt), anthropics/claude-plugins-official (Apache-2.0, adapt; includes the security-guidance pattern list used by `hot-path-flag` for content detection), github/spec-kit (MIT, ideas-only), claudekit-engineer (proprietary, ideas-only, private checkout, refreshed before each delta report), vercel-labs/agent-skills (no license file, reference), Antigravity built-in docs (reference, local path), the owner's previous kit (owner-authored, adapt: RBA fail conditions, the known-failure guard, asset budgets; third-party text vendored inside it is excluded).

Flow, monthly or on demand: `upstream-watch` fetches each source, diffs tracked files since the locked sha, writes `docs/upstream/<date>-<source>.md`; `bk-audit` decides absorb or skip; changes land in `core/`; evals must stay at or above baseline and fixed tokens must not grow; the sha is advanced.

License table, verified 2026-09-10: Superpowers MIT; anthropics/claude-plugins-official Apache-2.0 including frontend-design and claude-code-setup; spec-kit MIT; context7 MIT; Skillmark MIT; fullstack-dev-skills MIT; anthropics document-skills under Anthropic terms, not open; vercel-labs/agent-skills no license file; ClaudeKit proprietary.

## 13. Evals and doctor

- Static tier in CI on every PR: `doctor` (sizes, `name` equals directory, no BOM, no nested skills, no dead references, provenance present for anything citing upstream, fixed-token estimate under budget, no upstream-named folders, no personal paths or secrets, README and CHANGELOG counts and version equal to what `core/` contains). `doctor` fails loudly on a missing prerequisite; it never reports OK for a check it could not run.
- Activation evals: 10 prompts per host per intent; measured with the full host listing at the default skill-listing budget, since the host drops descriptions on overflow; run on skill or description changes and monthly, not nightly.
- Skill evals: prompt + expected outcome, Skillmark-compatible; run locally only, never uploaded to a leaderboard; a `--changed` mode runs only skills changed since the last commit; cost per tier is published.
- Project mode (`doctor --project`, v1.1): declared gates versus CI, CI red streaks, ignored plan or handoff folders, live temporary bypasses, duplicate instruction sets, stale clones, code commits without test changes, plugins whose hooks call interpreters missing on this OS.
- Five comparison axes recorded in README with dates: correctness on evals, tokens per standard task (from the official session-report plugin or local transcript totals), hosts covered per install, evidence gates passed, feature lag versus upstream.

## 14. Token budget contract

| Item | Budget (Claude) | Measurement |
|---|---|---|
| `core/AGENTS.md` | ≤2,500 tokens | `/context` |
| Skill listing (17 core) | ≤1,700 tokens | `/context`, `/skill-doctor` |
| Agents listing | ≤400 tokens | `/context` |
| Rules with no matching file open | 0 | `/context` |
| Hook injection | ≤120 tokens, only on state change | hook output |
| Auto-memory index (`MEMORY.md`, loaded every session) | ≤300 tokens; `bk-close` proposes short entries | `/context` |
| **Total fixed** | **≤5,000 tokens** | `/context` at the phase-1 gate |

Antigravity numbers are recorded only after measurement. All measurements use the host's default skill-listing budget; the installer never changes it.

## 15. Compatibility, versioning, uninstall

- Semantic versioning; `CHANGELOG.md` is the single changelog. Minimum hosts: Claude Code 2.1.252 (`/skill-doctor`), Antigravity 2.0 with the customization system (plugins.json, hooks.json).
- Node 20+ required for the installer, hooks and scripts; nothing else.
- A renamed or removed skill keeps an alias for one minor version (installer alias plus the marketplace `renames` map) and is listed in `CHANGELOG.md`.
- `npx bearingkit uninstall` removes links, settings entries, plugin registration, MCP entries, and restores the backups it made. The installer never moves or deletes user files that it did not create.
- Compatibility tests before v1.0: (1) Claude discovers linked skills, rules and agents through junctions; (2) Antigravity rule frontmatter key `glob` versus `globs`, and whether plugin `rules/*.md` accept triggers; (3) Claude Code tolerance of unknown frontmatter keys in rules; (4) Antigravity Permission Grants can be written by the installer, otherwise the deny list is documented as a manual step there.

## 16. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Activation regresses after consolidation | medium / high | Keep proven cue phrases; activation evals gate before archiving old commands |
| Vietnamese-only cues trigger poorly for English prompts | medium / medium | English first, Vietnamese cues second |
| Old and new kits active at once | high if unmanaged / high | Installer disables old before enabling new; `doctor` detects duplicates |
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
| L1 | A temporary auto-login route marked "REMOVE when done" stayed live in production for two months | `temp-bypass-gate`; `bk-close` lists live bypasses | v1 |
| L2 | Guardrails declared in the project's instructions were never wired into CI; CI stayed red for weeks because of an environment mismatch | `doctor --project` declared-gates reconciler and CI-red-streak check; `bk-ship` compares CI runtime config with the real runtime | v1.1 |
| L3 | Ten commits of UI styling shipped unstyled because tests asserted class strings, not rendered pages; a widget needed five fix PRs in one day | `bk-test --browser` mandatory for UI diffs; screenshot plus asset check is the evidence | v1 |
| L4 | Stored XSS through author-controlled URLs, missing login throttle, cross-tenant admin reach, an inert role level, a credential-enumeration oracle, replayable OAuth tokens, sessions surviving password rotation; all found by later audits | `hot-path-flag` by path and content, forcing `bk-review --security` with `bk-reviewer`; invariants become regression-locking tests | v1 |
| L5 | The best guardrails introspect the schema or forbid patterns by regex, so a forgotten isolation rule fails CI by itself | Invariant-to-test generator in `bk-build` | v1.1 |
| L6 | A destructive migration was safe only because a human wrote the reader-grep-beyond-the-ORM rule into the plan | Migration safety inside `bk-build`: classify additive vs destructive, repo-wide reader grep, tested rollback, concurrent index, human stop | v1 |
| L7 | Twenty-two plan folders and every council report lived only in a gitignored folder on one server; the best handoff prompt was untracked | `bk-close` writes the handoff into the repo; `doctor` warns on ignored plan folders | v1 |
| L8 | One stale fact needed three commits to purge from docs, docblock, fixture, comment; version pins drifted between docs and lockfiles | Fact registry and drift detector in `bk-close --docs` and `doctor` | v1.1 |
| L9 | The model proposed syntax from older majors exactly as the owner predicted | Version card from lockfiles injected by `stack-profile`; rule: for majors newer than training, consult pinned docs via context7 first | v1 |
| L10 | A generated CI step used a package manager the machine did not have | Environment-parity preflight in `detect-stack` | v1 |
| L11 | Every admin color pair failed contrast, fonts were unsubset, an empty JS chunk was preloaded; found manually after deploy | `bk-design` critic and `bk-perf` asset budgets | v1 |
| L12 | Production checkout weeks behind development with uncommitted live edits; orphaned containers ran for weeks | `bk-ops --deploy` drift check | v1.1 |
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
| 2026-09-10 | Audit v1.3 after re-reading every research report against the spec: hooks no-op inside subagents and re-arm after compaction; measurements at the host's default listing budget; auto-memory index inside the budget; `bk-db` reads a small KB directly; subagent return contract, sticky verified decisions, RBA fail conditions; staged-diff secret scan in `ship-gate`; owner's previous kit and security-guidance patterns added as sources; five contradictions corrected (extension keys in core, kb-author location, plan-folder count, installer-risk wording, zero-call data source); content backlog file created |

## 20. Glossary

- **Kim chỉ nam** — Vietnamese for "compass" and, by extension, "guiding principle"; the owner's engagement protocol that Bearingkit generalizes.
- **ACT / COUNCIL** — the two classes of the Autonomy Gate: ACT executes and reports; COUNCIL proposes and waits.
- **Council** — a structured multi-perspective debate that ends in one verdict and a priority matrix; used for COUNCIL-class tasks only.
- **Hot path** — code where a mistake costs money, data, or trust; always gets an independent review gate.
- **RBA-lite** — a short Reasoning-Before-Action block: objective, scope, rollback, at least three edge cases, decision.
