# Per-project activation: what each host documents · 2026-09-19

D5 question 29 (owner, 2026-09-19): install once, globally, and use the kit only in the projects activated for it. This file records what Claude Code and Antigravity document about scoping a plugin to one project, so the design (`docs/specs/2026-09-19-per-project-activation-design.md`) rests on sources rather than recollection. Nothing here was run on a host; every "verified" below is a reading, and the open rows are probes the design lists before anything is built.

Method. Two research agents (Sonnet) read the docs; the session then re-read every load-bearing claim itself: Claude Code from the raw markdown of the reference pages (curl of `https://code.claude.com/docs/en/settings-reference.md`, and a WebFetch of `plugins-reference` and `settings`), Antigravity from the docs embedded in its language server (`%LOCALAPPDATA%\Programs\Antigravity\resources\bin\language_server.exe`, 2.15.0, read as bytes, never executed; offsets below are byte offsets in that file) and from `https://antigravity.google/docs`. The embedded docs are the files of the built-in skill `agy-customizations` (`rules.md`, `hooks.md`, `skills.md`, `plugins.md`, `json_configs.md`); on plugins and precedence they say more than the public site.

## Claude Code

| # | Claim | Source | Checked by the session |
|---|---|---|---|
| C1 | `claude plugin install --scope user\|project\|local` writes the plugin into `enabledPlugins` of `~/.claude/settings.json`, `.claude/settings.json` or `.claude/settings.local.json`; the default is `user` | plugins-reference, "Plugin installation scopes" and the `plugin install` options | yes (WebFetch, quoted) |
| C2 | Marketplace plugins are copied once per user into the plugin cache `~/.claude/plugins/cache`; the scopes only decide where the plugin is switched on | plugins-reference | yes (WebFetch, quoted) |
| C3 | `enabledPlugins` maps `plugin@marketplace` to a Boolean, is valid in any settings file, and "a plugin with no entry at any scope falls back to its `defaultEnabled` value" | settings-reference, `### enabledPlugins` | yes (raw markdown) |
| C4 | Precedence per plugin: local over project over user ("setting a plugin to `false` in `~/.claude/settings.json` doesn't disable a plugin that the project's `.claude/settings.json` enables … set it to `false` in `.claude/settings.local.json` instead") | settings-reference, `### enabledPlugins`; settings, "Settings precedence" | yes (raw markdown) |
| C5 | `defaultEnabled: false` in `plugin.json` ships a plugin that installs disabled; an entry in `enabledPlugins` at any scope wins over it and persists across updates | plugins-reference, "Default enablement" | yes (WebFetch, quoted) |
| C6 | Local settings are "gitignored when Claude Code saves a setting there": the first write in a git repository adds `**/.claude/settings.local.json` to the global git excludes file | settings, "Keep personal settings out of a repository" | yes (WebFetch, quoted) |
| C7 | A plugin that is not enabled does not load: its `bin/` is on `PATH` only "while the plugin is enabled"; a project-enabled plugin "doesn't load until the team member installs it" | plugins, discover-plugins | agent only; all components absent is **inferred**, not quoted |
| C8 | Hook input carries `cwd`; `CLAUDE_PROJECT_DIR` is the project root where the session started | hooks | agent only |
| C9 | `claude plugin enable` / `disable` take no `--scope`, and the docs do not say which file they write | plugins-reference options tables | **open**: the page was truncated for the session; the agent read the tables |

Open, to probe in the isolated profile before building: what `install --scope local` writes for a plugin with `defaultEnabled: false` (an entry `true`, or nothing), and which file `claude plugin enable` writes when run inside a project.

## Antigravity 2.x

| # | Claim | Source | Checked by the session |
|---|---|---|---|
| A1 | Everything under the global root is discovered for every workspace: "Global Configuration (Machine-Local): Path: `~/.gemini/config/`. Applies to all projects and workspaces run on your machine"; plugins live in `plugins/<name>/` of a customization root, globally `~/.gemini/config/plugins/`, per workspace `.agents/plugins/` | embedded overview and `plugins.md`; public `/docs/plugins` | agent (overview), 2026-09-10 reading (roots) |
| A2 | A discovered, enabled plugin loads whole: "All skills, rules, hooks, and MCP servers defined within the plugin's directory structure are automatically loaded" | embedded `plugins.md`, offset 52,464,917 | yes (verbatim) |
| A3 | Skills are always listed: "Skills are not loaded into the context window by default. Only their names and descriptions are injected"; "Only `always_on` rules are loaded unconditionally" | embedded overview, offset 52,714,530 | yes (verbatim) |
| A4 | On and off is one global switch: a plugin can ship `"disabled": true` in `plugin.json`; the user's choice is recorded in `config.json` under `plugins.<directory>.enabled`; a disabled plugin loads none of its customizations. No per-workspace or per-project switch is documented | embedded `plugins.md`, offsets 52,466,055 and 52,467,072 | yes (verbatim); "no per-project switch" is an absence in both sources |
| A5 | `plugins.json` (and `skills.json`) "explicitly register and manage customizations that are stored outside the default discovery locations", placed in a customization root: `.agents/` in a project or `~/.gemini/config/` globally; entries take absolute or `~` paths, and `inherits` pulls entries from another file | embedded `json_configs.md`, offset 52,528,148 | yes (verbatim); the public site does not mention `plugins.json` |
| A6 | Precedence, highest first: workspace project (walk up to the repository root), declared configurations (`skills.json`, `plugins.json` in the workspace), global discovery (`~/.gemini/config/`), built-in, global declared configurations | embedded overview, offset 52,713,876 | yes (verbatim) |
| A7 | Rule triggers: `always_on`, `model_decision`, `manual` (an @-mention), `glob`; workspace rules in `.agents/rules/`, global rules in `~/.gemini/GEMINI.md` | public `/docs/rules-workflows`; embedded template | agent; `glob` inside a plugin passed a probe on 2026-09-11 (`phase-1-gate.md`) |
| A8 | Hooks: `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`, in `.agents/hooks.json` or `~/.gemini/config/hooks.json`; no documented `SessionStart` | embedded `hooks.md`; public `/docs/hooks` | agent |
| A9 | Projects (2.0) scope folders and settings or permissions; "Reusable skills, MCPs, and hooks are managed globally" | public `/docs/projects` | agent |
| A10 | `.agents/` has aliases `.agent/`, `_agents/`, `_agent/`, found by walking from the working directory up to the repository root | embedded overview | agent |

Consequences for the design, stated as readings, not measurements: (1) any plugin under `~/.gemini/config/plugins/` reaches every workspace, the IDE included, which is what the owner saw on 2026-09-19; a rule trigger other than `always_on` would still leave the skill names and descriptions in every conversation (A2, A3). (2) The only documented per-project handle is a workspace `plugins.json` that registers a plugin kept outside the discovered roots (A5, A6).

Open, to probe on the app before building: whether a workspace `.agents/plugins.json` entry loads a plugin kept outside `~/.gemini/config/` (skills listed, rule applied) and a workspace without it does not; whether the entry names the plugin folder or a folder of plugins; whether `~` expands on Windows; whether a declared plugin's `hooks.json` runs (the eval driver depends on it); whether the IDE honours it as 2.0 does.
