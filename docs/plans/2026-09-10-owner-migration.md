# Owner workstation migration to Bearingkit v1

Status: PLANNED · Applies to: the kit author's machine only · Spec: `docs/specs/2026-09-10-bearingkit-v1-design.md`

This plan is not part of the product. It sequences how the author retires previous kits (Spartan, ClaudeKit remnants, Antigravity-Core v5, third-party skill packs) and adopts Bearingkit on both hosts. No private hostnames, paths beyond the local projects folder, or secrets appear here.

| Phase | Work | Exit criteria | Est. |
|---|---|---|---|
| 0 Foundation | Rotate an API key that was exposed in a session transcript (owner); back up `~/.claude` and `~/.gemini/config` with checksums; disable the deprecated `skill-dedup.cjs` hook; move `~/.claude/skills/.shadowed` (108 hidden skill folders) to a dated archive folder; fix the stdout-encoding bug and two dead doc paths in the owner's DB knowledge base repo | Backups verified; KB search runs through a pipe | 0.5 day |
| 1 Core | `core/AGENTS.md`; the 11 protocol skills (`bk-protocol`, `bk-next`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`); `detect-stack.cjs`; `stack-profile` hook; both adapters; dev-mode install on both hosts; compatibility tests 1–4; activation prompt set | 10/10 activation on both hosts; `/context` ≤5K | 2 days |
| 2 Outer layers | 8 rules, 5 agents, the 5 remaining hooks, the 6 remaining core skills (`bk-map`, `bk-research`, `bk-perf`, `bk-ops`, `bk-design`, `bk-db`); disable the 66-skill third-party pack; remove the Superpowers plugin; archive Spartan and ClaudeKit global remnants; install LSP plugins and context7 | `doctor` green; no dead references | 1.5 days |
| 3 Optional skills and project cleanup | `bk-preview`, `bk-guard`; BOM and encoding fixes in migrated content; delete project-level copies of the old `/bs:*` commands in the projects on this machine (the owner handles their production SaaS repo separately; the kit never touches it); archive the 13 legacy `.agent/` trees listed by `doctor` | No project carries two instruction sets | 1.5 days |
| 4 Acceptance and public readiness | `upstream/sources.json`, `upstream-watch`, evals, README EN/VI, NOTICE, CI; one-week trial on four projects across both hosts | No skill with zero calls; evals at or above baseline | 1.5 days + 1 week |

Parallel, outside this repo: the DB knowledge base repo authors its canonical-topic articles with its own `kb-author` agent; a private pack holds the commercial admin theme assets; personal server-access skills stay in the author's personal skills folder.

**Actions that require explicit owner approval in the turn they run:** any write under `~/.claude` or `~/.gemini/config`; edits in other repositories; deletions or archiving in other projects; anything on a production server.
