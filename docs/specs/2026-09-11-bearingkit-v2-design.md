# Bearingkit v2 — Design Specification

Status: v2.0, approved by the owner on 2026-09-11 · Supersedes `2026-09-10-bearingkit-v1-design.md` (v1.4) except its §3 (verified host mechanics) and §18 (field lessons), which stay the record and are cited from here · Owner: tuyenht · Command prefix: `/bk-`

> **Tóm tắt (VI).** Bản 2 đổi hình dạng, giữ nội dung. Kit là một thư mục `skills/` theo chuẩn Agent Skills, cài vào từng công cụ bằng lệnh cài của chính công cụ đó, không còn installer riêng, không còn lớp rules theo host, không còn hook trung gian. Mỗi host chỉ cần một cơ chế bootstrap để nạp protocol lúc mở phiên. Thời gian dành cho việc chắt lọc nội dung từ các nguồn trong ma trận thành bộ skill chuẩn của chủ sở hữu; đo đạc chỉ ở mốc phát hành. Mẫu hình là obra/superpowers 5.1.0, đã soi trực tiếp trong cache ngày 2026-09-11.

## 1. Purpose, goals, non-goals

**Purpose.** One skill set that makes any AI coding agent work like a disciplined senior team: understand before acting, propose only when the blast radius demands it, prove before claiming, hand off cleanly. Installed into each tool separately from one source.

**Scope test.** Every capability the kit carries — a skill, a reference, a pack — earns its place by one test: does it let one person do the work an entire team would otherwise need for that task? What fails it is a non-goal below, or belongs in a project's own instructions, not the kit's; §5.2 applies the same test before any skill enters the final catalog.

**Goals**

1. One source, `skills/`, in the Agent Skills format every current host reads. A skill is the same file on every host.
2. Install with the host's own command: plugin marketplace on Claude Code, Cursor, Codex, Copilot CLI and Factory Droid; extension on Gemini CLI; a copied plugin directory on Antigravity. No kit installer, no links, no generated files except the Antigravity copy.
3. Content over machinery. The owner's time goes to distilling the best of every source in the coverage matrix into the kit's skills; the repository carries the least tooling that keeps that content correct.
4. Quality as you go: every skill enforces evidence, tests, review and scope discipline so that code is correct at each step and stays inside the request.
5. Fixed context stays under 5,000 tokens on Claude Code; measured at release, not per change.
6. Every capability traceable to a source with a license mode; `NOTICE` complete.
7. Current technology by construction, through four named mechanisms (§16): the version card in every stack file, the stack profile that reads majors from the lockfiles, pinned-documentation lookup before writing syntax newer than the model's training, and a drift watch over both the upstream sources and the hosts (v1 §18 L9; context7 documented per host).
8. Built for a one-person software company that drives AI agents: the skill set covers the whole lifecycle from request to handoff, the independent review comes from a different model or host, and every session ends with a handoff and lessons the next session reads.

**The owner's requirement, as rendered by the session that wrote this section (2026-09-10 and 2026-09-11) — a rendering, not a transcript.** The verbatim of the four directives of 2026-09-11 is in `docs/handoff/2026-09-11-owner-directives.md` and governs where the two differ; no verbatim of the 2026-09-10 statement exists in this repository, so nothing below may be quoted as the owner's words. One kit that supports many AI tools but installs into each separately, from one source skill; no time spent on intermediate machinery; the time goes to synthesizing, classifying and distilling the best of every source in the coverage matrix into the owner's own standard skill set, covering all vibe-coding work for building software systems, applications and tools of the highest quality, optimal and lightest; code that is correct at every step and stays inside the request; AI that follows the most modern, leading and optimal technology; the council of senior experts adds what is good and fits. Superpowers, the official code-review, frontend-design and claude-code-setup plugins are mandatory sources; the kit must be better and more complete than each source it replaces, and "better" is only ever claimed from a measurement (§11).

**Non-goals (v2)**

