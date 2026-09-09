# Bearingkit v1 — Design Specification

Status: DRAFT for owner review · Date: 2026-09-10 · Owner: tuyenht · Command prefix: `/bk-`

> **Tóm tắt (VI).** Bearingkit là một bộ kỹ năng và tác nhân cho lập trình có AI hỗ trợ, dùng chung
> cho Claude Code và Google Antigravity từ **một nguồn duy nhất**. Lõi là "Kim chỉ nam": hội đồng
> chuyên gia, propose-first, bằng chứng trước kết luận, cổng review độc lập, bàn giao phiên. Kit
> **hấp thụ** cơ chế tốt nhất của Superpowers, plugin chính thức của Anthropic, spec-kit, ý tưởng
> của ClaudeKit và Antigravity-Core v5, viết lại dưới giấy phép cho phép, và **không yêu cầu cài
> thêm bộ nào**. Mỗi dự án không cần file cấu hình riêng: kit tự đọc manifest và tài liệu sẵn có.
> Mọi tuyên bố "tốt hơn" phải đo được bằng evals trên hai host. Phần còn lại của tài liệu này bằng
> tiếng Anh vì repo sẽ public.

---

## 1. Purpose, goals, non-goals

**Purpose.** One installable kit that makes an AI coding agent work like a disciplined senior team:
understand before acting, propose before changing, prove before claiming, hand off cleanly.

**Goals**

1. One source of truth (`core/`) serving two hosts: Claude Code (2.1.x) and Google Antigravity 2.0 (IDE, desktop, `agy` CLI).
2. Zero per-project configuration. The kit reads the project (manifests, existing `AGENTS.md`/`CLAUDE.md`/docs) as input; it never writes kit-specific files into a project.
3. Fixed context cost under 5,000 tokens per session on Claude Code (measured with `/context`), comparable on Antigravity.
4. Skills auto-activate from context with measured precision; deterministic hooks enforce the gates the model might forget.
5. Every capability is traceable to an upstream source, license-clean, and re-evaluated when upstream changes.
6. Public-ready from day one: MIT license, NOTICE with attributions, English docs with Vietnamese companion, CI running `doctor` and `evals`.

**Non-goals (v1)**

- Product thinking, startup, marketing, RAG/fine-tuning content. These become optional packs in the same marketplace later.
- Agent Teams (experimental, CLI-only, high cost). Parallelism uses subagents in git worktrees.
- Copying text from proprietary sources. ClaudeKit contributes ideas only (clean-room re-implementation).

## 2. Principles

1. **Kit holds process and technology expertise. Projects hold facts.** Project facts live in the project's own docs and are read, never copied.
2. **Single source.** Everything derives from `core/`. Hosts see it through junctions or generated adapters; editing `core/` is the only upgrade step.
3. **Official first.** Anything Anthropic or Google ships natively (built-in `/code-review`, LSP plugins, Antigravity built-in skills) is used, not re-implemented.
4. **Absorb, attribute, re-evaluate.** Best mechanisms from MIT/Apache sources are adapted with attribution in `NOTICE`; `upstream/sources.json` records provenance and `upstream-watch` tracks drift.
5. **Host-agnostic text, host-specific adapters.** Skill bodies describe actions, not tool names. Claude-only fields (`context: fork`, `model`, `effort`, agents) live in the Claude adapter.
6. **Evidence before assertion.** `file:line` citations, measured numbers or the label "not measured", negative controls, no untested claims in commits or docs.
7. **Budget is a contract.** `doctor` enforces description length, rule length, listing tokens; CI fails on breach.

## 3. Hosts and verified mechanisms

| Mechanism | Claude Code 2.1.266 | Antigravity 2.0 (built-in docs dated 2026-09-05) |
|---|---|---|
| Always-on instructions | `~/.claude/CLAUDE.md` with `@path` import | `AGENTS.md`/`GEMINI.md` hierarchical; plugin `rules/AGENTS.md` |
| Skills | `~/.claude/skills/<name>/SKILL.md`, plugin `skills/` | `.agents/skills/<name>/SKILL.md`, `~/.gemini/config/skills/`, plugin `skills/` |
| Skill frontmatter | Agent Skills spec + extensions (`context`, `agent`, `model`, `effort`, `paths`, `hooks`, `disable-model-invocation`, `user-invocable`) | Agent Skills spec (`name`, `description` required); unknown keys ignored |
| Rules | `~/.claude/rules/*.md` with `paths:` globs | `.agents/rules/*.md` with `trigger: always_on | model_decision | manual | glob` (enum verified in binary; glob key name to test) |
| Agents | `agents/*.md` with `model`, `effort`, `tools`, `isolation: worktree` | No persona files; personas live in `bk-protocol` references |
| Hooks | SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SubagentStop, PreCompact, … | PreToolUse, PostToolUse, PreInvocation, PostInvocation, Stop (command type only, sync) |
| Hook payload | snake_case (`tool_name`, `tool_input`); output `hookSpecificOutput.permissionDecision` | camelCase (`toolCall.name`, `toolCall.args`); output `decision`; PostToolUse output must be `{}` |
| Plugin | `.claude-plugin/plugin.json`, marketplace.json | `plugin.json`, `hooks.json`, `mcp_config.json`, `rules/`, `skills/`; registered via `~/.gemini/config/plugins.json` `entries.path` |
| MCP | `.mcp.json` / `claude mcp add` | `mcp_config.json` (global or plugin) |
| Subagent model routing | `CLAUDE_CODE_SUBAGENT_MODEL` env, per-agent `model` | Host model selection; not scriptable |
| Diagnostics | `/context`, `/skill-doctor`, `/cost` | Skills & Customizations panel |

