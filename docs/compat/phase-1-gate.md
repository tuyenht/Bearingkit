# Phase 1 gate · Claude Code

Host: Claude Code 2.1.267 on Windows 11 (the CLI had auto-updated from 2.1.266 before the runs; version read from the `init` event of the streams) · isolated profile at `_build/profile/claude` (`CLAUDE_CONFIG_DIR`), kit installed there with `node bin/bearingkit.cjs install --dev C:\Projects\Bearingkit --config-dir …` · eval working directory `evals/fixtures/sample-app` · model sonnet · six turns per prompt · date 2026-09-10.

## Compatibility tests run in the isolated profile

| # | Test | Method | Answer | Verdict |
|---|---|---|---|---|
| 1 (user scope) | Skills linked by junction under `<profile>/skills/` are discovered | `claude -p "List every skill available to you whose name starts with bk-"` | the ten task skills, names only | **PASS** |
| 6 | `user-invocable: false` + `disable-model-invocation: true` hide `bk-protocol` from the listing | same prompt | `bk-protocol` absent | **PASS** |
| import | `@C:/Projects/Bearingkit/core/AGENTS.md` in the profile's `CLAUDE.md` loads the protocol | "What are the two classes of the Autonomy Gate, and which skill handles a bug report?" | "ACT and COUNCIL … bk-debug" | **PASS** |
| rules | `rules/bearingkit` junction loads `security-baseline.md` (no `paths:`, always on) | a request to quote a `.env` file | the model cited the baseline rule and refused before calling any tool | **PASS** (rule loaded) |
| 8 | `permissions.deny` rules written by the installer are enforced by the host | `Read` on `_build/compat/probe.key` (harmless content), observed in stream JSON | one `Read` attempt, tool result `File is in a directory that is denied by your permission settings` | **PASS** |
| 9 | `CLAUDE_CONFIG_DIR` honored | variable pointed at an empty directory | "Not logged in", fresh profile skeleton, `~/.claude` untouched | **PASS** |

## Activation, smoke (one prompt per intent)

| Run | Working dir | Turns | Router text | Result |
|---|---|---|---|---|
| smoke 1 | the kit repository | 2 | "Name the intent, then act" | 4/6: `small` and `feature` ran Grep/Glob looking for the settings page and the invoices page, hit the turn limit, no skill invoked |
| smoke 2 | `evals/fixtures/sample-app` | 6 | "invoke the matching skill as your first action, before reading or searching any code" | **6/6** |

Lesson: the router must say that invoking the skill precedes exploring the code; without that sentence the model explores first and decides later. The prompts also need a working directory that contains what they mention.

Confound found on 2026-09-10 evening: Claude Code loads every `CLAUDE.md` in the ancestors of the working directory, and the fixture sat inside this repository, so all eighty sessions also carried the repository's own working agreement (root `AGENTS.md`, about 1,900 characters, no routing text). The runner now stages the fixture in a directory whose ancestors carry no memory files (beside the repository on this workstation: `C:\Projects\.bearingkit-evals\sample-app`; `--stage-only` prints the path) with a throwaway git history, and refuses to run when memory files exist above the working directory. The confirmation run and the fixed-token measurement use the staged copy.

Second confound, found from the second `/context` reading below: Claude Code also loads `.claude/CLAUDE.md` and `.claude/rules/*.md` from every ancestor of the working directory, so a fixture under the home directory receives the daily profile (`~/.claude`) as project memory even inside an isolated `CLAUDE_CONFIG_DIR`. The first staging location (the temp directory, under the home directory) fell into exactly that trap.

## Activation, full set (60 prompts)

**Run 1** (`evals/results/2026-09-10-claude-full1.md`): 56/60 as labelled, 0 false activations on the eight-per-intent pure-question prompts; question 9/10, small 10/10, feature 10/10, bug 10/10, review 9/10, ship 8/10. The four misses, read from the raw streams:

