# bk-review sprint · tool claims checked against their documentation · 2026-09-24

Each claim the sprint wrote into a file the model reads, or into the owner's install notes, with the source it was read from. Saved copies are untracked, in `_build/v03-prep/`, with their SHA-256.

## Context7 (status §7 (x))

The line the kit carried since 2026-09-11 (`bk-protocol/references/host-tools.md:25`, `docs/hosts.md:57`): `claude mcp add context7 -- npx -y @upstash/context7-mcp`. The item-level inventory (2026-09-18) found that the official Claude plugin points at a hosted endpoint instead, and left the line unverified.

| Claim | Source, read 2026-09-24 | Verdict |
|---|---|---|
| Claude Code, local server: `claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY` | `https://context7.com/docs/resources/all-clients.md`, section "Claude Code", "Local Server Connection" (lines 34-42 of the saved copy `context7-all-clients-2026-09-24.md`, SHA-256 `b769cc48…caec8`) | The kit's line is this form without `--scope user` and without the key. Still documented; now written with `--scope user` |
| Claude Code, hosted server: `claude mcp add --scope user --header "Authorization: Bearer YOUR_API_KEY" --transport http context7 https://mcp.context7.com/mcp` | same section, "Remote Server Connection" (lines 44-48) | Added as the second form |
| The API key is optional and raises the rate limit | `https://raw.githubusercontent.com/upstash/context7/master/README.md` line 47: "API Key Recommended … for higher rate limits" (saved `context7-readme-master.md`, SHA-256 `c513b9ec…da13`; repository HEAD `6cbdb49` by `git ls-remote`) | Written as "optional, raises the rate limit"; no placeholder key in the kit's text |
| Antigravity: `mcp_config.json` with `serverUrl` `https://mcp.context7.com/mcp` and an `Authorization` header, or `command` `npx` with `-y @upstash/context7-mcp` | all-clients page, section "Google Antigravity" (lines 216-246) | Written as the host column of the same row |
| `npx ctx7 setup` configures a skill or MCP through OAuth | README lines 49-55 | Not written: it installs a skill of its own and signs in, which the kit's no-catalog rule leaves to the owner (catalog proposal B3) |

Nothing was run: the kit installs no MCP server.

## The eval runner inside `claude -p` (observed, not documented)

Seen in the six behaviour sessions of this sprint (`evals/results/2026-09-24-beh-review-*-beh-review-{a,a2,b}.raw.jsonl`, untracked), isolated profile `_build/profile/claude`, Claude Code 2.1.281; the profile allows `Read(//c/Projects/Bearingkit/skills/**)` and no Bash rule:

- Read-only git in the working directory ran without a rule (`git status`, `git log`, `git diff main...HEAD`, `git blame`), chained with `&&` too. A chain was refused when one of its parts needed approval, and the refusal named that part (an `ls` of the kit checkout). Also refused: a shell loop with `$var` expansion, `node -e` and `node <script>`, a PowerShell subexpression, and `ls`, `find` or Glob on the kit checkout. Reading a kit reference by its full path worked.
- One session (`beh-review-01` of run `a2`) globbed the checkout, was refused, and reviewed without reading any reference; the others read them by path.
- A review that forks its context and dispatches an independent reviewer ran 140-170 seconds; the runner's fixed 180-second ceiling cut one mid-stream (`beh-review-01`, run `a`), which is why the runner now takes `--timeout`.
