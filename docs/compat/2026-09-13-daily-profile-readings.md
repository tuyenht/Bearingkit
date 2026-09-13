# Readings from the owner's daily profile, 2026-09-13

Not a gate run. Three checks the owner ran by hand to settle three open questions from `docs/status.md` §7, plus the `/context` numbers of that session. Every number here was read off the owner's screen and is labelled with the surface it came from; nothing is inferred from a previous reading.

**Session.** Claude Code (auto-updated that day from 2.1.268; the exact new version was not read), Opus 5 1M, working directory `C:\Projects\Bearingkit`, kit loaded with `claude --plugin-dir C:\Projects\Bearingkit`. **The owner's daily profile, not the isolated one** — so the profile's own instruction set and plugins are present and the kit's fixed cost cannot be isolated here. The §12 contract reading still needs the isolated profile (Task 8 of `docs/plans/2026-09-13-daily-driver.md`).

## `/context`

| Category | Reading |
|---|---|
| Total | 120.8k of 1m (12%) |
| System prompt | 4.6k |
| System tools | 14k |
| Custom agents (`.claude/agents/`, 26) | 8k |
| Memory files | **71.2k** |
| Skills (196 skills) | **18.3k** |
| Messages | 4.7k |
| MCP tools (84) | 0, loaded on demand |

Two readings that matter beyond this session:

- **Memory 71.2k re-confirms the 71.9k of 2026-09-10** (`phase-1-gate.md`, second reading) as the cost of the profile the kit is meant to replace. That figure was three days old and carried a "not re-measured" caveat; it no longer does. The two are not the same measurement to the token — different day, different host version — but the magnitude is confirmed.
- **196 skills for 18.3k** is the environment the kit actually routes in. Phase 1 measured routing against about 27 skills in an isolated profile.

## Q1 — is `bk-protocol` hidden from Claude's skill listing?

**No, not on this host version.** The `/skills` panel lists it as `bearingkit:bk-protocol · plugin · ~80 tok · locked by author`, status `user-only`, beside the ten task skills.

On 2026-09-10, in the isolated profile on 2.1.267, `bk-protocol` was **absent** from the User group of `/context all` (`phase-1-gate.md`, third reading, recorded there as the direct form of compatibility test 6). Nothing in the kit changed between the two readings: the frontmatter still carries `user-invocable: false` and `disable-model-invocation: true`. **The host changed** — the session banner reported an auto-update with 7 features and 78 bugfixes that day. This is exactly the risk row of spec §14 ("a host changes its plugin or hook format") and the reason §16 keeps a host drift watch.

**Cost, by the panel's per-skill figures** (the same method `phase-1-gate.md` used for its 750): bk-build 100, bk-spec 100, bk-ship 100, bk-review 90, bk-audit 80, **bk-protocol 80**, bk-close 70, bk-debug 70, bk-next 70, bk-plan 70, bk-test 70 → **900 tokens for eleven**, of which 820 are the ten task skills.

**The §12 budget still holds:** 900 against a ceiling of 1,700 for the listing, with `bk-protocol` now counted rather than free. Projected at seventeen skills on the same average, about 1,390 — still inside, but the margin is no longer the 2.3x the "hidden" assumption implied. Projection, not a measurement.

Phase 1 read the same ten task skills at 750 and this session reads them at 820. The two are not comparable line by line: different host version, different profile, and the panel's figures are the host's own estimates.

## Q2 — does the session-start bootstrap actually load?

**Yes.** Prompt: `Không được đọc file nào. Theo context nạp lúc mở phiên, kit root là đường dẫn nào?` Answer in 4 seconds, **no tool call**: `C:\Projects\Bearingkit`, quoting the protocol line it came from — "Kit root, the directory that holds `skills/` and `scripts/`: C:\Projects\Bearingkit."

That line exists only in the text `hooks/session-start.cjs` injects at session start, so the hook ran and its context was in the model's window. It also settles the earlier doubt about acceptance prompt 1 on this profile: that answer's three searches and one shell command were the model choosing to cite `file:line`, not a missing bootstrap.

## Q3 — does routing survive among 196 skills?

**Yes, on the one prompt tested.** Prompt: `Let's make a react todo list`. First action: `Skill(bearingkit:bk-spec)` — "Successfully loaded skill". No exploration first, and none of the competing skills in the profile (`fullstack-dev-skills:react-expert`, `code-reviewer`, `debugging-wizard`, `api-designer`) took the turn.

This is acceptance prompt 2 of §11, passing in the daily profile rather than the isolated one. **One prompt is a data point, not a measurement**: it says the kit can win a turn against about 196 competing descriptions, it does not say what precision and recall look like there. The sixty-prompt set has never run in this profile.

## What these readings change

- `docs/status.md` §7 (i), (j), (k) close or narrow; (k) narrows from "unknown" to "one positive data point, unmeasured at set scale".
- Spec §6 and §12 said `bk-protocol` is hidden from the listing. Corrected on 2026-09-13 to say what the host does now, with this file as the evidence; `docs/hosts.md` gains the drift note.
- `doctor` found the Antigravity copy stale the same day and `bearingkit antigravity install` refreshed it; the pair is now the standing rule after any edit under `skills/`.