- A universal installer that writes into host profiles. Every host ships its own install command, and `--plugin-dir` together with the host's own plugin install made the link layer unnecessary (v1's `scripts/install.cjs`, deleted in `156ab09`); the one host without an install command, Antigravity, is served by the copy script named in §3.
- An at-runtime shim. Superpowers rejects those for the same reason the kit does: they do not load the bootstrap at session start.
- Per-host rule files for languages. Stack guidance lives in skill references, read on demand.
- Product discovery, UX pipeline, AI-feature engineering and dependency hygiene as core skills; they are optional packs decided by the inventory (§5.2).
- Copying text from proprietary sources; owner-private material; anything a host or framework vendor already ships.

## 2. Principles

1. **Content over machinery.** A line of tooling exists only when it keeps skill content correct or measurable.
2. **One source, native install per host.** `skills/` is the product; each host gets a manifest in that host's own format and nothing more.
3. **Kit holds process and technology expertise; projects hold facts.** Facts are read from the project's own docs and manifests, never copied.
4. **Official first.** Native or vendor-shipped capabilities are used, not re-implemented.
5. **Absorb, attribute, re-evaluate.** Permissively licensed mechanisms are adapted with attribution; `upstream/sources.json` records provenance; ideas-only sources contribute no text.
6. **Host-agnostic text, one bootstrap per host.** Skill bodies describe actions, not tool names; `bk-protocol/references/host-tools.md` maps them. The only host-specific files are the bootstrap wiring in §3.
7. **Evidence before assertion.** `file:line`; numbers with a method or "not measured"; negative controls; no untested claims in commits or docs; verified decisions are sticky.
8. **Proportionate gates, in the skills.** ACT never asks; COUNCIL proposes and waits. Gates live in skill bodies on every host; host hooks that enforce them at push or deploy are optional extras where a host has the event.
9. **Budget is a contract, measured at release.** Descriptions, the bootstrap and the agents listing are sized; the activation set and the token reading run before a release, not after each edit.

## 3. Hosts and bootstrap

The bootstrap is the text of `skills/bk-protocol/SKILL.md` (§6) loaded at session start. Without it the skills are present on disk and never invoked; with it the router in the protocol names the skill before any code is read.

| Host | Install | Bootstrap | Status 2026-09-11 |
|---|---|---|---|
| Claude Code 2.1.268 | `/plugin marketplace add tuyenht/Bearingkit`, then `/plugin install bearingkit@bearingkit`; development and evals: `claude --plugin-dir <repo>` | `hooks/hooks.json`: SessionStart on startup, clear and compact runs `node "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.cjs"`, which returns the protocol as additional context | **verified 2026-09-11** on 2.1.268: `--plugin-dir` lists the plugin as `bearingkit@inline` with the ten skills, `bk-protocol` hidden, the SessionStart hook injects the protocol, the acceptance test passes (`docs/hosts.md`) |
| Antigravity 2.0 | `npx bearingkit antigravity install`: copies `skills/`, `.antigravity/plugin.json` and a generated `rules/bearingkit.md` into `~/.gemini/config/plugins/bearingkit` (real directory; the scanner does not follow junctions) | the always-on rule `rules/bearingkit.md`, the protocol body with `trigger: always_on` | **verified 2026-09-11** on 2.12.2 with Opus 4.6: the always-on rule loads and the acceptance test passes, provided the rule carries the Antigravity host note ("invoking a skill means opening `skills/<name>/SKILL.md` with `view_file` first"); without it the model names the skill and explores instead (`docs/hosts.md`) |
| Gemini CLI | `gemini extensions install https://github.com/tuyenht/Bearingkit` | `gemini-extension.json` names `GEMINI.md`, which imports `./skills/bk-protocol/SKILL.md` | wired from the Superpowers shape; pending |
| Cursor | plugin marketplace | `.cursor-plugin/plugin.json` points at `skills/`, `agents/` and `hooks/hooks-cursor.json` (sessionStart runs the same script) | wired; pending |
| Codex CLI and app | OpenAI plugin marketplace | `.codex-plugin/plugin.json` points at `skills/`; how Codex loads the bootstrap is not yet known (Superpowers ships an empty `AGENTS.md`) | wired; pending, bootstrap unverified |
| Copilot CLI, Factory Droid | same marketplace format as Claude Code | same `hooks/hooks.json`; the script also returns the top-level `additionalContext` key those hosts read | pending |
| OpenCode | its plugin manager, a JS plugin that transforms the system prompt (135 lines in Superpowers) | not wired | candidate |

