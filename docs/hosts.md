# Hosts: install, bootstrap, acceptance

One `skills/` source; each host installs it with its own command. A host is listed as supported only after the acceptance test passed on it (spec v2 §11): in a clean session, "What are the two classes of the autonomy gate, and what does each do?" answers ACT and COUNCIL without invoking a skill, and "Let's make a react todo list" invokes `bk-spec` before any code is written.

| Host | Version tested | Acceptance | Date |
|---|---|---|---|
| Claude Code | 2.1.268 | **pass**: loaded with `--plugin-dir` in the isolated profile on the staged fixture (plugin listed as `bearingkit@inline`, ten skills listed, `bk-protocol` hidden); prompt 1 answered ACT and COUNCIL with no tool call in one turn; prompt 2's first tool call was `Skill bearingkit:bk-spec` (the session then hit the three-turn cap while reading the fixture, which the test does not score) | 2026-09-11 |
| Antigravity 2.0 | 2.12.2, Claude Opus 4.6 (Thinking) | **pass** through the DevTools driver on the staged fixture (`evals/activation/acceptance.jsonl`): prompt 1 answered ACT and COUNCIL with no skill opened (4 steps); prompt 2 first failed (the model explored the project, then named bk-spec without opening it) because the v2 copy had dropped the Antigravity host note, and passed once the note was restored: first action `view_file` of `skills/bk-spec/SKILL.md`, then the skill's steps (15 steps). Two driver fixes on the way: the app opens no DevTools port unless started with `--remote-debugging-port=1405`, and the UI origin's port changes per launch, so the driver now reads it from the page | 2026-09-11 |
| Gemini CLI | not tested | pending | |
| Cursor | not tested | pending | |
| Codex CLI / app | not tested | pending; bootstrap mechanism unknown | |
| Copilot CLI, Factory Droid | not tested | pending | |

## Claude Code

- Install: `/plugin marketplace add tuyenht/Bearingkit`, then `/plugin install bearingkit@bearingkit`. While the repository is private (until v1.0), add the marketplace by local path instead: `/plugin marketplace add C:\Projects\Bearingkit`. Uninstall through the `/plugin` menu (the exact `/plugin uninstall` form is unverified).
- Development and evals, no install: `claude --plugin-dir <path to the checkout>`. The kit's evals runner passes this by default.
- Bootstrap: `hooks/hooks.json` runs `hooks/session-start.cjs` on startup, clear and compact; it returns the protocol (`skills/bk-protocol/SKILL.md`) as additional context. Skills appear as `bearingkit:bk-<name>`; `bk-protocol` is hidden from the listing.
- **Host drift, 2026-09-13:** after that day's auto-update, the `/skills` panel lists `bk-protocol` as `user-only · ~80 tok · locked by author` instead of hiding it; on 2.1.267 (2026-09-10) it was absent from `/context all`'s User group. The kit's frontmatter is unchanged. The listing still fits §12 (900 tokens for eleven skills). Evidence: `docs/compat/2026-09-13-daily-profile-readings.md`. The acceptance row above is the record of 2026-09-11 and is not rewritten.
- Agents: `agents/bk-*.md` load with the plugin.
- Deny list for secret files, set by you in `~/.claude/settings.json` if wanted: `permissions.deny` with `Read(**/.env*)` and the key-material patterns you use; the kit writes no settings.

## Antigravity 2.0

- Install: `npx bearingkit antigravity install` (or `node bin/bearingkit.cjs antigravity install` from a checkout). It copies `skills/`, the manifest and the protocol as an always-on rule into `~/.gemini/config/plugins/bearingkit`, a real directory, because the host's plugin scanner does not follow directory junctions (isolated on 2.0, 2026-09-11). Run it again after updating the kit. `--dry-run` prints the plan; `--dest <dir>` targets another plugin root.
- Uninstall: `npx bearingkit antigravity uninstall`; it removes only a directory the kit created (marker file `.bearingkit-copy`).
- Bootstrap: `rules/bearingkit.md` with `trigger: always_on` inside the plugin copy: the protocol body plus an Antigravity host note. The note matters: this host has no skill tool, and without the sentence "invoking a skill means opening `skills/<name>/SKILL.md` with `view_file` as the first action" the model names the skill and explores the project instead (measured 2026-09-10 and again 2026-09-11). A skill is invoked by opening its file inside the plugin (the path the Customizations panel shows) and following it.
- Tokens are read from the Customizations panel; Phase 1 measured the rule at 1,873 and ten descriptions at 1,045.
- Automated runs (the eval driver, the acceptance test) drive the 2.0 app over the Chrome DevTools protocol. The app does not open that port by itself (verified 2026-09-11: a plainly started app listened on no DevTools port); start it as `Antigravity.exe --remote-debugging-port=1405` (the port `scripts/antigravity/cdp.cjs` expects), or through a launcher that adds the flag.

## Gemini CLI

- Install: `gemini extensions install https://github.com/tuyenht/Bearingkit` (a local path works while the repository is private); update with `gemini extensions update bearingkit`. Unverified until the acceptance test runs there.
- Bootstrap: `gemini-extension.json` names `GEMINI.md`, which imports `./skills/bk-protocol/SKILL.md`.
- Shares `~/.gemini/GEMINI.md` conventions with Antigravity's `user_global` rule; install both only if you use both.

## Cursor

- Install from the plugin marketplace once listed; the manifest is `.cursor-plugin/plugin.json` (skills, agents, `hooks/hooks-cursor.json`).
- Bootstrap: the sessionStart hook runs `hooks/session-start.cjs`, which returns `additional_context`.

## Codex CLI and app

- Manifest: `.codex-plugin/plugin.json` with `skills: ./skills/`. How Codex loads a plugin's session bootstrap is not yet known; Superpowers ships an empty `AGENTS.md` alongside the same manifest. Listed as supported only after the acceptance test.

## Copilot CLI and Factory Droid

- Same plugin format as Claude Code (`copilot plugin marketplace add tuyenht/Bearingkit`, `droid plugin marketplace add https://github.com/tuyenht/Bearingkit`); the hook script also returns the top-level `additionalContext` those hosts read. Pending.

## Optional: documentation MCP

The kit installs no MCP server. For libraries newer than the model's training, add context7 yourself: Claude Code `claude mcp add context7 -- npx -y @upstash/context7-mcp`; Antigravity and Gemini CLI through their `mcp_config.json` or settings. `bk-research` and the evidence rules tell the agent when to consult it.