**Known differences handled by design**

- Antigravity PostToolUse cannot inject context → hook writes a state flag; the next PreInvocation injects it.
- Antigravity has no SessionStart → bootstrap routing via always-on `rules/AGENTS.md` plus PreInvocation `ephemeralMessage` on the first invocation.
- Claude plugins cannot ship rules → installer junctions `core/rules` into `~/.claude/rules/bearingkit/`.
- Skill discovery is one level deep on both hosts → flat `skills/` directory only.

## 4. Repository layout

```
bearingkit/
  core/                          # single source of truth, host-agnostic
    AGENTS.md                    # protocol: routing table, evidence rules, council, handoff chain (≤120 lines)
    skills/<bk-name>/SKILL.md    # Agent Skills spec frontmatter only; references/ and scripts/ per skill
    rules/<lang>.md              # dual frontmatter: paths: (Claude) + trigger: glob (Antigravity); ≤120 lines each
    agents/<bk-name>.md          # short personas; Claude adapter adds model/effort/tools
    hooks/                       # Node .cjs scripts, host auto-detected from payload shape
    kit.config.example.json      # per-machine config template (DB playbook path, MCP); real file is gitignored
  adapters/
    claude/                      # .claude-plugin/plugin.json, hooks/hooks.json, agents/ (generated), skills/ (junction)
    antigravity/                 # plugin.json, hooks.json, mcp_config.json, rules/AGENTS.md (junction), skills/ (junction)
  upstream/
    sources.json                 # provenance: repo, tag, sha, license, mode, tracked files, derived map
  evals/
    <skill>/tests/*.md           # prompt + expected; Skillmark-compatible
    prompts/activation/*.md      # 10 activation prompts per host
  scripts/
    install.ps1 | install.sh     # create junctions, register plugin on both hosts, backup first
    doctor.ps1 | doctor.sh       # budgets, BOM, name==dir, dead refs, duplicates, cleanup list
    upstream-watch.ps1 | .sh     # diff tracked upstream files since locked sha → docs/upstream/<date>-<source>.md
    detect-stack.cjs             # manifests → stack + guardrail commands (used by hooks and skills)
  docs/
    ARCHITECTURE.md · CHANGELOG.md · CONTRIBUTING.md · specs/ · plans/ · upstream/
  .claude-plugin/marketplace.json   # lets users `claude plugin marketplace add tuyenht/Bearingkit`
  LICENSE (MIT) · NOTICE · README.md (EN) · README.vi.md
```

## 5. One-source mechanics per host

| Component | Source | Claude Code sees it via | Antigravity sees it via |
|---|---|---|---|
| Protocol | `core/AGENTS.md` | `@<repo>/core/AGENTS.md` line in `~/.claude/CLAUDE.md` | plugin `rules/AGENTS.md` junction (always-on) |
| Skills | `core/skills/bk-*` | junction `~/.claude/skills/bk-*` (author machine) or plugin `skills/` (public install) | plugin `skills/` junction |
| Rules | `core/rules/*.md` | junction `~/.claude/rules/bearingkit/` | plugin `rules/*.md` junction (fallback: fold into `rules/AGENTS.md` as `model_decision`) |
| Agents | `core/agents/*.md` | generated `adapters/claude/agents/*.md` with model map | not applicable; personas referenced by `bk-protocol` |
| Hooks | `core/hooks/*.cjs` | `adapters/claude/hooks/hooks.json` | `adapters/antigravity/hooks.json` |
| MCP | `core/mcp.json` | user-level `claude mcp add` by installer | `adapters/antigravity/mcp_config.json` |

Author-machine mode uses junctions (`mklink /J`, no admin needed) so an edit in `core/` is live in the next session on both hosts. Public mode installs the Claude plugin from the marketplace and registers `adapters/antigravity` in `~/.gemini/config/plugins.json`. Both modes read the same `core/`.