A host is listed as supported only after the acceptance test in §11 passes on it. The mechanics of Claude Code and Antigravity (frontmatter keys, hook events and payloads, plugin discovery, transcript locations) are recorded in v1 §3 and are unchanged.

## 4. Repository layout

```
Bearingkit/
  skills/bk-<name>/SKILL.md          # the product: body ≤100 lines; references/ read on demand; tests/ (§11)
  skills/bk-protocol/                # the bootstrap text and the shared references (gate patterns, personas, evidence, council, RBA-lite, host tools, handoff template, meta-routing)
  agents/bk-<name>.md                # four agent files for hosts with agent definitions (Claude Code, Cursor); written by hand from personas.md
  hooks/hooks.json                   # Claude Code, Copilot CLI, Factory Droid: SessionStart → session-start.cjs
  hooks/hooks-cursor.json            # Cursor: sessionStart → the same script
  hooks/session-start.cjs            # prints the protocol body as hook context in the three key shapes the hosts read
  .claude-plugin/plugin.json · marketplace.json
  .codex-plugin/plugin.json · .cursor-plugin/plugin.json · gemini-extension.json · GEMINI.md
  .antigravity/plugin.json           # copied by scripts/antigravity.cjs
  scripts/                           # detect-stack.cjs · record-guardrail.cjs · antigravity.cjs (install, uninstall) · evals.cjs · antigravity-evals.cjs · antigravity/ (driver) · lib/state.cjs
  bin/bearingkit.cjs                 # evals · antigravity install|uninstall · doctor (later)
  evals/                             # activation prompts, fixture, results (gitignored)
  tests/                             # node:test: skills static checks, manifests, agents, hook output, Antigravity copy, detect-stack, state, evals parsing
  upstream/sources.json · NOTICE     # provenance and attribution
  docs/specs · docs/plans · docs/handoff · docs/compat · docs/hosts.md
  AGENTS.md · CLAUDE.md              # working agreement for developing the kit (not the product)
  README.md · package.json · LICENSE (owner writes the copyright line)
```

Removed from v1: `core/` (skills moved up; the protocol became `bk-protocol/SKILL.md`; the security baseline folded into it; the stack-profile hook and its host adapters deleted), `adapters/`, `scripts/install.cjs`, the language-rule layer, `core/mcp.json` (context7 is documented per host in `docs/hosts.md`, never installed by the kit).

## 5. Skills

### 5.1 Catalog and taxonomy

