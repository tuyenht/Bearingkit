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
| open a page and check it rendered | browser tools or a Playwright script | browser tools or a Playwright script |
| record a guardrail run | `node <kit>/scripts/record-guardrail.cjs --command "<cmd>" --exit <code>` | same command through run_command |

`<kit>` is the kit's install root; in dev mode it is the repository checkout.