**Command naming.** Directory `core/skills/bk-spec` → `/bk-spec` on Antigravity and on Claude when installed by junction into `~/.claude/skills/`. When installed as a marketplace plugin, Claude Code prefixes plugin skills (`/superpowers:brainstorming` is the observed pattern), so the public form is expected to be `/bearingkit:bk-spec`; phase-1 test #1 confirms this and README documents both forms. The contract is the `bk-` directory name; it never changes between hosts or install modes.

## 6. Zero per-project configuration

`scripts/detect-stack.cjs` reads manifests and returns a stack profile:

| Signal | Detected | Guardrails derived |
|---|---|---|
| `package.json` scripts, `tsconfig.json`, `pnpm-lock` | node, typescript, react/next/vue/electron, test runner | `pnpm test`, `tsc --noEmit`, `pnpm build`, lint |
| `composer.json` | php, laravel, livewire/inertia | `pest`/`phpunit`, `pint`, `phpstan` |
| `pyproject.toml`, `requirements.txt` | python, fastapi/django | `pytest`, `ruff`, `mypy` |
| `build.gradle(.kts)` | kotlin/java, android/spring | `gradle test`, `lint` |
| `CMakePresets.json`, `*.sln`, `*.csproj` | c/c++, dotnet | `cmake --build`, `ctest`, `dotnet test` |
| `go.mod`, `Cargo.toml` | go, rust | `go test`, `cargo test` |
| `.git` present or not | verification mode | `git status`/`git diff` vs mtime + syntax check |

Skills read the project's own instruction files (`AGENTS.md`, `CLAUDE.md`, `README`, `docs/`) for facts: architecture, conventions, review checklists, hot paths, forbidden actions, secrets policy. No required section format; if a section titled like "review checklist", "KPI", "hot paths", "do not" exists, it is used. Hot paths default to: auth, payments/money movement, data deletion, migrations, security, external API contracts.

## 7. Skill catalog

Conventions: description ≤300 chars, bilingual cues, "Use when … / Not for …"; SKILL.md body ≤100 lines; heavy material in `references/`; each skill ends with a suggested next step (handoff chain). Attribution column names the upstream mechanism adapted (see §11 for licenses).

### 7.1 Core (v1.0)