Two axes. **Lifecycle** skills, one per intent, are the chain: `bk-map`, `bk-research`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-next`. **Domain** skills carry expertise the chain calls: `bk-design`, `bk-perf`, `bk-db`, `bk-ops`, `bk-setup`. `bk-protocol` is the hidden bootstrap and reference holder. That is the seventeen of v1 §7, unchanged in name and intent, plus `bk-setup` — making a project ready for agents on every host the owner uses — added by the owner on 2026-09-16 (D5 question 22; design `docs/specs/2026-09-16-bk-setup-design.md`): **eighteen**. The gates and outputs of the seventeen from v1 §7.1 still apply.

Optional packs, decided by the inventory (§5.2), never in the default install: `bk-product` (discovery, validation, interview, lean canvas), `bk-ux` (a one-person research-to-handoff flow), `bk-agent` (LLM features and agents: prompts, tools, evals, cost), `bk-deps` (dependency and supply-chain hygiene), plus `bk-preview` and `bk-guard` from v1 §7.2.

### 5.2 Inventory and dedup rule

Every skill, command, rule set or agent in every source of the coverage matrix is inventoried once, in `docs/specs/<date>-skill-inventory.md`, with three columns: the source item, the kit skill it maps to, and one decision: **absorb** into `references/` with attribution, **idea** carried into the body without text, or **drop** with a reason. One source item maps to exactly one kit skill. Licenses are verified before any text is taken; sources without a license file contribute ideas only. The inventory is produced by one research agent per source, merged and decided by the owner's agent, and it fixes the final catalog: a skill enters the catalog only when the inventory shows work for it that passes the scope test of §1 (one person doing a team's work).

### 5.3 Quality bar per skill

A skill is finished when all of these hold, and "raised to the highest standard" means exactly this list, nothing vaguer:

1. Body ≤100 lines in the anatomy of §5.4; the Gates section is rigid, the Steps adapt to context.
2. Every rule in the body traces to a source in the inventory or to a field lesson (v1 §18); every reference file names its sources and points at `NOTICE`.
3. `skills/<name>/tests/` holds at least three prompts with the expected outcome (§11).
4. The activation set has a positive and a negative prompt for the skill's intent in both languages.
5. The skill passes the acceptance test on Claude Code and Antigravity before it is listed as done.

### 5.4 Anatomy

Frontmatter: `name` equal to the folder, `description` ≤300 characters in the template of v1 §7.3 (one action clause, "Use when:" cues in English then Vietnamese, "Not for:" the nearest neighbour), and only the Claude extension keys a host ignores harmlessly (`context`, `background`, `user-invocable`, `disable-model-invocation`). Values that contain ": " are quoted (Antigravity's parser is strict). Body sections in order: Read first, Steps, Gates, Evidence to paste, Next step. Heavy material in `references/`, cited by relative path; cross-skill references as `bk-protocol/references/<file>`. No flowcharts, no all-capitals blocks: the activation set measures routing, volume does not.

### 5.5 Stack guidance instead of rules

Language and framework guidance lives in `skills/bk-build/references/stacks/<stack>.md`, one file per stack (typescript-react, node, python, php-laravel, sql, shell, kotlin, c-cpp at first; others as the inventory shows sources). `bk-build`, `bk-test` and `bk-review` read the file the stack profile names. Each file opens with a version card ("Written against: …"). Cost is zero until read, on every host, with no per-host rule format. Vendor deference stands: a project that ships its own framework skills or guidelines gets those, not the kit's file. The security baseline is part of the protocol (§6) and therefore always loaded.

### 5.6 Stack profile

`scripts/detect-stack.cjs` (v1 §6) prints the stack profile: languages, framework majors from lockfiles, package manager, test, lint, type-check and build commands, hot-path globs, an environment-parity check, and notes: preconditions a guardrail has that its command line cannot say (the first is Terraform's, 2026-09-16: `validate` needs an initialised directory, and a plain `terraform init` configures the remote backend). Skills that need guardrail commands or hot paths run it once per session from the project root (`node <kit>/scripts/detect-stack.cjs`, where `<kit>` is the directory that holds `skills/`, known from the skill file's own path). Nothing is injected by a hook.

## 6. bk-protocol: the bootstrap

`skills/bk-protocol/SKILL.md` carries the protocol, ≤100 lines, marked `user-only` in Claude's skill listing rather than removed from it (`user-invocable: false`, `disable-model-invocation: true`; absent from the listing on 2.1.267 in the isolated profile on 2026-09-10, and listed as `user-only · ~80 tok · locked by author` after the host auto-updated on 2026-09-13 — a host change, not a kit change: `docs/compat/2026-09-13-daily-profile-readings.md`), and visible but inert on Antigravity. Blocks, in order: identity and the answer-in-the-user's-language rule; the Autonomy Gate (ACT, COUNCIL, the twenty-line rule, unsure → COUNCIL, ACT never asks); the Router (intent table, the one-percent rule, skill before reading code, the handoff chain); Evidence; Council; Definition of done; Handoff chain and hot paths; the Security baseline (the nine lines of v1's `security-baseline.md`); Host notes (tool map pointer, the stack profile command, where state lives, how a deny rule is lifted); the table of its `references/`. What each host does with it is §3; what it keeps from Superpowers' meta-skill is `references/meta-routing.md`. The bootstrap always names the kit root (the directory holding `skills/` and `scripts/`), because an injected text carries no path and the skills run `scripts/detect-stack.cjs` from it: the Claude hook prints the plugin root, the Antigravity copy prints its own path and also carries the three scripts and the host note ("invoking a skill means opening `skills/<name>/SKILL.md` with `view_file` first"), without which that host names the skill and explores instead.

## 7. Agents and independent review

Four personas, single-sourced in `bk-protocol/references/personas.md`: `bk-researcher`, `bk-reviewer`, `bk-query-optimizer`, `bk-design-critic` (roles and stances in v1 §8). `agents/bk-<name>.md` are hand-written Claude agent files with the persona text and the model, effort, tool and memory fields of v1 §8; a unit test keeps every persona paired with an agent file. Hosts without agent definitions run a persona in a fresh conversation. **Independent review** means a reviewer that did not author the change: a subagent on Claude, a fresh conversation elsewhere, and preferably a different model or host running the same `bk-review`, which the multi-host install makes free; the review is recorded with `record-guardrail.cjs --review`.

## 8. Gates and session state

Gates are in the skills and apply on every host: `bk-ship` refuses to push without pasted guardrail output, a clean secret scan of the staged diff, and a recorded independent review for a hot path; `bk-build` shows that only the planned files changed; `bk-close` lists live temporary bypasses. `scripts/record-guardrail.cjs` writes guardrail runs and reviews into `~/.bearingkit/state/` (v1 §10 store, unchanged) so a later host hook can read them. Host hooks that block push or deploy (`ship-gate`, `temp-bypass-gate` of v1 §10) are optional extras for hosts with a PreToolUse event, scheduled for v0.4, never required. Native deny lists for secret files are documented per host in `docs/hosts.md`; the kit writes no host settings.

## 9. Zero per-project configuration

Unchanged from v1 §6: the kit reads a project's manifests and instruction files and writes nothing into it except work products in conventional places (`plans/<yymmdd-hhmm>-<slug>/`, `docs/handoff/<date>.md`, `docs/architecture-map.md`, an existing `.claude/lessons.log`). Proposed edits to a project's own instruction files are COUNCIL-class, shown as a diff.

## 10. Provenance

`upstream/sources.json` records, per source: repo, tag, sha, license, mode (`adapt`, `ideas-only`, `reference`), tracked files, the derived map from kit files to source files, and the absorption date. `NOTICE` carries one section per adapted source with its license notice. A references file that says it is adapted from upstream must appear in a derived map (enforced by a test). The coverage matrix (`2026-09-10-coverage-matrix.md`) stays the list of sources with status; its measurement column is filled at releases only. `upstream-watch` (drift reports against the locked shas) is a v1.0 deliverable; who runs it, at what cadence and with what command, alongside the matching host-drift watch, is §16.

## 11. Evals and the release gate

- **Acceptance test per host**, the smallest proof a host is supported: a clean session with the kit loaded; (1) "What are the two classes of the autonomy gate, and what does each do?" answers ACT and COUNCIL with no skill invoked; (2) "Let's make a react todo list" invokes `bk-spec` before any code is written. Recorded in `docs/hosts.md` with the host version and date.
- **Activation set** (`evals/activation/`): the sixty prompts of Phase 1, extended by two positives and one negative per new skill; run on Claude Code with `claude -p --plugin-dir <repo>` in the isolated profile on the staged fixture, and on Antigravity with the DevTools driver. Gate: every positive routes, zero false activations on questions.
- **Skill tests** (`skills/<name>/tests/*.md`): prompt plus expected outcome, Skillmark-compatible, run locally.
- **Token reading**: `/context` in the isolated profile with the plugin loaded (the contract number), plus the `claude -p` first-turn total compared before and after a change on the same host version and day (the regression check; method in `docs/compat/phase-1-gate.md`).
- **Static checks** (`tests/`, later `doctor`): frontmatter safe for strict YAML, description budget, body length, cited references exist and are cited, provenance recorded, manifests consistent, agents paired with personas, the hook prints the protocol.
- **Cadence**: static checks on every commit; acceptance test when the bootstrap wiring or a host changes; activation set, skill tests and token reading at every release and after a skill's description changes. Never per edit.
- **Outcome benchmark** (v1 §17): twelve fixture tasks, kit against a Superpowers-only profile, same model and turn limit; the only basis for a "better than" claim.

## 12. Token budget (Claude Code)

| Item | Budget | Measurement |
|---|---|---|
| protocol injected at session start | ≤2,300 | `/context` memory or system-context line |
| skill listing (18 core since 2026-09-17; `bk-protocol` listed as `user-only` and charged since the host change of 2026-09-13) | ≤1,700 | `/context`; eleven skills read 900 by the panel's per-skill figures on 2026-09-13, about 1,390 projected at seventeen and about 1,470 at eighteen — projections, not readings |
| agents listing (4) | ≤300 | `/context` |
| auto-memory index | ≤200 | `/context` |
| **total fixed** | **≤5,000** (sum 4,500) | isolated profile, plugin loaded, default listing budget |

Antigravity numbers are read from the Customizations panel. Language guidance and references cost 0 until read.

## 13. Delivery

| Version | Content | Gate |
|---|---|---|
| v0.2 | this restructure; acceptance on Claude Code and Antigravity; the inventory and final catalog; the eight lifecycle skills distilled to §5.3 (Superpowers absorbed 2026-09-11, then the official code-review and pr-review-toolkit, frontend-design, claude-code-setup, then the sources the inventory assigns) | acceptance on both hosts; activation set at or above the Phase 1 numbers; fixed context ≤5,000 |
| v0.3 | remaining core skills; agents in daily use; stack files for the eight stacks | same gate plus skill tests for every listed skill |
| v0.4 | optional packs the inventory justified; optional push and deploy hooks; Gemini CLI, Cursor, Codex through their acceptance tests | acceptance on each listed host |
| v1.0 | outcome benchmark, `upstream-watch`, README EN and VI, LICENSE, CI, marketplace listings, publication from a squashed history | benchmark at or above Superpowers; §17 of v1 |

## 14. Risks

| Risk | Mitigation |
|---|---|
| A host changes its plugin or hook format | one file per host to update; the acceptance test catches it; hosts are listed only after passing |
| Activation regresses after a body or description edit | descriptions change only with an activation run; bodies are not in the listing |
| The Codex bootstrap never works | Codex stays "wired, pending"; no claim |
| Content distillation stalls on the inventory's size | one agent per source, merged in one session; per-skill sprints of one session each |
| Time drifts back into machinery | every tooling change cites the content it protects; measurements at release only |
| License drift | licenses verified before text is taken; the provenance test blocks unrecorded adaptations |

## 15. Decisions log

| Date | Decision |
|---|---|
| 2026-09-11 | Pivot to the Superpowers shape: `skills/` at the root, per-host manifests, one bootstrap per host, no installer, no rule layer, measurements at release; approved by the owner after a council proposal and an audit of that proposal |
| 2026-09-11 | Kept from v1: the seventeen-skill catalog and its gates, the `bk-` prefix, the protocol text, the state store and `record-guardrail`, `detect-stack`, the evals runners, provenance rules, the token contract; v1 §3 and §18 remain authoritative |
| 2026-09-11 | Language rules folded into `bk-build/references/stacks/`; the security baseline into the protocol; the four personas paired with hand-written agent files; enforcement hooks deferred to v0.4 as optional |
| 2026-09-11 | The inventory (§5.2) fixes the final catalog and the optional packs; product discovery, UX, AI-feature and dependency skills are packs, not core, until it says otherwise |
| 2026-09-11 | Hosts beyond Claude Code and Antigravity are wired from the Superpowers shapes and listed as supported only after the acceptance test |
| 2026-09-11 | §1 gained a named scope test (does it let one person do a team's work), cited from Non-goals and §5.2; §16 named goal 7's four technology-currency mechanisms — version card, stack profile, pinned-documentation lookup, drift watch — each with who runs it, how often, and the command |
| 2026-09-12 | Fixed a self-referential pointer in Non-goals (§1): "packs decided by the inventory (§5.1)" corrected to "(§5.2)" — §5.1 itself and this log's 2026-09-11 row both already cite §5.2 for that rule; §1's line was the one place out of step. A verified cross-reference fix, not a policy change (found during D5's audit for citations that don't check out against their target, `docs/specs/2026-09-12-d5-owner-questions.md` Phụ lục C) |
| 2026-09-12 | Fixed Non-goals (§1): the installer/shim rejection was one merged reason ("do not load the bootstrap at session start") applied to both. Split into two — the shim reason stands; the installer's real rejection reason is that every host now ships its own install command and `--plugin-dir` made the link layer redundant. The merged reason was factually wrong for the installer: v1's `scripts/install.cjs` did load the bootstrap — its `ensureImport()` wrote the import line into `~/.claude/CLAUDE.md`, verified directly by reading `156ab09^:scripts/install.cjs` (`156ab09` is the commit that deleted the file). A verified fact correction (`docs/specs/2026-09-12-install-council.md` §8.1), the Non-goal itself is unchanged |

| 2026-09-13 | Corrected §6 and §12: `bk-protocol` is no longer hidden from Claude's skill listing. The kit did not change — its frontmatter still carries both keys — the host did, in the auto-update the owner took that day: the panel now lists the skill as `user-only · ~80 tok`. Measured against the 2026-09-10 reading where it was absent from `/context all`'s User group. The §12 ceiling still holds (900 of 1,700 at eleven skills), so this is a fact correction, not a budget change (`docs/compat/2026-09-13-daily-profile-readings.md`) |
| 2026-09-13 | Two claims verified in the owner's daily profile rather than the isolated one, and recorded because neither had ever been tested there: the session-start bootstrap does load (the kit-root line was answered with no tool call), and the feature prompt still routes to `bk-spec` as the first action among 196 listed skills. One prompt is a data point; the sixty-prompt set has never run in that profile (`docs/compat/2026-09-13-daily-profile-readings.md`) |
| 2026-09-16 | The stack profile (§5.6) gains Terraform as a language and a `notes` field, and names the guardrails projects used to supply themselves (ESLint, Prettier, black, mypy or pyright, go vet, golangci-lint, cargo fmt, ktlint, detekt), each in the form that fails; `plan`, `apply` and `init` are never guardrails. The v2 bootstrap regained the clause that a single line stating a symptom is the request, on the reading that the restructure had dropped it and that this was why the gate of the same day met the 2026-09-10 failure again on the same prompt (**corrected 2026-09-17, next row: the clause changed nothing, and the reading was wrong**). The owner chose a `bk-setup` skill over an ideas-only close for claude-code-setup (D5 question 22); its design, which would take the catalog from seventeen to eighteen, is proposed in `docs/specs/2026-09-16-bk-setup-design.md` and not yet approved, so §5.1 is unchanged. |
| 2026-09-17 | Correction of the previous row, from a diagnosis: *"Uploads over 5 MB silently disappear."* fails the same way with no kit loaded (3/3) and routes once it says *"in the app"* (2/2), so that miss is the prompt's wording, not a v2 regression. v1 had passed it with an instruction at memory level, which the session-start injection of v2 does not reproduce in either wording tried; whether the kit should compensate is D5 question 23, and the prompt stays in the frozen sixty. The bootstrap sentence now makes no claim about where the host places the user's message, after the model on Claude Code 2.1.274 reported the block after it (the gate itself ran on 2.1.270; the CLI updated itself before the diagnosis); a 27-prompt regression check found no other change. The Claude Code half of the v0.2 activation condition (§13) is met: 58/60 on the Phase 1 sixty, equal to the baseline under the same labels, 0 false activations (`docs/compat/2026-09-16-daily-driver-gate.md`). |
| 2026-09-17 | `bk-setup` joins the catalog as a domain skill (§5.1), built from the design proposed on 2026-09-16 after the owner delegated the pending decisions to the session's recommendations ("Tiếp tục xử lý theo khuyến nghị tốt nhất có thể cho tôi đi."). One point was settled while building: wiring a hook, even at project level, is proposed as an exact snippet and applied only on approval, because it runs on every edit of every session. `bk-protocol/references/host-tools.md` gains three rows, each cell with its source: the instruction file each host reads, how a check runs after each edit, and — added when a check found `bk-setup` citing the kit's `docs/hosts.md`, which the Antigravity copy does not carry — the documentation lookup line. A test now holds every kit file a skill cites to what every host copy carries. First reading of its prompts in the isolated profile: 3/3. D5 question 23 is decided the same way: `bug-en-03` stays a known limitation, the prompt unchanged. |

Earlier decisions: v1 §19.

## 16. Technology-currency mechanisms

Goal 7 (§1) names four mechanisms, not a slogan; this section specifies each one — who runs it, how often, with what command — so "current technology by construction" stays checkable.

| Mechanism | Who runs it | Frequency | Command | Status |
|---|---|---|---|---|
| Version card | Whoever authors or revises a `bk-build/references/stacks/<stack>.md` file | At authoring time; again whenever that stack's tracked major changes | Manual edit of the file's "Written against: …" line, cross-checked against the Stack profile's output (next row) run in a current reference project for that stack | Designed (§5.5); executed from `docs/plans/2026-09-11-content-program.md` Step 3 |
| Stack profile | The acting skill (`bk-build`, `bk-test`, `bk-review`) | Once per session, per project root (§5.6) | `node <kit>/scripts/detect-stack.cjs` (`<kit>` = the directory holding `skills/`, known from the skill file's own path) | Built — reads the lockfile major for Node (`scripts/detect-stack.cjs:34`) and the equivalent manifest for the other seven stacks |
| Pinned-documentation lookup | The acting skill or agent, in-session | Event-triggered, whenever the confidence-gate rule fires; never on a schedule | The host's context7 MCP once installed (per-host install command in `docs/hosts.md:51`); `bk-research` (search or fetch against official docs) when context7 is not installed on that host or session | Rule built and live (`skills/bk-protocol/references/evidence.md:7`, `SKILL.md:43`); context7 stays opt-in, never installed by the kit (§1 non-goals) |
| Drift watch — upstream | The owner today; a scheduled job once `upstream-watch` and CI exist (§13, v1.0) | Monthly or on demand (v1 §12, carried forward) | `node bin/bearingkit.cjs upstream-watch` (not yet implemented); until then, e.g. `git -C _build/upstream/<repo> log --oneline <locked-sha>..HEAD` per source in `upstream/sources.json` | Designed, not built (§10, §13) |
| Drift watch — host | The owner, on noticing a host version change | Whenever a host ships a new version; at minimum once per kit release gate (§11: "acceptance test when the bootstrap wiring or a host changes") | The two acceptance prompts of §11, run by hand in a clean session on that host version, recorded in `docs/hosts.md` | Live, manual — the pattern already used for Claude Code 2.1.268 and Antigravity 2.12.2 in §3 |

Neither drift-watch scope is a hook or a schedule yet: both stay owner-run by hand until `upstream-watch`, CI and a scheduler land at v1.0 (§13); a missed cycle is a visible gap here, not a silent one.

## 17. Glossary

v1 §20 applies. **Bootstrap**: the protocol text a host loads at session start. **Acceptance test**: the two prompts of §11 that prove a host loads the bootstrap and routes. **Pack**: an optional skill group outside the default install.
