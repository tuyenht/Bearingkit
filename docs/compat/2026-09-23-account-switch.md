# What survives a Claude account switch on this machine · 2026-09-23

The owner asked what happens if they log out and log in with another Claude account. The answer decides how the measurement harness behaves, so it is recorded here rather than in chat. Pages read 2026-09-21 on `code.claude.com`; the local checks were run in this repository the same day.

| Thing | Where it lives | An account switch on this machine |
|---|---|---|
| Project state (handoff, status, specs, plans) | the repository and `origin` | unchanged; this is the continuity path the kit is built on |
| Auto memory of this project | `~/.claude/projects/<project>/memory/`, the `<project>` path derived from the git repository; docs: "Auto memory is machine-local", on by default | unchanged and still loaded |
| `CLAUDE.md`, `~/.claude/rules/`, installed plugins and skills | files under `~/.claude` | unchanged |
| The app's and CLI's login | Windows: `%USERPROFILE%\.claude\.credentials.json` | `/logout` removes it and the next start asks for login again (it also resets the first-launch setup state) |
| **The isolated measurement profile** `_build/profile/claude` | with `CLAUDE_CONFIG_DIR` set, Claude Code keeps `.credentials.json` **under that directory** | keeps the old account's login until someone logs in there again |
| Quota, plan, model availability | the account | the new account has its own five-hour and seven-day windows; every quota number in an older handoff belongs to the old account |
| claude.ai connectors, skills and plugins synced from claude.ai | the account | different; the kit uses none of them, but the daily profile's skill listing can change |
| Session transcripts of earlier sessions | `~/.claude/projects/<project>/` | the files stay; whether the desktop app lists them under another account was not checked |
| GitHub, and Antigravity under `~/.gemini` | their own accounts | unaffected |

Checked here on 2026-09-21, without printing any file of the profile: `_build/profile/claude/settings.json` still carries one `Read` rule and both claude.ai sync keys set to false, so the permission rule of §7 (dd) and the isolation of §7 (t) are not tied to the login.

Consequence for the harness, and the recommendation the owner has: switch both or neither. With the app on one account and the isolated profile on another, `get_usage` reads one account's limits while the runner's own ceilings read the other's, so "read the quota before each measurement" reads the wrong account. Since 2026-09-20 the runner stops and says so when a session cannot authenticate (status §7 (jj)), so a stale login in the profile shows up on the first measurement rather than mid-run.

To move the profile to another account the owner runs, in their own terminal, `CLAUDE_CONFIG_DIR="C:/Projects/Bearingkit/_build/profile/claude" claude`, then `/login`. A session never handles that login.