| Skill | Intent | Modes | Gates and outputs | Adapted from |
|---|---|---|---|---|
| `bk-protocol` (hidden, `user-invocable: false`) | Shared references: council roles, evidence rules, RBA-lite block, host tool map, stack detection | — | — | Owner's Kim chỉ nam; ClaudeKit status protocol (ideas); Superpowers using-superpowers |
| `bk-map` | Understand an unfamiliar codebase; build/refresh an architecture map into project docs | `--refresh` | Map with `file:line` anchors; proposes doc diff | feature-dev code-explorer (Apache); Spartan onboard/brownfield; Antigravity knowledge items |
| `bk-research` | Answer a question with sources and confidence labels | `--deep` | Plan of queries, independent sources, claim labels | ClaudeKit research (ideas); built-in deep-research workflow |
| `bk-next` | Recommend the next step given repo state | — | Reads git, plans, resume payload | Owner's `/bs:next` |
| `bk-spec` | Restate the ask, list edge cases and assumptions, classify ACT vs COUNCIL, pin exact requirements | `--council` | RBA-lite (objective, scope, rollback, ≥3 edge cases); stops for approval when COUNCIL | Owner's `/bs:spec`; Superpowers brainstorming (MIT); spec-kit constitution/spec (MIT); ClaudeKit exact-requirements gate (ideas) |
| `bk-audit` | Council investigation, propose-first | `--predict` (5 lenses → GO/CAUTION/STOP), `--scenario` (12-dimension edge cases), `--security`, `--perf` | One verdict + priority matrix + rejected options | Owner's `/bs:audit`; ClaudeKit predict/scenario (ideas); claude-security lenses (Apache) |
| `bk-plan` | Written plan with phases, exit criteria, evidence per phase | `--from-branch` | `plans/<yymmdd-hhmm>-<slug>/plan.md` + phase files | Superpowers writing-plans (MIT); spec-kit tasks (MIT); ClaudeKit branch→plan (ideas) |
| `bk-build` | Execute a plan | `--parallel` (subagents in worktrees with file ownership), `--scaffold` (stack templates) | Scout-first with `file:line`; no side effects proof; preserve-working-code | Superpowers executing-plans, subagent-driven-development, using-git-worktrees (MIT); ClaudeKit cook gates (ideas); Antigravity-Core templates (owner) |
| `bk-test` | Tests as contract | `--tdd`, `--browser` (Playwright/DevTools) | Red→green evidence; negative control | Superpowers TDD (MIT); pr-review-toolkit test analyzer (Apache); Spartan qa/e2e |
| `bk-debug` | Root cause before fix | — | Four phases; escalate to council after 3 failed attempts | Superpowers systematic-debugging (MIT) |
| `bk-refactor` | Behavior-preserving simplification and modernization | `--simplify` | RBA-lite; approval before edits; tests unchanged | built-in `/simplify`; code-simplifier (Apache); Antigravity-Core refactor-agent (owner) |
| `bk-review` | Adversarial review of a diff or proposal | `--second-opinion` (another model via Codex/Gemini), `--pr` | Confidence-scored findings (≥80 reported), hot-path independent gate, fix-of-fix rule | Owner's `/bs:review`; official code-review method (Apache); pr-review-toolkit lenses (Apache); Superpowers receiving-code-review (MIT) |
| `bk-perf` | Measure, then optimize | `--web` (CWV, LCP), `--memory` (heap), `--db` (delegates to bk-db) | Numbers with method or "not measured"; budgets | Owner's LCP and memory-leak skills; Antigravity-Core performance budgets (owner) |
| `bk-ship` | Finish safely | `--pr` | Auto-detected guardrails run and pasted; conventional commit; PR body; no "done" without verification | Superpowers finishing-a-development-branch, verification-before-completion (MIT); commit-commands (Apache); Owner's `/bs:ship` |
| `bk-ops` | Deploy and operate | `--deploy` (pre-flight, rollback), `--incident` (alert → metrics → logs → code), `--ssh` | Read-only first; explicit confirmation for remote changes | Owner's ssh skill and Server-Performance practice; Spartan deploy/ops-investigate |
| `bk-close` | End-of-session handoff | `--docs` (doc drift proposals), `--retro` (git-derived), `--journal` (honest post-mortem) | Two blocks: durable knowledge proposals + resume payload verified against git; no secrets | Owner's `/bs:close`; ClaudeKit watzup/retro/journal (ideas); claude-md-management (Apache) |
| `bk-design` | Distinctive UI, not template defaults | `--critic`, `--a11y` | Design plan → self-critique → build; WCAG baseline | frontend-design (Apache); Antigravity-Core ui-ux-pro-max data (owner); owner's design-critic |
| `bk-db` | Database performance with provenance | `--explain` (runs EXPLAIN via psql/mysql) | Three-tier knowledge never mixed; decision tree when KB empty | Owner's database-playbook and DatabasePerformance KB |
| `bk-devtools` | Browser debugging via Chrome DevTools MCP | — | — | Owner's chrome-devtools skills (license to verify before public) |

### 7.2 Optional (phase 3)

`bk-preview` (visual explain/diff/plan-review in Markdown+HTML; clean-room), `bk-loop` (metric-driven iteration with stuck detection), `bk-admin` (Velzon admin design system; large assets stay in repo, loaded on demand), `bk-laravel` (Laravel + Inertia performance), `bk-prisma-guard` (known-failure guard pattern), `bk-react-perf` (links to Vercel React best practices; not vendored).

## 8. Agents (Claude Code adapter)

| Agent | Model / effort | Tools | Purpose |
|---|---|---|---|
| `bk-scout` | haiku / low | read-only | Parallel codebase scouting with `file:line` output; timeout per segment |
| `bk-researcher` | sonnet / medium | read + web | Sourced research with confidence labels |
| `bk-reviewer` | opus / high | read-only | Independent adversarial gate for hot paths; never the author of the change |
| `bk-kb-author` | sonnet / medium | read + write (KB only) | Writes provenance-tagged articles from transcripts |
| `bk-query-optimizer` | sonnet / medium | read + shell (psql/mysql) | EXPLAIN-based diagnosis |
| `bk-design-critic` | sonnet / medium | read + browser | Anti-generic design review, a11y checks |

Antigravity has no persona files; the same persona text lives in `core/agents/` and is referenced by `bk-protocol` so the model can role-play the council there.

## 9. Rules (path-scoped)

Thirteen files, each ≤120 lines, dual frontmatter:

```yaml
---
paths: ["**/*.ts", "**/*.tsx"]      # Claude Code
trigger: glob                        # Antigravity
glob: "**/*.ts,**/*.tsx"             # key name to confirm in phase 1 test #2; both `glob` and `globs` emitted if needed
---
```

Tier 1 (rules + deep skills): typescript-react (incl. Next, Vue, Electron), node, python, php-laravel, sql-postgres-mysql, shell (bash, PowerShell).
Tier 2 (rules only): java-kotlin (Spring, Android/Compose), csharp-dotnet, go, c-cpp, rust, swift, dart-flutter.
Plus `security-baseline.md` (always-on, ≤40 lines).

