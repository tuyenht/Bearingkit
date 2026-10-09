# Bearingkit

**An open-source workflow for AI coding agents.** · [bearingkit.dev](https://bearingkit.dev) · [Tiếng Việt](README.vi.md)

Bearingkit is one protocol and 17 skills that replace a stack of overlapping plugins. Say what you want in plain **Vietnamese or English**: it routes your AI coding agent to the right step, and is built to carry the work from spec to ship, stop for you before anything risky, and show its evidence before it calls anything done. It runs on **Claude Code** and the **Antigravity** 2.0 app today, from one skills source; Gemini CLI, Cursor, Codex, Copilot CLI and Factory Droid have manifests in place and are listed as supported once their acceptance test passes.

> Pre-release and in active development: no public release or npm package yet (package version 0.1.0, working toward v0.3). Bearingkit is an independent project, not affiliated with Anthropic or Google. Every figure below is traceable to the repository — mostly [`docs/status.md`](docs/status.md), which says how each was measured.

## Why one kit instead of a stack

The usual setup is a pile — a workflow pack, a review pack, a TDD pack, the vendor's official plugins. Each is good alone. Together they compete for the same requests, carry overlapping rules, all load before you type, and stay behind when you switch tools. Bearingkit is that pile, read item by item and being distilled into one system:

- **23 sources studied, 17 of them open-source** (Superpowers, Anthropic's official plugins, mattpocock/skills, spec-kit and more; full list in `upstream/sources.json`). **1,295 source items** from 22 of them (skills, commands, agents, rule files) inventoried one by one: 46 to adapt, 610 kept as ideas, 639 dropped. Every adapted file names its sources; licences are carried in [`NOTICE`](NOTICE). What is borrowed and what is ours, component by component: [`PROVENANCE.md`](PROVENANCE.md).
- **One router.** The protocol names the intent first, then opens one skill — instead of several packs competing for the same request.
- **A small footprint.** Fixed context about 4,000 tokens on Claude Code, against a budget of 5,000 (measured 2026-09-23, before the 17th skill).
- **Per-project activation.** Installed once per machine; a project you have not activated sees nothing of it — on both accepted hosts.
- **One source, several hosts.** Switching between Claude Code and Antigravity does not mean rewriting your rules.

## Say it the way you'd say it to a colleague

No slash commands to memorise. Every skill carries trigger phrases in English and Vietnamese. 44 of the 96 prompts in today's activation test set are Vietnamese; on the 60-prompt core set (six intents: question, small change, feature, bug, review, ship), routing measured precision and recall ≥ 0.9 on Claude Code and Antigravity 2.0 on 2026-09-16/17 (Claude Code: recall 0.958, precision 1.000). That run predates `bk-db`, `bk-ops`, `bk-map`, `bk-research` and `bk-perf`; their prompts are in the set but not yet re-run. Routing is not a measure of code quality. Real prompts from the test set:

| You say | Opens |
|---|---|
| *Thêm xuất CSV cho trang hóa đơn.* | `bk-spec` |
| *Form đăng nhập báo lỗi 500 sau khi đổi mật khẩu.* | `bk-debug` |
| *Soi giúp diff này trước khi tôi đẩy.* · *Nhánh này merge được chưa?* | `bk-review` |
| *Xong phần xuất hóa đơn rồi, ship đi.* | `bk-ship` |
| *Tiếp theo làm gì? Tôi đang dở việc gì trong repo này?* | `bk-next` |
| *Kết phiên giúp tôi, ghi bàn giao để phiên sau đọc.* | `bk-close` |

## From request to shipped, without herding the agent

Skills hand off in a fixed chain — **spec → plan → build → test → review → ship → close** — each ending by naming the next. The chain **stops for you wherever a human decision belongs** — at COUNCIL points, and after a bug fix before anything is committed:

- **The autonomy gate.** ACT: tests, behaviour-preserving refactors, docs, app-layer fixes, small changes inside an approved plan — done, then reported. COUNCIL: schema and migrations, auth, permissions, payments, data deletion, multi-module contracts, remote or production systems — proposed, then it waits. Unsure counts as COUNCIL.
- **Right-sized.** A feature gets a spec; a small ACT change within three files goes to build with tests; a bug gets root cause before any fix, with a council after three failed attempts; a question gets an answer.
- **Evidence before claims.** `file:line` anchors or "unverified"; numbers with their method or "not measured"; a clean check trusted only after it is shown to fail.
- **Hot paths get a second pair of eyes** — auth, payments, uploads, tenant scoping, migrations, external contracts — ideally another model or host.
- **Sessions that remember.** `bk-close` writes a handoff checked against git; `bk-next` resumes from the repository's real state.

## Status — honest about where it stands

| | Today |
|---|---|
| Skills | 17 skills plus the protocol; `bk-build` opens stack rules for TypeScript/React, Kotlin, SQL, Node, Python, PHP/Laravel, Shell, C/C++ |
| Hosts | Accepted: Claude Code, Antigravity 2.0 app. Loads per project, full acceptance pending: Antigravity IDE. Manifests in place: Gemini CLI, Cursor, Codex, Copilot CLI, Factory Droid |
| Plain-language routing | EN + VI; precision and recall ≥ 0.9 on the 60-prompt core set, both accepted hosts (measured 2026-09-16/17, before the five newest skills) |
| Against the source skills | compared so far: `bk-review`, `bk-debug`, `bk-plan` and five stack files. Most showed no clear difference (small samples; on most, neither side could be told apart from no skill at all); one planning task with one model favoured the kit; on PowerShell the kit beat the no-skill floor and a pack with no shell skill, not its own source. Where cost was recorded, the kit cost about 1.3–3× what its sources did per task (per-task figures in `docs/specs`), so **no task yet meets the v1.0 bar** (at least the sources' pass rate *and* fewer tokens) |
| npm package, marketplace listings | not yet |

**How claims are made.** Each skill is to be judged against the sources it was distilled from — same task, fixture, model and host, once with the kit and once with the sources. Until that comparison exists for a skill, it is "not compared"; results that did not replicate are recorded as such.

**So why use it now?** Not for a stronger skill — for one coherent, gated system in place of a stack you would otherwise assemble, reconcile and maintain yourself, in Vietnamese or English, on more than one agent.

**What we will measure next**

1. **One kit vs a stack** — Bearingkit against a hand-assembled set of popular packs on the same tasks: wrong activations, defects, tokens ([proposed design](docs/specs/2026-10-08-kit-vs-stack-proposal.md)).
2. **The gate under pressure** — trap tasks (a migration, a deletion, a production push): how often the agent acts without asking, with and without the kit.
3. **The cost of switching** — one project on two hosts: files to maintain, rules that drift.

## Roadmap

- **v0.3** (in progress): the remaining lifecycle skills distilled and measured (`bk-spec`, `bk-ship`, `bk-close`), the v0.3 gate.
- **v0.4**: optional packs, push and deploy hooks, acceptance on Gemini CLI, Cursor and Codex.
- **v1.0**: a 12-task outcome benchmark against the sources, `upstream-watch` to report changes in each source; publication: marketplace listings, README in English and Vietnamese, CI, and a squashed public history.

Detailed plan: [`docs/plans/2026-09-26-v03-roadmap.md`](docs/plans/2026-09-26-v03-roadmap.md). MIT today and tomorrow; help adopting it in a team: [hello@bearingkit.dev](mailto:hello@bearingkit.dev).

## Install once, use where you say

The kit is installed once for your machine and switched on per project: a project you have not activated sees nothing of it — no protocol, no skill in the listing, no hook.

Copy-paste, in bash or PowerShell (`$HOME` works in both):

```
# Once per machine: clone the repository (no npm package yet)
git clone https://github.com/tuyenht/Bearingkit.git $HOME/bearingkit

# Claude Code: add the marketplace and install the plugin
claude plugin marketplace add https://github.com/tuyenht/Bearingkit
claude plugin install bearingkit@bearingkit

# Antigravity only: install the skills store
node $HOME/bearingkit/bin/bearingkit.cjs install --host antigravity

# In each project that should use it
cd path/to/your-project
node $HOME/bearingkit/bin/bearingkit.cjs activate
node $HOME/bearingkit/bin/bearingkit.cjs status   # what is installed, what this project has on, what is out of date
```

The other three verbs are `update` (pull the checkout, refresh the store), `deactivate` and `uninstall`. Every command takes `--host all|antigravity|claude` (default all; a host you do not have is skipped), a project path (default: the working directory), and `--dry-run`, which says what would change and writes nothing.

**How to spell `bearingkit`.** The package is not published yet, so below `bearingkit …` stands for `node $HOME/bearingkit/bin/bearingkit.cjs …` from the clone above. After publication: `pnpm add -g bearingkit` (or `npm i -g bearingkit`) and then plain `bearingkit …`; `pnpm dlx bearingkit …` and `npx bearingkit …` run it once without installing, and both need the matching package manager on your PATH.

**What each host needs.** `activate` writes one entry in that host's own configuration file inside the project — `.agents/plugins.json` for Antigravity, `.claude/settings.local.json` for Claude Code — and nothing else; in a git clone both are ignored locally through `.git/info/exclude` unless you pass `--no-git-exclude`. Claude Code also needs its own two commands once per machine, because only its CLI may write under `~/.claude`; `bearingkit install` prints them, together with the `extraKnownMarketplaces` entry that makes Claude Code follow the repository on its own.

| Host | State |
|---|---|
| Claude Code | acceptance passed; install with `claude plugin marketplace add <repository URL>` (not a development checkout: the install copies untracked files too, `docs/hosts.md`) then `claude plugin install bearingkit@bearingkit`, activate per project as above; development: `claude --plugin-dir <checkout>` |
| Antigravity 2.0 | acceptance passed; `bearingkit install` writes the store, `bearingkit activate` declares it in a project. Measured on the app 2026-09-20: an activated project lists the kit's skills and runs its hooks, a project without the entry lists none of them ([docs/compat/2026-09-19-per-project-activation.md](docs/compat/2026-09-19-per-project-activation.md)) |
| Antigravity IDE | loads the kit per project (full acceptance test not yet run); it honours a project's `.agents/plugins.json` exactly as 2.0 does (measured 2026-09-20: the activated folder lists the kit's skills, and a running IDE picks the declaration up when the folder is opened) |
| Gemini CLI | `gemini extensions install https://github.com/tuyenht/Bearingkit`; acceptance pending |
| Cursor, Codex, Copilot CLI, Factory Droid | manifests are in place; listed as supported after their acceptance test |

Details, uninstall and the acceptance status per host: [docs/hosts.md](docs/hosts.md).

## What you get

- **The protocol** (`skills/bk-protocol/SKILL.md`), loaded at session start: the autonomy gate (ACT acts and reports; COUNCIL proposes and waits), a router from intent to skill, evidence rules, the council format, the definition of done, hot-path review, a security baseline.
- **Skills**, invoked by the router from plain language in English or Vietnamese: `bk-spec`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-audit`, `bk-next`, `bk-design`, `bk-setup`, `bk-ops`, `bk-db`, `bk-map`, `bk-research`, `bk-perf`. Each skill is a short body with gates and the evidence it must paste, plus references read on demand.
- **Agents** for hosts that define them: an independent reviewer, a researcher, a query optimizer, a design critic.
- **Provenance**: every adapted source is named in `NOTICE` and `upstream/sources.json`.

## Development

```
node --test tests/*.test.cjs
node bin/bearingkit.cjs evals --config-dir <isolated Claude profile>
```

Design: `docs/specs/2026-09-11-bearingkit-v2-design.md`. Session state for contributors: the newest file in `docs/handoff/`. Working agreement: `AGENTS.md`.

## License

MIT — see [LICENSE](LICENSE) (`Copyright (c) 2026 tuyenht`); third-party notices in [NOTICE](NOTICE).
