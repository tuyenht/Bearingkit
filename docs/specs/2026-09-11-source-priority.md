# Source priority: one order across the mandatory group and the owner's minimal stack

This is **D3** from `docs/handoff/2026-09-11-owner-directives.md` (the owner's directive 4): re-judge the minimal stack the owner named on 2026-09-11 and merge it with the mandatory group of 2026-09-10 into a single priority order, each item carrying its reason and its licence constraint. It consumes D2 (`docs/specs/2026-09-11-skill-inventory.md`, registry facts) and the source rows of `docs/specs/2026-09-10-coverage-matrix.md`. It sets order only; it does not move any matrix row's status and ports no text.

**Caveat that limits every judgement below.** The verbatim text of the owner's four directives is still missing (`docs/handoff/2026-09-11-owner-directives.md` says so and deliberately leaves the block empty). The minimal stack is read here from the coverage matrix's own paraphrase of it, quoted verbatim in the next section. If the owner's original wording differs, the reading in §1 is the first thing to re-check.

**The brief this file answers.** Recorded here because otherwise it would live only in a chat window, which `AGENTS.md` says makes it non-existent for the next session. This is **the task as given to this session on 2026-09-11**, not the owner's verbatim directive 4 — do not copy it into the empty block in `docs/handoff/2026-09-11-owner-directives.md`. For each item of the minimal stack (#1, #3/#4, #19, #21, #15, #17, #16, #2, #7, #18), say plainly: which item has no licence, so only its ideas can be taken and none of its words; which is a tool that runs alongside rather than a source to absorb; which collides with a principle already in force (the example given: an automatic formatting hook, #18); and whether `claude-code-setup` keeps its priority although it is **not** on this list — if the answer is keep, the reason must be strong enough to argue against the owner. Output: one priority order unifying the old mandatory group with this list, each item carrying its reason and its licence constraint. If an item the owner ranked mandatory is not supported by the evidence, say so. Write it into a spec; collect any new questions and ask none of them (they belong to D5).

---

## 1. The finding that shapes the rest: this is two lists, not one

The matrix records the minimal stack as:

> "#1 karpathy-skills, #3 superpowers or #4 spec-kit, #19 vercel agent-skills, #21 frontend-design, #15 agent-browser as mandatory; #17 security-guidance and #16 pr-agent before ship; #2 stack rules, #7 OpenCode and #18 Biome when needed."

Two things in that sentence decide how it can be used:

1. **The tier names are moments of use, not positions in a backlog.** "Before ship" is a point in a workflow. "When needed" is a runtime condition. A porting queue is ordered first/second/third; this one is ordered by when you reach for the thing.
2. **Four of the eleven repositories it names have no absorbable content at all under the kit's own rules.** (Eleven repositories in ten slots — "#3 superpowers or #4 spec-kit" is one slot.) `agent-browser` ships ten `SKILL.md` files documenting its own CLI (1,938 lines, counted in the clone) — vendor-shipped material, which principle 4 and the deliberate-drop list say the kit uses rather than re-implements. `pr-agent` is a CLI/bot. `Biome` is a formatter and linter binary. `OpenCode` is a host application, and matrix row 25 already classes it "excluded as a source".

So the minimal stack is a **runtime stack** — what a one-person team installs and runs beside the kit. The mandatory group of 2026-09-10 is an **absorption queue** — what the kit ports into `skills/`. They are different axes, and merging them into one ranked list would put a formatter next to a review method and pretend the two compete for the same session.

The unified order below therefore has two axes. Axis A is the one the content program actually consumes; axis B costs a handful of lines and one `doctor` check per entry.

**What this does not settle.** Whether the owner *also* meant the omissions as demotions — `claude-code-setup` and the official `code-review` plugin are in the old mandatory group and absent from the minimal stack. §5 answers that on the merits and §8 parks the question.

## 2. Three numbering systems — the mapping

Three different numbers are in play and they collide: the owner's item numbers (#1–#23), the coverage matrix's row numbers (1–39), and D2's inventory rows (01–17). `#21` is **not** matrix row 21. Identities come from the matrix's own sentence above; the row is then a lookup by name.

| Owner # | Repository / plugin | Matrix row | D2 inventory row |
|---|---|---|---|
| #1 | multica-ai/andrej-karpathy-skills | 13 | 08 |
| #2 | PatrickJS/awesome-cursorrules | 14 | 12 |
| #3 | obra/superpowers | 1 | 01 |
| #4 | github/spec-kit | 3 | 09 |
| #7 | anomalyco/opencode | 25 | — (not inventoried; host) |
| #15 | vercel-labs/agent-browser | 18 | 15 |
| #16 | The-PR-Agent/pr-agent | 19 | 16 |
| #17 | security-guidance (in claude-plugins-official) | 2 | 02 |
| #18 | biomejs/biome | 20 | — (not cloned) |
| #19 | vercel-labs/agent-skills | 9 | 11 |
| #21 | anthropics/skills, glossed "frontend-design" in the owner's list | 22 | 10 — its `frontend-design/SKILL.md` is byte-identical to the copy inside row 2 (§6) |
| — | official `code-review` + `pr-review-toolkit` | 2 | 02 |
| — | official `claude-code-setup` | 2 | 02 |

`microsoft/playwright-mcp` (matrix row 17) is in the owner's 23-item list but **not** in the minimal stack, while `agent-browser` is. Matrix row 17 already says the install picks one browser tool, never both. The owner's own list therefore makes that choice; §4 records it and §8 asks for the confirming word.

## 3. Axis A — the absorption queue, ordered

Ranking inputs, in this order: does the licence permit text at all; does the target skill exist today; how much verified substance per unit of work; what blocks it.

| Rank | Item | Licence — what it permits | Target | Blocker | Why this rank |
|---|---|---|---|---|---|
| A1 | **#3 Superpowers** | MIT, verified — text with attribution | eight `references/`, all present | none | Already **absorbed**, the only matrix row at that status. What remains is inventory pass 01's gap-check. It is also the benchmark baseline every other claim is measured against (`docs/plans/2026-09-10-content-backlog.md`, exit criterion) |
| A2 | **official `code-review` + `pr-review-toolkit`** → `bk-review`, test lens → `bk-test` | Apache-2.0 at the repo root **and** again in each plugin's own `LICENSE` (both read 2026-09-11) — text with attribution | `bk-review` exists, one reference in it | none | Highest substance with no blocker: **830 lines** of method, READMEs excluded — `code-review.md` 92, `review-pr.md` 189, six review-agent lenses 549. It also unlocks the seeded-bug fixture that the only two measurement cells naming it depend on (matrix rows 2 and 19). **Not on the owner's minimal stack** — see §5 |
| A3 | **#17 security-guidance** → protocol security baseline + a `bk-review` lens | Apache-2.0 (same repo root) | `bk-protocol`, `bk-review` both exist | none | `hooks/patterns.py` is 360 lines of pure pattern data with no I/O — absorbs as prose with no machinery. Same repo and same sprint as A2; do them in one pass. Absorb the data, **drop** the eight hook files around it (§6) |
| A4 | **#4 spec-kit** → `bk-spec`, `bk-audit` | MIT — text with attribution | both exist | its mode is currently "ideas-only" (COUNCIL proposal in §8) | The largest untapped permissively-licensed method surface in the whole list: 3,031 lines of templates and command prose in the clone, of which `clarify.md` (291) and `analyze.md` (255) map straight onto `bk-spec` and `bk-audit`. Its `src/` CLI is a tool and stays out |
| A5 | **#21 frontend-design** → `bk-design` | Apache-2.0 (`LICENSE.txt`, present in both repos) | **`bk-design` does not exist** — 11 skill folders today, six of the catalog missing | §5.2: a skill enters the catalog only when the inventory shows work for it, and D2 was registry-level only | Cheap (`SKILL.md` is 71 lines) and genuinely mandatory, but it is the only item here that needs a new skill folder first. Ranked on the blocker, not on the value |
| A6 | **official `claude-code-setup`** → `doctor` + the seeding step | Apache-2.0 | `doctor` is "later" in `bin/bearingkit.cjs`; no skill target | `doctor` does not exist | Kept, demoted, scope cut from 1,477 lines to the 289-line method — §5 |
| — | **#1 karpathy-skills** | **No licence file** — ideas only, never text | `bk-build` | — | **Closed 2026-09-11.** Four failure modes: two were already covered by `bk-protocol`, two landed as paraphrased lines in `bk-build`. Remaining absorbable surface: zero. Keep it off the queue so nobody re-reads it |
| S3 | **#2 awesome-cursorrules** and **#19 vercel agent-skills** | #2 CC0 (vendoring permitted, the kit's own decision is not to); #19 **no licence file** — ideas only, clean-room rewrite | `skills/bk-build/references/stacks/` | that directory does not exist until content-program **Step 3** | Both are stack-file inputs and cannot land earlier without inventing the step. #19's `react-best-practices` is 70 substantial rules that must be re-derived, not copied — the most expensive form of work per unit of value in this list |

**Below the line — what this order deliberately does not contain.** D3's brief is the union of the mandatory group and the minimal stack, and nothing else. Every other source to absorb keeps the position its matrix row already gives it and is **not** demoted by its absence here: mattpocock (row 16), addyosmani (row 15), cloudflare (row 21), the reference MCP servers (23), the `npx skills` channel (24), aider's repo-map idea (26). Content-program Step 2 runs by lifecycle order, so several of them land in the same sprint as an item above — mattpocock's `grill-me` alongside A4 in `bk-spec`, its diagnose/triage alongside `bk-debug`. Read A1–S3 as the order *within* this union, not as the whole backlog.

## 4. Axis B — the runtime stack, the owner's own order kept

These take no text. Each costs one or two lines in a skill body plus a `doctor` presence check.

| Owner tier | Item | Licence note | What the kit actually does |
|---|---|---|---|
| mandatory | **#15 agent-browser** | Apache-2.0, but its skills are vendor docs for its own CLI → drop, do not absorb | `bk-test` and `bk-design` name it as *the* browser check; `doctor` reports whether it is installed. The owner's own list makes the pick that matrix rows 17 and 18 left open — it names agent-browser and not playwright-mcp; this file reports that choice rather than making it, and §8 still asks for the confirming word |
| before ship | **#16 pr-agent** | MIT by its own `LICENSE` and the API, read 2026-09-11 (the owner's list said AGPL). The dispute is moot: nothing is vendored | `bk-review` accepts a pr-agent run on CI as the second independent context; one row in the outcome benchmark |
| when needed | **#18 Biome** | Apache-2.0; nothing taken | `detect-stack` lists it among guardrail commands when configured; `bk-ship` runs it before push. **Not** a format hook (§6) |
| when needed | **#7 OpenCode** | — | Not a content item at all. Host roadmap: matrix row 25, Phase 4 at the earliest, listed "supported" only after the spec v2 §11 acceptance test |

### The single sequence

The brief asked for one order. Two axes is the honest shape of the answer — but they are not two schedules, because axis B costs a line or two each and rides inside an axis-A sprint. Folded, the sequence is:

1. **Superpowers gap-check** (A1) — inventory pass 01.
2. **`bk-review` sprint**: A2 + A3 in one pass (same repo, same sha, one `NOTICE` entry), and while `bk-review` is open, add pr-agent's line (#16) and its benchmark row.
3. **`bk-spec` / `bk-audit` sprint**: A4, ideas-only until the mode question is answered.
4. **`bk-test` sprint**: name agent-browser (#15) as the browser check; `detect-stack` and `bk-ship` pick up Biome (#18) as a guardrail command.
5. **`bk-design`** (A5) — only after §5.2's per-item inventory justifies the new skill folder.
6. **`doctor`** (A6) — claude-code-setup's method, once the command exists.
7. **Step 3, stack files** — #2 and #19.
8. **Phase 4, hosts** — OpenCode (#7), behind an acceptance test.

## 5. `claude-code-setup`: kept as a mandatory source, demoted, scope cut by two thirds

Verdict: **keep**, at A6, with its scope reduced to the 289-line `SKILL.md` method and the measurement baseline.

Three reasons strong enough to stand against the omission:

1. **It is the only baseline for a claim the kit has already promised.** Matrix row 2's measurement cell reads "Setup: `doctor` output vs claude-code-setup recommendations on the same repository." The file's own rules say "'Better' claims quote the row's measurement column; nothing else." Dropping the source does not just drop a source — it deletes a "better" claim the kit cannot then make at all.
2. **It was an explicit owner decision, not an agent's proposal.** `docs/plans/2026-09-10-content-backlog.md` heads the seeding step "Phase 2 seeding step (**owner's explicit ask**)". The repo's own guard rule says an explicit owner decision is not reversed by inference — and absence from a later list that is, on §1's reading, about something else entirely is inference.
3. **Cost is low and concentrated.** One file carries the method.

And the honest counterweight, which is why it is A6 and not rank 4: of its 1,477 lines, `hooks-patterns.md` (226), `mcp-servers.md` (276) and `plugins-reference.md` (97) describe machinery v2 removed or deferred, and `skills-reference.md` (408) overlaps Superpowers' `writing-skills`, already landed as static checks in `tests/skills.test.cjs`. `subagent-templates.md` (181) splits: its agent templates duplicate a decision v2 already fixed at four hand-written agents paired with four personas, but its "Recommend when / Detection" table is exactly the shape `doctor` needs, so that table travels with the method. What is genuinely new for v2 is the recommender method plus that one table — 1,007 of 1,477 lines drop. If the owner *did* mean to drop it, what is lost is one measurement baseline and one method file — not a capability.

**The same omission, worse:** the official `code-review` plugin is also in the old mandatory group and also absent from the minimal stack. Followed literally, `bk-review` would be built from pr-agent — a tool that emits findings, not a method — and nothing else. That is a hole, not a simplification, which is why A2 sits second.

## 6. Where an item collides with a standing principle

| Item | The collision | Rule it runs into | Call |
|---|---|---|---|
| **#18 Biome** as an auto-format hook | A format-on-write hook needs host settings written and an enforcement event | v2 §8: enforcement hooks are "optional extras … scheduled for v0.4, never required" and "the kit writes no host settings"; v2 §4 deleted the stack-profile hook; decisions log 2026-09-11 | Guardrail command only, run by `bk-ship`. No hook. (Matrix row 20 states the same conclusion but cites "principle 7", which is v1's numbering — stale, flagged, not edited here) |
| **#19 `web-design-guidelines`** | It is not a ruleset — it `WebFetch`es *its own rules* from a raw URL at review time, so the skill has no versioned content | v2 §10: provenance records a sha and a tracked-file list per source, and v2 §16's upstream drift watch runs against those locked shas. A skill whose rules live outside the repo has neither. (This is **not** a ban on fetching: v2 §16 sanctions pinned-documentation lookup through context7 or `bk-research`. The line is between fetching facts about someone else's technology and fetching the skill's own body) | Cite as a pointer; never copy the live-fetch pattern. Moot for copying anyway — the source has no licence |
| **#17 security-guidance** | Ships as a hook: eight Python files plus tests around the data | Same hook policy as Biome | Absorb `patterns.py` as prose; drop the machinery |
| **#15 agent-browser** | Ten `SKILL.md` files that document its own CLI | Principle 4, "official first … not re-implemented"; "vendor-shipped" is on the deliberate-drop list | Name the tool; absorb nothing |
| **#21 frontend-design** | The same text sits in two sources: `claude-plugins-official/plugins/frontend-design/skills/frontend-design/SKILL.md` and `anthropics/skills/skills/frontend-design/SKILL.md` — **byte-identical**, same SHA-256 `b8009ae6…c237df8`, `cmp` clean, 2026-09-11 | §5.2: one source item maps to exactly one skill and one decision | **Recommended, not decided** (§8): take the official plugins repo as provenance — its root licence and its own plugin `LICENSE` both cover it, and it is one `NOTICE` entry and one sha shared with A2, A3 and A6, leaving matrix row 22 to `mcp-builder`. Nothing is ported yet, so the recommendation has no live effect until the owner confirms |

## 7. Items the owner ranked "mandatory" that the evidence does not support at that rank

Stated plainly, as directive 4 asks.

- **#1 karpathy-skills — mandatory, and finished.** Its entire content is a 65-line `CLAUDE.md` pinning four failure modes; two were already covered, two landed on 2026-09-11. Ranking it first would schedule a re-read of a source with nothing left in it.
- **#19 vercel agent-skills — mandatory, but it cannot be first.** No licence file means every one of those 70 React rules has to be re-derived clean-room; its landing file does not exist until Step 3; and half the named content contradicts the kit's static design (§6). The value is real; the rank is Step 3.
- **#15 agent-browser — mandatory to *install*, not to *port*.** Absorbable surface is zero by the kit's own rules. Real work: two lines and a `doctor` check.
- **#7 OpenCode in a content list is a category error.** It is a host. Matrix row 25 excludes it as a source; hosts are listed only after an acceptance test. It leaves axis A entirely — which agrees with the owner already ranking it "when needed".
- **#3 or #4 — the "or" is already settled by fact, and it is not exclusive.** Superpowers is absorbed and is the structural foundation; spec-kit is a different, smaller question about spec-first discipline. Treating them as alternatives would drop A4.

## 8. What this file decides, and what it does not

**Decided here (ACT — ordering inside this repository, reversible, nothing ported):** the two axes of §1, the A1–S3 order of §3, and axis B's contents.

**Recommended, not applied** — each is written into the tables above as a recommendation and repeated as a question below, so no tracking document reads as if it were settled: `frontend-design` provenance from the official plugins repo (§6); `playwright-mcp` as the documented alternative behind `agent-browser` (§4). Neither has a live effect — no `NOTICE` entry or `sources.json` derived map exists for either yet.

**Not acted on (COUNCIL — proposed, waiting):** re-opening spec-kit's mode from "ideas-only" to "adapt". Its licence is MIT, so the restriction is the kit's own, and the reason recorded in matrix row 3 is about *structure* (it is command-driven; the kit routes from plain language) while the kit's own rule is substance over structure. A mode change is a scope change, so it waits. Until it is answered, A4 proceeds ideas-only, which does not block the sprint.

**Parked for D5** (added to the six open questions in `docs/handoff/2026-09-11-opus5-handoff.md` §4.5, asked in one batch):

1. Is the minimal stack a runtime stack (§1's reading) or an absorption queue? This decides whether `claude-code-setup` and the official `code-review` stay mandatory sources.
2. spec-kit's mode: keep ideas-only, or open it to adapt?
3. `frontend-design` provenance — confirm the official plugins repo over `anthropics/skills`.
4. Confirm `agent-browser` as the single browser tool, `playwright-mcp` as the documented alternative.
5. Does `bk-design` get created now to unblock A5, or does it wait for the per-item inventory §5.2 requires?
6. Biome: confirm guardrail command only, no format hook.

---

*Written 2026-09-11 as D3, audited the same day. Every count is from a command run in this pass (`wc -l`, `find`, `cmp`, `sha256sum`) against the clones recorded in `docs/specs/2026-09-11-skill-inventory.md`; no star counts and no unverified figures are used as evidence. Two entries were **not** independently re-verified here and rest on their matrix rows' 2026-09-11 API reading: Biome (#18, row 20) and OpenCode (#7, row 25) — neither is cloned, and since nothing is taken from either, the licence facts carry no porting risk. Nothing here changes a matrix row's status, ports text, or writes a `LICENSE`.*

*Audit corrections applied the same day, listed so the next session can trust the rest: the seeded-bug fixture claim said matrix rows "2, 8, 19" — row 8 names no such fixture, so it is rows 2 and 19; A2's method surface said "~640 lines", which omitted `review-pr.md`, so it is 830; the minimal stack's "ten entries" is eleven repositories in ten slots; `#21`'s row is 22, not "22 and 2"; the `web-design-guidelines` objection cited v2 §12 and §5.3, which do not carry it — v2 §10 and §16 do.*