Content is distilled from Antigravity-Core v5 (owner), fullstack-dev-skills (MIT), Diamond++ conventions (owner), official framework docs. No vendored third-party text without a permissive license.

## 10. Hooks (dual-host)

| Hook | Claude event | Antigravity event | Behavior |
|---|---|---|---|
| `stack-profile` | SessionStart, UserPromptSubmit | PreInvocation | Injects ≤120 tokens: stack, guardrails, branch, active plan/phase, tree dirty, hot-path touched, resume payload present |
| `privacy-block` | PreToolUse (Read/Edit/Bash) | PreToolUse | Blocks secrets files; `APPROVED:` retry protocol |
| `scout-block` | PreToolUse | PreToolUse | Blocks reading `node_modules`, `dist`, `.git`, etc.; fixes: quoted strings ignored, `git` commands allowlisted |
| `ship-gate` | PreToolUse on `git commit|push`, Stop | PreToolUse, Stop | Deny/continue when guardrails have not run this session after code changes; reason names `/bk-ship` |
| `hot-path-flag` | PostToolUse (Edit/Write) | PostToolUse → state file → PreInvocation | Marks independent review required; matches paths and content: auth, session, roles, upload, user-authored HTML or URL props, tenant scoping, migrations |
| `temp-bypass-gate` | PreToolUse on `git commit|push`, deploy commands | PreToolUse | Blocks while code marked TEMPORARY / REMOVE-when-done has passed its expiry or has no expiry; lists the markers |

One script per hook detects host by payload keys (`hook_event_name` vs `conversationId`) and emits the host's output schema. All hooks are fast, synchronous, no LLM calls.

## 11. Auto-activation architecture

1. **Descriptions as probabilistic router.** Action first, then "Use when" with EN+VI cue phrases and symptoms, then "Not for". Tuned by activation evals (precision/recall per host).
2. **Always-on router in `core/AGENTS.md` (~20 lines).** Classify every request into one of ten intents (question, small change, feature, bug, review, ship, design, data, ops, research) → skill; the 1% rule (invoke to check, drop if wrong); questions answered directly; handoff chain spec→plan→build→review→ship→close with propose-first stops.
3. **State injection** by `stack-profile` hook so the model knows where it is (branch, plan phase, dirty tree, hot paths).
4. **Deterministic gates** by hooks for commit/push/stop/hot paths.
5. **Learning loop.** Host memory (Claude auto-memory, Antigravity knowledge items) stores routing preferences; `bk-close` writes resume payload; `doctor` flags skills with zero calls in 30 days; monthly evals re-tune descriptions.
6. **Anti-over-trigger.** Heavy skills run `context: fork` and need explicit signals; below moderate match ask one short question; explanations never summon the council.

Metrics: activation precision and recall on the prompt set; false-block rate of hooks; number of manual skill invocations per session.

## 12. Upstream learning

`upstream/sources.json` entry schema:

```json
{
  "superpowers": {"repo": "obra/superpowers", "ref": "v5.1.0", "sha": "<sha>", "license": "MIT",
    "mode": "adapt", "tracks": ["skills/*/SKILL.md"],
    "derived": {"bk-spec": ["skills/brainstorming/SKILL.md"], "bk-plan": ["skills/writing-plans/SKILL.md"]}},
  "claude-plugins-official": {"repo": "anthropics/claude-plugins-official", "license": "Apache-2.0", "mode": "adapt", "tracks": ["plugins/code-review/**", "plugins/frontend-design/**", "plugins/claude-code-setup/**"]},
  "spec-kit": {"repo": "github/spec-kit", "license": "MIT", "mode": "ideas-only"},
  "claudekit-engineer": {"repo": "claudekit/claudekit-engineer", "license": "proprietary", "mode": "ideas-only", "note": "private checkout; never copy text"},
  "vercel-agent-skills": {"repo": "vercel-labs/agent-skills", "license": "none", "mode": "reference"},
  "antigravity-builtin-docs": {"path": "~/.gemini/antigravity/builtin/skills", "mode": "reference"}
}
```

Modes: `adapt` (text may be adapted with attribution), `ideas-only` (mechanisms re-implemented clean-room), `reference` (link only).

Flow (monthly or on demand): `upstream-watch` fetches each source, diffs tracked files since the locked sha, writes `docs/upstream/<date>-<source>.md`; `/bk-audit` decides absorb or skip; changes land in `core/`; `evals` must be ≥ baseline and fixed tokens must not grow; the sha is advanced.

