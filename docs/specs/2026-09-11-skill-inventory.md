# Skill source inventory — batch pass, 2026-09-11

This is D2 from `docs/handoff/2026-09-11-owner-directives.md`: re-run the batch-1 inventory of `docs/handoff/2026-09-11-opus5-handoff.md` §4.1 after the prior session's 16-parallel-agent fan-out died in one shot to a rate limit (`HTTP 429`, model `claude-fable-5-1`, handoff §3.1, §5.1). This pass does the source-registry facts directly (Bash: `git rev-parse`, `find`/LICENSE reads, `gh api`) instead of spawning agents, in batches of at most 3 sources, reported after each batch, per the owner's constraint. No parallel agents were spawned for this document.

**Scope.** One row per source: name, local path, local sha, license presence/kind, role (source to absorb vs. tool that runs alongside the kit), and star count. This is registry-level only — it does not re-litigate per-item absorb/idea/drop decisions (handoff §2.1.7, §4.1's per-source item tables) or set priority order. That is D3 (directive 4), which after a first pass in a separate file now lives at the end of this document, as the directive's wording requires.

Covers the 16 sources of handoff §4.1 plus Skillmark, which handoff §4.4 also names as a `sources.json` gap. "Antigravity docs" (also named in §4.4) is deliberately **not** a row here — see "Excluded from this pass" below.

## Method

- Local sha: `git -C <path> rev-parse HEAD` for real clones under `_build/upstream/` (gitignored, shallow clones) and for the two on-disk repos owned by the user (ClaudeKit research clone, Antigravity-Core). Two sources are installed as extracted plugin packages with no local `.git` (Superpowers, fullstack-dev-skills); for those the sha is the one already verified same-day in `upstream/sources.json` / the prior handoff, not re-derived.
- License: read the actual `LICENSE`/`LICENSE.txt` file where one exists; cross-checked against `gh api repos/<owner>/<repo>/license` and `gh api repos/<owner>/<repo> --jq '.license'`. A 404 on the license endpoint plus no local file means no license.
- Stars: `gh api repos/<owner>/<repo> --jq '.stargazers_count'`, checked fresh in this pass (2026-09-11) for all 17 rows. Per the owner's constraint, this is an ordering signal only, never quoted as if it proved quality or size.
- Role: **source to absorb** = the kit reads or adapts its text/patterns into `skills/`. **Tool alongside** = it is software you run (a CLI, a bot, a separate command framework, an eval harness), not prose to mine; the kit coexists with it rather than absorbing it. Judgment calls are noted inline.

## The 17 sources

`~` below stands for `C:\Users\tuyen\.claude\`.

| # | Source | Local path | Local sha | License | Role | Stars (verified 2026-09-11) |
|---|---|---|---|---|---|---|
| 01 | obra/superpowers | `~\plugins\cache\superpowers-marketplace\superpowers\5.1.0` | `f2cbfbefebbfef77321e4c9abc9e949826bea9d7` (tag 5.1.0; from `sources.json`, same-day verified — cache has no `.git` to re-derive) | MIT (Jesse Vincent) — `LICENSE` present, `gh api` confirms | **Source to absorb** — already the kit's structural foundation; 7 `references/` files ported | 285,003 |
| 02 | anthropics/claude-plugins-official | `_build/upstream/claude-plugins-official` | `3b600518a637492d37c9877aeb49c2a55d939c04` | Apache-2.0 — `LICENSE` present, `gh api` confirms | **Source to absorb** — `code-review`, `pr-review-toolkit`, `frontend-design`, `claude-code-setup`, `security-guidance` patterns; a `tracked` shortlist already exists in `sources.json`, LSP/output-style/playground plugins still need per-item `drop` rows (later) | 36,130 |
| 03 | jeffallan/claude-skills (plugin: fullstack-dev-skills) | `~\plugins\cache\fullstack-dev-skills\fullstack-dev-skills\0.4.14` | `5e8b6b8ff4007414f91f980771047b6136600c34` (marketplace repo HEAD; cache has no `.git`) | MIT — `LICENSE` present, `marketplace.json` declares it, `gh api` confirms | **Tool alongside** — 66 skills already installed and directly invocable in this Claude Code profile; permissive license, but the coverage matrix's own call (row 8) is not to vendor it, only to let `code-reviewer`/`debugging-wizard`/`test-master` inform `bk-review`/`bk-debug`/`bk-test` | 11,414 |
| 04 | c0x12c/ai-toolkit (Spartan AI Toolkit) | `~\commands\spartan*`, `~\rules\**` | remote `master` HEAD `96b2c9d099f8507a95b9e43916f144594720a3c9` (checked now) — **not** necessarily what's installed; the installed version is `1.26.0` per `~\.spartan-version`, no matching local sha exists | **None** — `gh api .../license` 404, no `LICENSE` file at repo root | **Tool alongside** — no permissive license means no text can be lifted; it is also the command framework literally driving this session's own `CLAUDE.md` right now, i.e. it already runs beside the kit rather than being mined for it | 99 |
| 05 | ClaudeKit (claudekit/claudekit-engineer) | `C:\Projects\claudekit-research\claudekit-engineer` | `898c4a5cddac05b919e2c9ce922460f5662d511b` | Proprietary — `LICENSE`: "Copyright (c) 2024-2025 ClaudeKit. All Rights Reserved."; GitHub license field = `"Other"` | **Tool alongside** — proprietary, clean-room ideas only; four of its hooks (`simplify-gate`, `descriptive-name`, `scout-block`, `privacy-block`) are still live in `~\settings.json` right now | 681 — **repo is private** (confirmed via API); this count is visible only to accounts with access, not a public signal |
| 06 | mattpocock/skills | `_build/upstream/mattpocock_skills` | `3cca18b368ae95cdbdebbff572ccafa662551015` | MIT — `LICENSE` present, `gh api` confirms | **Source to absorb** — `grill-me`, `diagnose`/`triage`, `zoom-out`, `handoff` map to `bk-spec`/`bk-debug`/`bk-audit`/`bk-close` | 259,249 |
| 07 | addyosmani/agent-skills | `_build/upstream/addyosmani_agent-skills` | `6ca0cd7db39b41b1c37e26d335c507ee92382c6d` | MIT — `LICENSE` present, `gh api` confirms | **Source to absorb** — ideas-only per the existing decision (absorb only where a checklist clearly beats the kit's own) | 93,478 |
| 08 | multica-ai/andrej-karpathy-skills | `_build/upstream/multica-ai_andrej-karpathy-skills` | `2c606141936f1eeef17fa3043a72095b4765b9c2` | **None** — no `LICENSE` file, `gh api` license field empty | **Source to absorb** (ideas-only) — one `CLAUDE.md` of four failure-mode rules already informs `AGENTS.md`'s autonomy gate | 212,209 |
| 09 | github/spec-kit | `_build/upstream/github_spec-kit` | `c173bf19a6654e3b05386ec3599349a55282b897` | MIT — `LICENSE` present, `gh api` confirms | **Source to absorb** (ideas-only) — spec-first discipline for `bk-spec`/`bk-plan`; the kit routes from plain language rather than spec-kit's own commands | 135,433 |
| 10 | anthropics/skills | `_build/upstream/anthropics_skills` | `34040c9c568585f6929bedeaad110ad08f079624` | Mixed — **no** license at repo root; `skills/frontend-design/LICENSE.txt` and `skills/mcp-builder/LICENSE.txt` are each Apache-2.0 | **Source to absorb**, those two skills only — the document-handling skills in the same repo are excluded regardless (not open) | 175,748 |
| 11 | vercel-labs/agent-skills | `_build/upstream/vercel-labs_agent-skills` | `063bee94c3f4df8453406c830b0a7df0f2860278` | **None** — no `LICENSE` file, `gh api` license field empty | **Source to absorb** (reference only, nothing vendored) — `react-best-practices`, `web-design-guidelines` cited as reading for `bk-design` | 31,056 |
| 12 | PatrickJS/awesome-cursorrules | `_build/upstream/PatrickJS_awesome-cursorrules` | `b044f956f021b6e8877f16781bcfc466a6a120e9` | CC0-1.0 — `LICENSE` text confirmed ("CC0 1.0 Universal"), `gh api` confirms | **Source to absorb** (reference, grouped by stack, not vendored per rule set — a deliberate choice despite the permissive license) | 40,763 |
| 13 | cloudflare/skills | `_build/upstream/cloudflare_skills` | `b052c32bab7dd493513260228a36c88294f343f1` | Apache-2.0 — `LICENSE` present, `gh api` confirms | **Source to absorb** (reference) | 2,815 |
| 14 | tuyenht/Antigravity-Core (owner's previous kit) | `C:\Projects\Antigravity-Core` | `1774280ee0d559d337f8f3a7014e45ce9d974f11` (VERSION `5.0.1`) | Proprietary, owner-authored — "Copyright (c) 2026 Antigravity-Core. All Rights Reserved."; owner's own repo, so the owner's own text may be adapted, third-party text vendored inside it may not | **Source to absorb** (owner's own text) — the predecessor kit this migration supersedes (`docs/plans/2026-09-10-owner-migration.md`); RBA fail conditions, known-failure guard, asset budgets, design-critic, database playbook already partly ported | 0 — repo is **public** (verified via `gh api`, `private: false`; corrected 2026-09-11 after an audit pass caught that the first pass had assumed "private" without checking). 0 stars is a real, checked number, not a placeholder — reads as unlisted/unshared rather than promoted, which fits a personal working kit |
| 15 | vercel-labs/agent-browser | `_build/upstream/vercel-labs_agent-browser` | `8c15ff9f71ae60c7e99e66afe1e2d4b9bf414fe2` | Apache-2.0 — `LICENSE` present, `gh api` confirms | **Tool alongside** — a browser-automation CLI, not skill text; something a `bk-*` skill might shell out to later, not something to mine | 42,400 |
| 16 | The-PR-Agent/pr-agent | `_build/upstream/The-PR-Agent_pr-agent` | `101dcafc41ca447cbc748871e10dfa579017a6ee` | MIT — `LICENSE` text read directly ("Copyright (c) 2026 The PR Agent"), `gh api` confirms | **Tool alongside** — a PR-review CLI/bot you would run before ship, not prose to absorb | 12,948 |
| 17 | claudekit/skillmark | `C:\Projects\claudekit-research\skillmark` | `de78ffbabc807c7e1f4fd790dfcd3ca773508c1e` | **None** — `gh api` license field `null`, no local `LICENSE` file | **Tool alongside** — "Agent skill benchmarking platform with CLI and public leaderboards" (its own README); an eval harness to run, not content to absorb | 8 (public repo) |

## Discrepancy found and not silently fixed

`docs/specs/2026-09-10-coverage-matrix.md` row 7 records Skillmark as "MIT" with no verification method or date cited. This pass checked directly (`gh api repos/claudekit/skillmark` → `license_key: null`; no local `LICENSE` file) and found **no license**. `upstream/sources.json`'s new Skillmark entry carries the corrected finding and says so. The coverage-matrix row itself was left untouched — it is not one of D2's two named deliverables (this file and `upstream/sources.json`), and nothing has actually been absorbed from Skillmark yet (its coverage-matrix status is "designed", not "absorbed"), so there is no live violation, only a stale fact that should not be trusted if D3 or later work goes back to that file.

## `upstream/sources.json` changes made

- **Fixed**: `The-PR-Agent/pr-agent` sha `1421c673effb7644239e18fdea5403ccf04bb190` → `101dcafc41ca447cbc748871e10dfa579017a6ee` (a fresh shallow clone's HEAD, matching what the prior session already found). License re-confirmed MIT by reading the file directly — resolves the MIT-vs-AGPL discrepancy the handoff flagged.
- **Added**: `jeffallan/claude-skills`, `c0x12c/ai-toolkit`, `claudekit/claudekit-engineer`, `tuyenht/Antigravity-Core`, `claudekit/skillmark` — the five gaps handoff §4.4 named (fullstack-dev-skills, Spartan, ClaudeKit, the owner's previous kit, Skillmark).

## Excluded from this pass

- **"Antigravity docs"** (handoff §4.4's sixth item) is not a versioned external repository — it is this kit's own notes about the Antigravity host application's behavior (already living in `docs/hosts.md`, sourced from testing the app itself, not from a GitHub source). It has no sha/license/star triple to record, so it gets no row here and no `sources.json` entry. If the owner meant a specific external source by that phrase, it needs naming.
- Sources not in handoff §4.1's table (`microsoft/playwright-mcp`, `modelcontextprotocol/servers`, `vercel-labs/skills`, `biomejs/biome`, `Aider-AI/aider`) already have `sources.json` entries from an earlier pass and were not re-touched here — they were not part of the batch this handoff scoped.

## Follow-up same day: deep read of the two smallest no-license sources

After the table above, the owner asked to go one step further for the sources blocked on license (no text can be lifted, but the ideas can be learned and rewritten in the kit's own words) — starting with the two smallest, lowest-risk ones. The other two no-license content sources in this pass (Spartan, ClaudeKit — both far larger: ~69 command/rule files and ~89 skills + 13 agents respectively) were deliberately left for the skill-by-skill sprint phase, not rushed here.

**multica-ai/andrej-karpathy-skills** — its `CLAUDE.md` pins four failure modes. Two were already covered by `skills/bk-protocol/SKILL.md` (the Autonomy Gate's "unsure → COUNCIL" covers wrong assumptions; Definition of done's "No test, not done" covers unverifiable code — corrected 2026-09-11 during audit from an earlier, looser attribution to the Evidence section). The other two — no speculative abstraction, and touching only what the task needs — were genuinely missing from `skills/bk-build/SKILL.md`. Landed 2026-09-11 as two paraphrased lines (not the source's wording): a Gates bullet against unrequested abstraction/config/error-handling, and a Steps addition against refactoring code the plan didn't name and against deleting pre-existing dead code instead of naming it. No `NOTICE` entry — no text was copied, only an idea, so none is owed; `upstream/sources.json`'s `absorbed` field says so explicitly, since that word elsewhere in this project (`docs/specs/2026-09-10-coverage-matrix.md`) implies NOTICE and this entry deliberately doesn't meet that bar. `upstream/sources.json`'s entry for this source now carries the `derived` mapping and an `absorbed` date. `node --test tests/*.test.cjs` still passes 44/44 after the change.

**vercel-labs/agent-skills** — read in full. The repo carries seven more skills than `docs/specs/2026-09-10-coverage-matrix.md` row 9 names (`composition-patterns`, `deploy-to-vercel`, `react-native-skills`, `react-view-transitions`, `vercel-cli-with-tokens`, `vercel-optimize`, `writing-guidelines`), worth knowing about later. Of the two the matrix already names: `react-best-practices` is substantial — 70 React/Next.js performance rules across 8 priority categories (eliminating waterfalls, bundle size, server-side performance, client-side data fetching, re-render optimization, rendering performance, JS micro-optimizations, advanced patterns) — a genuinely good fit for the `typescript-react` stack file once one exists. `web-design-guidelines` is thin by comparison: it isn't a static ruleset at all, it's a wrapper that `WebFetch`es `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` at review time — a live-fetch pattern that doesn't fit this kit's static, token-predictable design, worth citing as a pointer rather than copying as a pattern.

This did **not** get written into a skill file: `skills/bk-build/references/stacks/` doesn't exist yet, and per the content program's own phase plan, stack files are step 3 — a later, dedicated phase, not something to create as a side effect of this reading. The synthesis above is carried in `upstream/sources.json`'s entry for this source (`note` and `read` fields) so it isn't lost before step 3 starts.

**Update, same day**: `docs/specs/2026-09-10-coverage-matrix.md` rows 9 and 13 originally still said status "designed" after the reads above landed — stale for row 13 (real substance had landed) and partly stale for row 9 (read, though not yet placed). Both were synced during the same-day audit pass that also caught the Antigravity-Core star/visibility error: row 13's status now says where the two lines actually landed, row 9's says it was read but has no file yet to land in. The Skillmark license correction two sections up was a different call — that one is a correction to an unverified pre-existing claim, not a status field this file's own scope owns, so it stays flagged rather than edited.

## Not done here (by design)

- Per-item absorb/idea/drop decisions inside each source (e.g., which of `claude-plugins-official`'s 39 plugins get a `drop` row and why) — handoff §4.1's per-source notes still apply for whoever does that pass.
- Catalog and pack decisions (handoff §4.3).
- Priority ordering across sources — that is D3, below.

---

# D3 · Re-evaluating the owner's minimal stack, and the unified priority order

Directive 4 says the re-evaluation belongs **"trong bản kiểm kê"** — in this inventory. A first pass put it in a separate `docs/specs/2026-09-11-source-priority.md`; that was a deviation from the directive's wording, could not be justified by anything except this document's own earlier scope note, and has been merged here and deleted.

The verbatim of all four directives is in `docs/handoff/2026-09-11-owner-directives.md`. **Read it there, not the rendering in the coverage matrix.** The first pass of D3 was built on that rendering and lost two facts because of it:

| The matrix's rendering | The owner's words | What the loss cost |
|---|---|---|
| "#7 OpenCode … when needed" | "#7 OpenCode **dự phòng quota**" | D3 called OpenCode "a category error in a content list" and pushed it to Phase 4. The owner never asked for it to be absorbed — they named it a **quota fallback**. The trigger is live: sixteen research agents died to `HTTP 429` on 2026-09-11 (handoff §3.1) and the work stopped. That verdict is withdrawn |
| "#18 Biome when needed" | "#18 Biome **hoặc Pint hook**" | Two losses. The owner writes **hook** — the very form D3 refused on its own authority; and **Pint**, the PHP formatter, which D3 never mentioned. #18 is "the stack's formatter, as a hook", not "Biome, as a command" |

## The shape of the answer: one order, not two

The first pass split the deliverable into "axis A, absorption" and "axis B, runs alongside" and argued a single order was incoherent. That does not survive contact with the verbatim:

- Directive 4 says **"Kết quả cần có: một thứ tự ưu tiên hợp nhất"** — one order, singular, explicit.
- The same directive already asks the evaluation to name "mục nào là công cụ chạy bên cạnh chứ không phải nguồn để hấp thụ". The mixedness of the list is a property the owner told the evaluation to **label**, not a reason the evaluation cannot be merged.
- The owner's own three tiers — Bắt buộc / Trước khi ship / Thêm khi cần — are themselves a single ordering that already spans sources and tools. The list demonstrates the merge the first pass called impossible.

So: one order below. **"Runs alongside" is a column, not an axis.**

## The unified order

Primary key: the owner's three tiers, not re-sorted — an explicit ordering is not overturned by inference. Within a tier: unblocked before blocked, cheaper before dearer. The union is the old mandatory group (`docs/plans/2026-09-10-content-backlog.md`) and the owner's minimal stack.

| # | Item | Role | Licence — what it permits | Target · blocker | Why here |
|---|---|---|---|---|---|
| 1 | **#3 Superpowers** | source | MIT, verified — text with attribution | eight `references/`, all present · none | The owner's "#3 **hoặc** #4" resolves here: Superpowers is the one already absorbed, the only matrix row at that status, and the benchmark baseline. Remaining work is inventory pass 01's gap-check |
| 2 | **official `code-review` + `pr-review-toolkit`** | source | Apache-2.0 at the repo root and in each plugin's own `LICENSE` (read 2026-09-11) — text with attribution | `bk-review`, `bk-test` · none | 830 lines of method, READMEs excluded (`code-review.md` 92, `review-pr.md` 189, six lenses 549). Unblocked, and it is the only thing that unlocks the seeded-bug fixture two measurement cells depend on (matrix rows 2 and 19). **Old mandatory group; not in the owner's list, and the owner asked only about claude-code-setup — raising it is this document's own call, not a question the owner posed** |
| 3 | **#21 frontend-design** | source | Apache-2.0 (`LICENSE.txt`, both copies) — text with attribution | `bk-design` · **blocked: the folder does not exist**, and §5.2 admits a skill only when the inventory shows work for it | 71 lines, cheap, genuinely mandatory. Ranked on the blocker, not the value |
| 4 | **#15 agent-browser** | **runs alongside** | Apache-2.0, but its ten `SKILL.md` files (1,938 lines) document its own CLI — vendor-shipped, so principle 4 says use it, do not re-implement | `bk-test`, `bk-design` name it; `doctor` reports it · none | Absorbable surface: zero. Real work: two lines and one check. The owner names it and not playwright-mcp, which settles the "one browser tool per install" that matrix rows 17–18 left open |
| 5 | **#1 karpathy-skills** | source | **No licence file — ideas only, never a word of text** | `bk-build` · — | **Closed 2026-09-11.** A 65-line `CLAUDE.md`, four failure modes: two already covered by `bk-protocol`, two landed as paraphrased lines in `bk-build`. Nothing remains; listed so nobody re-reads it |
| 6 | **#19 vercel agent-skills** | source | **No licence file — ideas only**; 70 React rules must be re-derived clean-room, the dearest form of work per unit of value | `bk-build/references/stacks/` · **blocked: Step 3** | Mandatory by the owner, but its landing file does not exist until the stack-file step, and half the named content (`web-design-guidelines`) is a live fetch of its own rules — see Collisions |
| 7 | **official `claude-code-setup`** | source | Apache-2.0 | `doctor` · **blocked: `doctor` is "later" in `bin/bearingkit.cjs`** | Old mandatory group, and the item the owner explicitly asks about. Verdict below: keep, demoted, scope cut — on weaker ground than the first pass claimed |
| 8 | **#17 security-guidance** | source | Apache-2.0 (same repo as 2) | `bk-protocol` security baseline, a `bk-review` lens · none | `hooks/patterns.py` is 360 lines of pure pattern data ("Pure data + one pure helper. No … I/O", its own docstring) — absorbs as prose. Same repo and sha as item 2, so one `NOTICE` entry and one pass. **Unblocked and cheap while items 3, 6 and 7 are blocked**: on evidence it would rank above them, but the owner's tier says "trước khi ship", and the tier is not overturned here — flagged as a question instead |
| 9 | **#16 pr-agent trên CI** | **runs alongside** | MIT by its own `LICENSE` and the API, read 2026-09-11 (the owner's list said AGPL). Moot: nothing is vendored | `bk-review`'s second-context definition; one benchmark row · none | The owner's words add "trên CI", which is where the independent review has to come from a different model to count |
| 10 | **#2 rule theo stack** (awesome-cursorrules) | source | CC0-1.0 — vendoring is permitted; **not vendoring is the kit's own decision**, not a licence limit | the eight stack files · **blocked: Step 3** | Cited as the starting read per stack; the text stays the kit's |
| 11 | **#7 OpenCode, dự phòng quota** | **runs alongside** (a host) | — (nothing taken) | `docs/hosts.md` as a documented fallback; "supported" only after the spec v2 §11 acceptance test · none for documenting | Not a content item, and the owner never asked it to be one. Its value is availability the day the quota dies — which already happened once in this workstream. Cheap to document now, expensive to discover under a rate limit |
| 12 | **#18 Biome hoặc Pint, hook** | **runs alongside** + **collides** | Apache-2.0; nothing taken | `detect-stack` guardrail list, `bk-ship` · the hook form collides — see Collisions | The owner's own example of a conflict, so the conflict is to be surfaced, not settled by this document |

**Below the line.** **#4 spec-kit** leaves the mandatory set, because the owner wrote "#3 **hoặc** #4" and item 1 takes the slot. The first pass kept both and called the "or" non-exclusive; that was the owner's explicit word being overridden by inference, the same move the first pass refused to allow against `claude-code-setup`. Recorded so the finding is not lost: MIT, 3,031 lines of templates and command prose, `clarify.md` 291 and `analyze.md` 255 map onto `bk-spec` and `bk-audit` — the largest untapped permissively-licensed method surface seen in this pass. It is optional and waits for the owner. Sources outside this union keep the position their matrix row gives them and are not demoted by absence here: mattpocock (16), addyosmani (15), cloudflare (21), the reference MCP servers (23), the `npx skills` channel (24), aider's repo-map idea (26).

## Collisions with a principle already in force

| Item | The collision | Rule it runs into | Recommendation — the decision is the owner's |
|---|---|---|---|
| **#18 Biome/Pint as a hook** | A format-on-write hook needs host settings written and an enforcement event | v2 §8: enforcement hooks are "optional extras … scheduled for v0.4, never required", and "the kit writes no host settings"; v2 §4 deleted the stack-profile hook | Guardrail command run by `bk-ship` in v0.2; the hook form at v0.4 if the owner wants it. The first pass wrote "No hook" as a decision — that overreached: the owner's word is "hook", so this is theirs to settle |
| **#19 `web-design-guidelines`** | It `WebFetch`es *its own rules* from a raw URL at review time, so the skill has no versioned content | v2 §10 records a sha and a tracked-file list per source; v2 §16's drift watch runs against those locked shas. A skill whose body lives outside the repo has neither. Not a ban on fetching — v2 §16 sanctions pinned-documentation lookup; the line is between fetching facts about someone else's technology and fetching the skill's own body | Cite as a pointer; never copy the pattern. Moot for copying anyway — no licence |
| **#17 security-guidance** | Ships as a hook: eight Python files plus tests around the data | Same hook policy | Absorb `patterns.py` as prose; drop the machinery |
| **#15 agent-browser** | Ten `SKILL.md` files documenting its own CLI | Principle 4, "official first … not re-implemented"; "vendor-shipped" is on the deliberate-drop list | Name the tool; absorb nothing |
| **#21 frontend-design** | The same text in two sources — `claude-plugins-official/plugins/frontend-design/skills/frontend-design/SKILL.md` and `anthropics/skills/skills/frontend-design/SKILL.md`, same SHA-256 `b8009ae6…c237df8`, `cmp` clean, 2026-09-11 | §5.2: one source item, one skill, one decision | Recommend the official plugins repo — one `NOTICE` entry and one sha shared with items 2, 7 and 8, leaving matrix row 22 to `mcp-builder`. Not applied; nothing is ported yet |

## `claude-code-setup`: keep, demoted to rank 7, scope cut — on two reasons, not three

The owner asks directly whether it keeps its priority. Answer: **keep**, scoped to the 289-line recommender method plus one table, at rank 7 because `doctor` does not exist.

Reasons that hold:

1. **It is the only baseline for a claim the matrix already promises.** Row 2's measurement cell reads "Setup: `doctor` output vs claude-code-setup recommendations on the same repository", and that file's own rule is that "better" claims quote the measurement column and nothing else. Drop the source and the claim cannot be made at all.
2. **Cost is low and concentrated.** `SKILL.md` 289 lines; of the 1,188 lines of references, `hooks-patterns.md` (226), `mcp-servers.md` (276) and `plugins-reference.md` (97) describe machinery v2 removed or deferred, and `skills-reference.md` (408) overlaps Superpowers' `writing-skills`, already static checks in `tests/skills.test.cjs`. `subagent-templates.md` (181) splits: its templates duplicate the four hand-written agents v2 fixed, but its "Recommend when / Detection" table is the shape `doctor` needs. 1,007 of 1,477 lines drop.

Reason **withdrawn**: the first pass also argued "it was an explicit owner decision", citing `docs/plans/2026-09-10-content-backlog.md` §"Phase 2 seeding step (owner's explicit ask)". That label cannot be verified — no verbatim of 2026-09-10 exists in this repository, only renderings (see Provenance labels below). Leaning on it was the same error this pass is documenting. The verdict stands on the two reasons above, which is weaker than what the first pass claimed.

**The same omission, unasked:** the official `code-review` plugin is also old-mandatory and also absent from the minimal stack, and the owner did **not** ask about it. Followed literally, `bk-review` would be built from pr-agent — a tool that emits findings, not a method. That is this document's own objection, ranked at item 2, and it is a question for the owner rather than a settled call.

## Provenance labels that cannot be verified

Found by scanning the working tree and the commits that carry D1–D3. Each attaches owner authority to text a session actually composed:

| Location | Label | Status |
|---|---|---|
| `docs/specs/2026-09-11-bearingkit-v2-design.md` §1 | "The owner's requirement **in their own words** (2026-09-10 and 2026-09-11)" | A rendering, not a transcript — it is in English and the owner writes Vietnamese. Relabelled |
| `docs/specs/2026-09-10-coverage-matrix.md`, header and "Rows named by the owner" | "Owner's requirement (2026-09-10)"; the minimal-stack sentence | The minimal-stack sentence is **provably lossy** — it dropped "dự phòng quota" and "hoặc Pint" and both losses propagated into D3. Corrected and marked as a rendering |
| `docs/handoff/2026-09-11-opus5-handoff.md` §4 | "Thứ tự thực thi D1–D6 **do owner chốt**" | The D1–D6 order is the D0 session's proposal; the same mislabel already corrected in `owner-directives.md`. Fixed |
| `docs/plans/2026-09-10-content-backlog.md` | "Phase 2 seeding step (**owner's explicit ask**)"; "Mandatory sources (**owner's requirement**, 2026-09-10)" | Unverifiable, no verbatim exists. Left in place, flagged here; a D3 argument that leaned on it has been withdrawn above |
| `docs/handoff/2026-09-11.md`, spec v2 status line | "approved by the owner" | A different and probably sound claim (approval of a document, not authorship of words). Flagged, not rewritten |

The pattern is not a single incident. Its shape is always the same: a session composes or infers, then labels the result with the owner's authority, and a later session reads the label instead of the evidence.

## Questions for D5 — collected, not asked

Added to the six in `docs/handoff/2026-09-11-opus5-handoff.md` §4.5; D5 asks them in one batch.

1. **#18 Biome/Pint as a hook.** The word is the owner's and it collides with v2 §8. Guardrail command at v0.2 and the hook at v0.4, or change the hook policy now?
2. **#4 spec-kit.** "#3 hoặc #4" is read here as: Superpowers takes the slot and spec-kit leaves the mandatory set. Confirm — or reopen it, in which case its mode also has to move from "ideas-only" to "adapt", since MIT permits the text and the recorded reason for the restriction is about structure, which is the axis the kit's own rule says not to judge on.
3. **`frontend-design` provenance** — the official plugins repo over `anthropics/skills`?
4. **The browser tool** — agent-browser confirmed, playwright-mcp as the documented alternative?
5. **`bk-design`** — created now to unblock rank 3, or does it wait for the per-item inventory §5.2 requires?
6. **Tier versus evidence.** Item 8 (security-guidance) is unblocked and cheap while ranks 3, 6 and 7 are blocked. The owner's tier keeps it at 8. Move it up, or keep the tier?
7. **The official `code-review` plugin** — old-mandatory, absent from the minimal stack, and not something the owner asked about. Keep it at rank 2, or was its omission deliberate too?

---

*D3 written 2026-09-11, audited the same day, then rebuilt after the owner's verbatim directives landed in the repository. Counts come from commands run in those passes (`wc -l`, `find`, `cmp`, `sha256sum`) against the clones in the table above; no star count is used as evidence. Biome (#18) and OpenCode (#7) were not cloned and rest on their matrix rows' 2026-09-11 API reading — noted because nothing is taken from either. What the rebuild changed: the two-axis split became one order with a role column; #7 lost the "category error" verdict; #18 gained Pint and lost the unilateral "no hook"; #4 left the mandatory set; the `claude-code-setup` defence lost one of its three reasons.*