| id | prompt | got | reading | action |
|---|---|---|---|---|
| q-neg-01 | Can you add a retry to the upload endpoint? | bk-build (then scouted `src/lib/upload.ts`) | a one-file change is ACT and belongs to bk-build; the label `bk-spec` was wrong | label corrected to `bk-build` |
| rev-vi-04 | Nhánh này merge được chưa? | bk-ship | the model read "mergeable" as "ready to ship"; bk-review's cues lacked the merge-safety wording | cues added: "safe to merge", "merge được chưa"; bk-ship now says "Not for: judging whether a change is safe (bk-review)" |
| ship-vi-03 | Giao hàng tính năng xuất hóa đơn. | bk-spec | the fixture has no export yet, so "deliver the export feature" read as "build it"; the phrasing is also unnatural for a developer | prompt rewritten to "Xong phần xuất hóa đơn rồi, ship đi."; bk-ship description now opens with "Finish work that is already done" and carries "xong rồi ship đi" |
| ship-neg-02 | Deploy bản này lên staging. | none: the model stated that a remote change is COUNCIL and proposed instead of acting | designed behaviour; no Phase 1 skill covers ops, and the router also allows routing ops to bk-spec | label widened to `bk-spec|none` |

**Run 2**, review and ship intents only, after the cue changes (`…-review-full2.md`, `…-ship-full2.md`): review **10/10**, ship 9/10 where the one miss is ship-neg-02 routed to `bk-spec` this time (the other accepted route). Same prompt, two runs, two accepted answers: routing is not deterministic on this prompt, which is why the label lists both.

**Gate result on Claude Code:** positives **48/48** across the six intents (question 8/8 answered directly, small 8/8, feature 8/8, bug 8/8, review 8/8 in run 2, ship 8/8 in run 2); negatives 12/12 with the two label corrections; false activations on pure-question prompts **0/8**. One tuning round on two descriptions, both still under 300 characters (253 and 292).

Quota used: the sixty-prompt run plus the twenty-prompt rerun, all short sonnet sessions in the isolated profile, moved the five-hour window from roughly 20% to 73%.

## Fixed tokens

First reading (2026-09-10, pasted by the owner): a session on Opus 5 whose skills total equalled the sum of the eighteen built-in skills with no `bk-` entries and no custom agents; memory files 709 tokens, consistent with the repository's root `AGENTS.md` loaded through the ancestor `CLAUDE.md` and not with `core/AGENTS.md` (about 4,200 characters). The kit was not in that session, so the reading is not the measurement. What it does establish: the host's own overhead in that session was system prompt 3.6k plus tool definitions 28.6k, which sits outside the kit's budget; the kit's ≤5,000 is measured over and above it.

Second reading (2026-09-10, isolated profile confirmed by `/skills` showing the eleven kit skills and nothing else, Claude Code 2.1.267, Opus 5 1M, working directory the staged copy under the temp directory): total 107.3k; system prompt 3.4k; system tools 28.3k; memory files **71.9k**; skills 3.5k for 27 skills; messages 183. Readings: skills 3.5k against 2.9k for the eighteen built-in ones leaves about 0.6k for the ten descriptions, in line with the `/skills` panel (eight at ~70, `bk-review` ~90, `bk-ship` ~100). Memory 71.9k cannot come from the kit (about 5,400 characters in total); it matches the daily profile, `~/.claude/CLAUDE.md` (22,399 characters) plus thirty rule files (196,694 characters), which sit at `.claude/` of the ancestor `C:\Users\tuyen` of the temp directory. Grade: inferred from the size match and from the absence of any other candidate. `/context all` in 2.1.267 lists MCP tools and skills, not memory files, so the direct confirmation came from the third reading instead: the same profile in a location with nothing above it dropped memory to 1.9k.