License table (verified 2026-09-10): Superpowers MIT; anthropics/claude-plugins-official Apache-2.0 including frontend-design and claude-code-setup; spec-kit MIT; context7 MIT; Skillmark MIT; fullstack-dev-skills MIT; anthropics document-skills governed by Anthropic terms (not open); vercel-labs/agent-skills no license file (all rights reserved by default); ClaudeKit proprietary.

## 13. Evals and doctor

- `evals/prompts/activation/`: 10 prompts per host per intent; expected skill; measured precision/recall.
- `evals/<skill>/tests/*.md`: prompt + expected outcome; run across haiku/sonnet/opus on Claude and the default model on Antigravity; Skillmark-compatible format.
- Five superiority axes recorded in README with dates: correctness on evals, tokens per standard task, hosts covered per install, mandatory evidence gates passed, feature lag versus upstream after `upstream-watch`.
- `doctor` checks: description ≤300 chars; SKILL.md ≤100 lines body; rules ≤120 lines; `name` equals directory; no BOM; no nested skills; no dead cross-references; fixed-token estimate under budget; duplicates across hosts; cleanup list for legacy installs.
- CI: `doctor` on every PR; activation evals nightly or on skill changes.

## 14. Token budget contract

| Item | Budget (Claude) | Measurement |
|---|---|---|
| `AGENTS.md` | ≤2,500 tokens | `/context` |
| Skill listing (25 skills) | ≤2,200 tokens | `/context`, `/skill-doctor` |
| Agents listing | ≤500 tokens | `/context` |
| Rules when no matching file open | 0 | `/context` |
| Hooks injected context | ≤120 tokens per turn | hook output length |
| **Total fixed** | **≤5,000 tokens** | `/context` at phase-1 gate |

Antigravity estimates are recorded only after measurement in the Skills & Customizations panel.

## 15. Migration plan (author workstation)

| Phase | Work | Exit criteria | Est. |
|---|---|---|---|
| 0 Foundation | Rotate exposed API key (owner); backup `~/.claude` and `~/.gemini/config` with checksums; fix `cli.py` stdout encoding and two dead paths in DatabasePerformance; disable `skill-dedup.cjs`; move `~/.claude/skills/.shadowed` to `C:\Projects\_archive\2026-09-10\`; this spec approved | KB search works through a pipe; backups verified | 0.5 day |
| 1 Core | `core/AGENTS.md`; the 11 protocol skills (`bk-protocol`, `bk-next`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`); `detect-stack.cjs`; `stack-profile` hook; both adapters; junction install on both hosts; 3 compatibility tests; activation prompt set | 10/10 activation on both hosts; `/context` ≤5K | 2 days |
| 2 Outer layers | 13 rules, 6 agents, 4 remaining hooks; the 8 remaining core skills (`bk-map`, `bk-research`, `bk-refactor`, `bk-perf`, `bk-ops`, `bk-design`, `bk-db`, `bk-devtools`); disable fullstack-dev-skills; remove Superpowers plugin; archive Spartan and ClaudeKit global remnants; LSP plugins; context7 MCP | `doctor` green; no dead references | 1.5 days |
| 3 Optional skills and project cleanup | 6 optional skills (§7.2); BOM and encoding fixes; delete project copies of `/bs:*` in 4 projects; archive 13 legacy `.agent/` trees from the `doctor` list | Each skill body ≤100 lines; no project carries two instruction sets | 2 days |
| 4 DB knowledge base | `bk-kb-author` writes canonical-topic articles in three batches (Sonnet writes, Opus cross-checks; chunk topics >200K tokens) | Every article passes `epp lint`, `verify`, `index` | background |
| 5 Acceptance and public readiness | `upstream/sources.json`, `upstream-watch`, evals, README EN/VI, NOTICE, CI; one-week trial on four projects across both hosts | No skill with zero calls; evals ≥ baseline | 1.5 days + 1 week |

**Actions requiring explicit owner approval in the turn they run:** any write under `~/.claude` or `~/.gemini/config`; edits in DatabasePerformance; deletions or archiving in other projects.

**Compatibility tests (phase 1):** (1) Claude skill naming when `name` differs from directory and when installed via junction vs plugin; (2) Antigravity rule frontmatter: `glob` vs `globs`, and whether plugin `rules/*.md` accept triggers; (3) Claude Code tolerance of unknown frontmatter keys in rules.

## 16. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Activation regresses after consolidation | medium / high | Keep proven cue phrases; activation evals gate before archiving old commands |
| Vietnamese-only descriptions trigger poorly for English prompts | medium / medium | Bilingual descriptions, English first |
| Old and new kits active at once | high if unmanaged / high | Installer disables old before enabling new; `doctor` detects duplicates |
| Absorbing upstream shifts maintenance to us | certain / medium | `upstream-watch` + evals are v1 deliverables, not follow-ups |
| Windows symlink issues | medium / medium | Directory junctions only; generated copies where a rename is required |
| Timeline optimism | high / medium | Phase gates; ship phase 1 alone and measure |
| License drift when contributors add content | medium / high | `doctor` requires `derived` provenance for any skill citing upstream; CI blocks unknown-license vendoring |

