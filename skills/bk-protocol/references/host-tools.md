# Host tool map

Skills describe actions. This table names the tool that performs each action on each host.

| Action | Claude Code | Antigravity |
|---|---|---|
| invoke a skill | the Skill tool | view_file on `skills/<name>/SKILL.md` inside the bearingkit plugin, then follow it |
| read a file | Read | view_file |
| search text | Grep | grep_search |
| find files by name | Glob | find_by_name |
| run a command | Bash (PowerShell on Windows when needed) | run_command |
| edit a file | Edit | replace_file_content |
| write a file | Write | write_to_file |
| delegate read-only exploration | the built-in Explore agent | do it inline |
| independent review | the bk-reviewer subagent | a new conversation running /bk-review |
| measure a slow query in its own context | the bk-query-optimizer subagent | do it inline |
| open a page and check it rendered | browser tools or a Playwright script | browser tools or a Playwright script |
| the project instruction file the host reads | `CLAUDE.md` at the project root; it can import another file with `@path`, as this repository's `CLAUDE.md` imports `AGENTS.md` (v1 spec §3; seen in this repository's own sessions) | `AGENTS.md` or `GEMINI.md`, read hierarchically (v1 spec §3, from the host's built-in docs of 2026-09-05) |
| run a check after each edit | a `PostToolUse` hook with the matcher `Edit\|Write`, in the project's `.claude/settings.json` (shared) or `.claude/settings.local.json` (local); it cannot block, and a failing check reaches the agent as stderr on exit code 2 or through `hookSpecificOutput.additionalContext` (Claude Code hooks documentation, read 2026-09-17) | a `PostToolUse` hook in a plugin's `hooks.json`, a workspace plugin living under `.agents/plugins/`; its output cannot enter the conversation, so a failing check reaches the model only through a `PreInvocation` hook on the next turn (v1 spec §3). Not exercised by the kit on this host |
| look up current documentation for a library | none installed by the kit; the owner can add context7 with `claude mcp add context7 -- npx -y @upstash/context7-mcp` (the kit's install notes, `docs/hosts.md`, 2026-09-11; not run by the kit) | none installed by the kit; the owner can add context7 through the host's `mcp_config.json`, global or in a plugin (v1 spec §3; the kit's install notes) |
| record a guardrail run | `node <kit>/scripts/record-guardrail.cjs --command "<cmd>" --exit <code>` | same command through run_command |

`<kit>` is the directory that holds `skills/` (the plugin root; the repository checkout during development).