Third reading (2026-09-10, isolated profile, staged copy beside the repository with no memory file above it, `/context` then `/context all`, Claude Code 2.1.267, Opus 5 1M): total 37.2k; system prompt 3.4k; system tools 28.3k; memory files **1.9k**; skills 3.5k across 27 (User group: the ten `bk-` skills, 750 tokens by the panel's per-skill figures, `bk-ship` ~100, `bk-review` ~90, eight at ~70; Built-in: seventeen, 2,750); messages 122; no custom agents; `bk-protocol` absent from the User group, which is the direct form of test 6. The 1.9k of memory is `core/AGENTS.md` plus `security-baseline.md` (5,417 characters together) by elimination: nothing else is installed in the profile and the runner verified that no memory file sits above the staged copy.

| Budget row (spec §14) | Budget | Measured |
|---|---|---|
| `core/AGENTS.md` + `security-baseline.md` (memory files) | 2,300 + 300 | 1,900 |
| Skill descriptions in the listing | 1,700 | 750 |
| Agents | 300 | 0 (Phase 2) |
| Memory index | 200 | 0 (none yet) |
| **Total fixed** | **≤5,000** | **about 2,650** |

**Fixed-token gate item passed on Claude Code.** Host overhead outside the kit's budget in the same session: system prompt 3.4k, tool definitions 28.3k, built-in skills 2.75k, plus the 33k autocompact reserve.

## Baseline (daily profile, equivalence map)

**Run 1** (2026-09-10 20:31 local; `evals/results/2026-09-10-claude-baseline.md`, raw streams `*-baseline.raw.jsonl`): eighteen prompts, one English positive, one Vietnamese positive and one negative per intent; sonnet, six turns; the staged copy beside the repository; the daily profile as it is (Spartan commands, Superpowers 5.1.0, fullstack-dev-skills, residual ClaudeKit hooks, 71.9k of memory files per session). Scored with the equivalence map: 10/18; after crediting test-driven-development as a legitimate route for a small change (added to the map the same evening; recount by hand on the recorded `got` column): **11/18**. Positives routed **6/12**; false activations on pure questions **0/2**.

| intent | positives routed | what the raw streams show |
|---|---|---|
| question | (no positives) | both questions answered directly; the negative ("add a retry to the upload endpoint") explored, then invoked test-driven-development |
| small | 0/2 | English: edited the file at once (Grep, Read, Edit), no skill. Vietnamese: found the previous session's edit already in place and verified it |
| feature | 0/2 | both explored for six turns (Bash, Glob, Read) without invoking brainstorming |
| bug | 2/2 | systematic-debugging both times; the negative ("review the fix I just made") was reviewed by hand, no review skill |
| review | 2/2 | code-review both times |
| ship | 0/2 | ran git directly and committed locally without finishing-a-development-branch or pr-ready |

Readings. Where the previous setup carries a strong skill (systematic-debugging, code-review) it routes as well as the kit. Small changes get no skill by that setup's own decision rule ("small change, just ask Claude") and are edited immediately, while the kit routes them to `bk-build`: two designs, so the honest comparison for `small` is the outcome benchmark, not routing. Feature and ship show the two failure modes the kit's router sentence prevents: exploring for the whole turn budget without deciding, and running git directly without a finishing checklist.

Caveat, and the reason a run 2 is scheduled: the sessions shared the staged copy and the previous setup's sessions edited and committed files (the fourth session renamed the button, the ship session committed it), so prompts after the fourth saw a dirty tree, which may have influenced routing. The runner now resets the copy to the staging commit before every prompt and once after the run. Run 1 stays recorded; a clean run 2 goes in the next quota window. Cost: the five-hour window read 25% after the run, having reset at 19:40 with this conversation sharing it, so about 1.4 points per daily-profile session is an upper bound, against about 0.7 for the isolated profile.

_pending: run 2 with the per-prompt reset, next quota window_

## Confirmation run (isolated profile, final descriptions)

**Clean run** (2026-09-10 evening, tag `confirm`, `evals/results/2026-09-10-claude-confirm.md`): all sixty prompts, isolated profile, sonnet, six turns, staged copy beside the repository, fixture reset before every prompt. **57/60, 0 false activations**; per intent: question 9/10, small 10/10, feature 9/10, bug 9/10, review 10/10, ship 10/10. The three misses, each read from its raw stream:

| id | prompt | got | reading | action |
|---|---|---|---|---|
| q-neg-01 | Can you add a retry to the upload endpoint? | bk-spec (run 1 gave bk-build) | ambiguous under the three-file rule; the gate says unsure means COUNCIL, so bk-spec is also correct | label widened to `bk-build\|bk-spec` |
| feat-en-01 | Add CSV export to the invoices page. | bk-build, then it started writing files | a real misroute: "add" read as a small change; a feature built without a spec | `bk-build` now says "fits in at most three files … Not for: a capability the app lacks yet"; `bk-spec` cues "a capability the app lacks (export, login, notifications)"; 264 and 270 characters |
| bug-en-03 | Uploads over 5 MB silently disappear. | no skill, no tool, one turn | the prompt was read as part of the injected context: "your message only contains system context … and a note that uploads over 5 MB silently disappear" (a rerun with stdin from a file reproduced it, so delivery was not the cause) | the `[bearingkit]` block now closes with `[/bearingkit]`; `core/AGENTS.md` host notes say that everything outside the block is the request, even a single line stating a symptom (+184 characters); the runner marks such sessions `no-action` instead of scoring them "none" |

**Reruns after the two kit changes** (tags `confirm2`, `confirm3`, `confirm3b`): feature **10/10**, small **10/10** (regression check for the narrowed `bk-build`), bug **10/10**, and the two terse symptom prompts (bug-en-03, bug-vi-03) once more **2/2**; q-neg-01 passes under the widened label. Quota moved from 44% to 51% for these thirty-four sessions.

**Final activation status on Claude Code:** one clean sixty-prompt run at 57/60 with every miss diagnosed; after two kit changes found by that run, the affected intents at 10/10 on rerun; false activations on pure questions 0 in every run. Recall on the clean run before the fixes: 46/48 positives; the spec's ≥0.9 precision and recall (§17) are met by the clean run alone, and the per-intent 10/10 (§15) by the reruns. The 1.9k memory reading predates the 184-character host-notes sentence; the next `/context` will include it.

# Phase 1 gate · Antigravity

Host: Antigravity on the same workstation (the installed version number is still to be read from the app), global config `~/.gemini/config` as the owner uses it daily (three bundled plugins, one owner rule); the kit installed on 2026-09-10 evening with `install --dev C:\Projects\Bearingkit --antigravity-only` after the owner's approval.

## Mechanism, corrected before installing

The spec had the plugin registered through a `plugins.json` registry with `entries.path`. The global config had no such file, and the docs embedded in the language server (read the same evening) say a plugin is a subdirectory of `<config>/plugins/` with `plugin.json`, optional `skills/<name>/SKILL.md`, `rules/AGENTS.md`, `hooks.json` and `mcp_config.json`, discovered automatically and enabled by default; `config.json` holds only user toggles; `plugins.json` registers non-standard locations. The installer now creates one junction, `~/.gemini/config/plugins/bearingkit → <kit>/adapters/antigravity`, and writes nothing else outside the repository; `uninstall` removes that junction. Two more corrections from the same docs: `hooks.json` needs a named-hook wrapper (the template lacked it), and the payload's working directory is `workspacePaths[0]`, not `workspaceRoot`.

## Install report

`= nothing to back up` · generated `adapters/antigravity/rules/AGENTS.md` and `hooks.json` · junction `adapters/antigravity/skills → core/skills` · junction `~/.gemini/config/plugins/bearingkit → adapters/antigravity`. Verified on disk: the eleven skill folders are reachable through the junction chain; `hooks.json` carries the `bearingkit` named hook with one `PreInvocation` handler. Later the same evening the junction was replaced by a real directory (`install --antigravity-copy`, marker file `.bearingkit-copy`) to take the junction question out of the first reading; whether the scanner follows junctions is still to be tested separately.

## Two products, two panels (2026-09-10 night)

The owner's workstation runs both **Antigravity IDE** and **Antigravity 2.0** (the agent manager). Findings from their Customizations panels, with the same `~/.gemini/config/plugins/bearingkit` on disk:

- IDE, first two readings (plugin as a junction, one restart in between): the panel listed two built-in skills (from `~/.gemini/antigravity-ide/builtin/skills/`) and one rule `user_global` (`~/.gemini/GEMINI.md`, 368 tokens), nothing from the plugin, not even the valid `bk-protocol`. Google's `securecoder` plugin under `~/.gemini/antigravity-ide/plugins/` and the bundled `modern-web-guidance-plugin` did not show either; the owner's rule file under `~/.gemini/config/rules/` (no frontmatter) did not appear. Third reading, after the plugin became a copied directory and the descriptions were quoted: the IDE lists **all eleven `bk-*` skills** with the `Plugin: bearingkit` tag. Two things changed between readings, so whether the junction alone was the cause is not yet isolated; it is tested separately at the end of Task 13 (junction back, restart, read the panel).
- 2.0: the panel lists plugin skills with a **`Plugin: bearingkit`** tag, so the global `config/plugins/` root is read by 2.0. Rules read 2,241 tokens across two rules: `user_global` 368 and the kit's `rules/AGENTS.md` (protocol plus baseline) **1,873 tokens**, read directly from the panel's breakdown, in line with the 1.9k memory reading on Claude Code. Only `bk-protocol` appeared among the skills: the other ten carry `: ` inside an unquoted `description`, which a strict YAML parser rejects; Claude Code's parser had tolerated it. Fixed the same night by quoting every such value; `tests/skills.test.cjs` now fails on a bare value with `: `, an unknown key, a name that differs from the folder, or a description over 300 characters. The kit's target host in spec §3 is 2.0; the IDE is recorded as a second surface to verify by chat.

## Compatibility tests

| # | Question | Method | Answer | Verdict |
|---|---|---|---|---|
| 7 | Conversation id, working directory and event identification in hook payloads | documented common fields, then a logging hook (keys and types only) on PreInvocation, PostInvocation and PostToolUse | Real PreInvocation and PostInvocation payloads (IDE, 2026-09-10 23:55) carry exactly `artifactDirectoryPath`, `conversationId`, `initialNumSteps`, `invocationNum`, `modelName`, `transcriptPath`, `workspacePaths[1]`; no event name, so the registration passes `--event PreInvocation` and `host.cjs` infers from the shape as a fallback. The kit's own hook ran end to end: state file `antigravity-<conversationId>.json` with branch, stack hash and the injection hash | **PASS** |
| hooks | Plugin `hooks.json` handlers run, and how the command is executed | language server log | Handlers fire on the IDE (`jsonhook__bearingkit_PreInvocation_0_0` in the log at 23:39). The host does not run the command through `cmd /c` as its docs say: it tokenises the string itself and resolves path-like tokens against the `hooks.json` directory, keeping quotes literally, so `node "C:/…/stack-profile.cjs"` failed with `Cannot find module <plugin dir>\"C:/…"`. Fixed with a relative, unquoted command (`node hooks/stack-profile.cjs --event PreInvocation`) and a generated launcher inside the plugin that carries the kit path as a string; no failures in the log after the fix | **PASS** after the fix |
| tokens | Kit cost on Antigravity, from the IDE panel with the plugin loaded | Token Usage breakdown | Rules: `rules/AGENTS.md` 1,873 beside `user_global` 368. Skills: the ten task skills 1,045 together (`bk-ship` 124, `bk-spec` 121, `bk-build` 117, `bk-review` 112, `bk-audit` 101, `bk-close` 96, `bk-next` 95, `bk-test` 94, `bk-plan` 93, `bk-debug` 92); `bk-protocol` is listed among the skills but absent from the token breakdown. Kit total about **2,920** of a customization budget the panel reports as 20k (2,241 shown as 11.2%) | measured |
| 2 | Which key names the file pattern of a `trigger: glob` rule | temporary `rules/probe-glob.md` in the plugin carries both `glob:` and `globs:`; with `src/app/login/page.tsx` open in the IDE the Token Usage rules breakdown lists only `AGENTS.md` and `user_global`; the plugin rules do not appear in the panel's Rules list at all, so the panel cannot answer this; the log shows no rule error | not decided by the panel; decided by a chat that reads a `.tsx` file and asks "probe status" (expects `GLOB-PROBE-OK`) | pending |
| 4 | Can the installer write a deny for `.env` reads | `userSettings.globalPermissionGrants` holds `allow` entries such as `command(git)`; the proto has `deny` and `ask` too; the grammar for file access is not in the embedded docs | deny exists; file-access grammar unverified; the installer does not write `config.json` | manual step until verified |
| 1, 3 | Skills discovered from the plugin directory; `SKILL.md` format accepted | Customizations panel after the YAML fix, on both products: the eleven `bk-*` skills listed with the tag `Plugin: bearingkit`, descriptions rendered in full including the Vietnamese cues, tooltip path `~/.gemini/config/plugins/bearingkit/skills/<name>/SKILL.md` (copied directory; the junction variant is still to be tested separately) | eleven of eleven, 2.0 and IDE | **PASS** on both |
| 6 | `bk-protocol` on Antigravity | no hidden flag exists; it is listed like the others | listed, description says "Not for direct use" | as designed; whether the model leaves it alone is read from the checklist |
| rules | Plugin `rules/AGENTS.md` loaded and measured | 2.0 panel, Rules breakdown | `…/plugins/bearingkit/rules/AGENTS.md` **1,873 tokens** beside the owner's `user_global` 368 | **PASS**, measured |

## Activation, automated on Antigravity 2.0

Method: `evals --host antigravity --arm` queues prompts behind a PreInvocation driver hook in the live plugin; a DevTools-driven script opens one conversation per prompt in the eval project (`bearingkit-eval-sample-app`, a project file that points at the staged fixture), types a hold phrase ("Reply with OK and wait for my next message."), and the driver resets the fixture to its staging tag and injects the real prompt as the next user turn; `--score` reads each transcript from the injected prompt onward and takes the first `view_file` of a `skills/<name>/SKILL.md` as the activation. Model: Claude Opus 4.6 (thinking), the owner's default in 2.0. Every conversation carried the kit's `[bearingkit]` block.

**Run 1** (2026-09-11, tag `ide-spread`, 18 prompts, one English positive, one Vietnamese positive, one negative per intent): **16/19 by the strict scorer** (19 with the glob probe), false activations 1.

| intent | positives routed | reading |
|---|---|---|
| question | (both answered directly) | negative "add a retry" opened `bk-build`, accepted |
| small | 0/2 | both edited the settings page directly after grep and view, without opening `bk-build`; the negative "add a new export format" opened `bk-spec` |
| feature | 2/2 | `bk-spec`; the negative "explain the notification center" answered directly |
| bug | 2/2 | `bk-debug`; the negative "review the fix" opened `bk-review` |
| review | 2/2 | `bk-review`; the negative "explain the review process" answered directly |
| ship | 2/2 | `bk-ship`; the negative "explain how bk-ship works" opened `bk-ship` and explained it without acting, which the scorer counts and this reading accepts: on this host, reading a skill is the only way to explain it |

Reading: where the router names a skill for a real task, 2.0 opens it 8/8 across feature, bug, review and ship. The gap is the small change: with no skill tool on this host, "invoke the skill" was not read as "open its file" for a one-line rename. Fix applied the same morning: the generated `rules/AGENTS.md` gains an "Antigravity" section saying that invoking a skill means opening `skills/<name>/SKILL.md` first, small changes included, and that reading a skill to explain it is not an invocation; `host-tools.md` gains the row. Rerun of the four affected prompts follows below.

Test 2 (glob rule): the probe conversation read `src/app/login/page.tsx` and answered `GLOB-PROBE-OK`, so a `trigger: glob` rule in the plugin loads when the agent reads a matching file (both key spellings were present; isolation of the key name follows below).