## 17. Success metrics (v1.0)

- Fixed context ≤5,000 tokens on Claude (measured), single install per host.
- Activation precision ≥0.9 and recall ≥0.9 on the prompt set, both hosts.
- Zero project-level kit files across the owner's projects.
- 100% of skills carry provenance and license mode; `NOTICE` complete.
- `upstream-watch` produces a delta report for every source at least monthly.

## 17b. Field lessons from BSWebSaaS (2026-06 → 2026-09) and the capabilities they add

Source: GitHub `tuyenht/BSWebSaaS` main (66 PRs, 100+ commits), the server checkouts `/opt/bswebsaas/{prod,dev}` (read-only inspection 2026-09-10), the owner's CLAUDE.md §10 (Autonomy Gate, Council, Diamond++, DONE, learning log, anti-rot), 23 plan folders, council/audit reports, and the reviewer agent memory. Each row names evidence, then the Bearingkit capability that would have prevented or caught it.

| # | Lesson (evidence) | Capability (where) |
|---|---|---|
| L1 | A temporary owner auto-login route marked "REMOVE when done" stayed live on prod for two months and was hit 25 times from external IPs, including a Telegram preview bot | **Temporary-bypass tracker**: any code marked TEMPORARY / REMOVE / backdoor must carry an expiry; `bk-close` lists live bypasses; `temp-bypass-gate` hook blocks deploy or commit while an expired bypass exists (§10) |
| L2 | Guardrails declared in CLAUDE.md (Infection, Rector, Lighthouse, axe) were never wired into CI; CI itself stayed red for weeks because PHP ini limits differed from runtime | **Declared-gates reconciler** in `doctor --project` and `bk-ship`: diff declared gates vs CI workflow and local scripts; flag CI red streaks before feature work; compare CI runtime config with the real runtime |
| L3 | Ten commits of admin styling shipped unstyled because `@vite` was missing and tests only asserted class strings; a Turnstile widget needed five fix PRs in one day | **Rendered verification**: `bk-test --browser` is mandatory for UI diffs; screenshot plus asset-resolution check is the evidence, never markup assertions alone |
| L4 | Stored XSS through author-controlled URL props, missing login throttle, cross-tenant admin reach, an inert `role.level`, a credential-enumeration oracle, replayable OAuth tokens, sessions surviving password rotation. All found by later audits, not at implementation time | **Hot-path escalation by diff content**: `hot-path-flag` hook matches paths and content (auth, session, roles, upload, user-authored HTML or URL props, tenant scoping) and forces `bk-review --security` with `bk-reviewer`; invariants become regression-locking tests, as the owner did for cookie attributes |
| L5 | The best guardrails in the repo introspect the schema or forbid patterns by regex, so a forgotten RLS or a stray role assignment fails CI by itself | **Invariant-to-test generator** in `bk-build`: when a COUNCIL decision creates an invariant, emit a self-maintaining coverage or chokepoint test, not a one-off assertion |
| L6 | A destructive migration was safe only because the human wrote a plan row demanding a repo-wide reader grep beyond the ORM, a tested `down()`, and a stop | **Migration safety harness** in `bk-build --migration`: classify additive vs destructive; grep raw SQL, views, jobs, exports, seeds; require tested rollback and `CONCURRENTLY`; explicit human stop |
| L7 | Twenty-two plan folders and all council reports exist only in the gitignored `plans/` of the server checkout; the best handoff prompt was untracked | **Committed handoff**: `bk-close` writes `docs/handoff/<date>.md` into the repo and proposes the commit; `doctor` warns when plan or handoff folders are ignored |
| L8 | One stale locale fact needed three commits to purge from docs, docblock, fixture and comment; Vite 7 vs 8 drift; a handoff doc said Laravel 12 for a Laravel 13 project | **Fact registry and drift detector**: declared load-bearing facts (versions, locales, table names) are grepped across docs, code and CI by `bk-close --docs` and `doctor`; count-free references are the default |
| L9 | AI proposed syntax from older majors (Tailwind 4 heading reset, undeclared theme colors, Laravel 12 idioms) exactly as the owner predicted in design.md | **Version card**: `detect-stack` reads lockfiles and the `stack-profile` hook injects exact installed majors; `bk-protocol` rule: for majors newer than training, consult pinned docs via context7 before writing framework code |
| L10 | `npm install` emitted on a pnpm-only machine; three commits to settle one CI config | **Environment-parity preflight**: `detect-stack` reports package manager and runtime versions; generated CI or scripts must reference only toolchains present |
| L11 | 8 of 8 admin color pairs failed WCAG, fonts unsubset, a zero-byte JS chunk preloaded; found manually after deploy | **Design import validator and budgets**: `bk-design --critic` computes contrast, checks reduced motion, focus and skip links; `bk-perf --web` checks asset budgets before "done" |
| L12 | Prod checkout is seven weeks behind dev, carries uncommitted live edits, four orphaned `compose run` containers ran for seven weeks, dev Horizon unhealthy | **Ops drift check** in `bk-ops --deploy`: prod HEAD vs main, uncommitted files on prod, orphan or unhealthy containers, backup age; refuses deploy on drift without acknowledgement |
| L13 | The reviewer agent kept project memory with "load-bearing facts, verify before relying" and "accepted trade-offs", which made later reviews faster and safer | **Agent memory as reviewer knowledge**: `bk-reviewer` runs with `memory: project`; `bk-close` proposes memory entries labelled decided, evidenced, or proposed |
| L14 | Design-vs-code audits ran in two reconcile rounds with VERIFIED, MISMATCH, GAP and DECISION sections, each diff labelled ACT or COUNCIL; the owner keeps the audit prompts as files | **Audit template** in `bk-audit --docs`: the owner's own reconcile format and prompts become skill references (owner-authored text, license-free) |
| L15 | The project already uses vendor-official skills shipped by Laravel Boost plus a `.ai/` override layer | **Vendor-skill deference**: `bk-protocol` detects vendor-shipped skills or guidelines in the project and defers to them for that framework instead of the kit's generic rules; `doctor` flags overlap |
| L16 | The owner's own July hardening made `/bs:ship` execute ACT tasks directly and convene a council only for COUNCIL-class work, removing ceremony | **Autonomy Gate classifier**: `bk-spec` and the `stack-profile` hook pre-classify from diff paths (migrations, routes, auth, policies, module contracts, multi-module) and default to COUNCIL when unsure; ACT never asks |
| L17 | The learning log added on 2026-07-30 never received a line; the loop existed on paper only | **Learning loop that fires**: `bk-close` and the Stop hook prompt for a RULE line when a user correction or a guardrail failure after the agent's own change is detected; append-only, evidence required, derived only from user turns and test results |
| L18 | Multi-step state changes without a transaction produced silent 404s; boundary validation missed past-time scheduling; rate-limiter state leaked across tests until `Cache::flush()` per test | **Review lenses** in `bk-review`: multi-step mutation implies transaction or saga; validate at the boundary and in the UI; test isolation of singletons and caches |

The owner's own text that is lifted verbatim into `core/` (owner-authored, license-free): Autonomy Gate §10.1 with the tie-breaker, Council Protocol §10.2 including "no theatrics", Definition of DONE §10.4, Diamond++ items 1, 6 and 8, the two-block `/bs:close` handoff with the reconcile protocol, the four-step `/bs:spec` ritual, the evidence-or-unverified line, the "propose from real state" line, the reviewer stance "no rubber-stamp", the version-drift warning, and "prevent traps by architecture, not by manual discipline".

## 18. Decisions log

| Date | Decision |
|---|---|
| 2026-09-09 | Consolidate into one kit; absorb rather than install; two hosts from one source |
| 2026-09-09 | Projects carry no kit files; skills read project docs and manifests |
| 2026-09-10 | Name `Bearingkit`, prefix `/bk-`, identical commands on both hosts |
| 2026-09-10 | Tier-1 languages: TS/JS, Python, PHP/Laravel, SQL, shell; tier-2: Java/Kotlin, C#, Go, C/C++, Rust, Swift, Dart |
| 2026-09-10 | ClaudeKit: ideas only, no install; Superpowers: absorbed, plugin removed after phase 2 |
| 2026-09-10 | DB KB: fix encoding bug now; author articles by canonical topic in background |
| 2026-09-10 | Field lessons L1–L18 from BSWebSaaS adopted (§17b); Autonomy Gate classifier and temporary-bypass tracker added; ACT-class work never asks for approval |

## 19. Glossary

- **Kim chỉ nam** — Vietnamese for "compass" and, by extension, "guiding principle"; the owner's engagement protocol that Bearingkit generalizes.
- **Council (Hội đồng)** — a structured multi-perspective debate that ends in one verdict and a priority matrix; used for COUNCIL-class tasks only.
- **Hot path** — code where a mistake costs money, data, or trust; always gets an independent review gate.
- **RBA-lite** — a short Reasoning-Before-Action block: objective, scope, rollback, ≥3 edge cases, decision.
