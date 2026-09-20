# Plan · per-project activation, build · 2026-09-20

Status: PLANNED, decisions taken under the owner's delegation of 2026-09-20 (verbatim in `docs/handoff/2026-09-19.md`, lời 5: "Xử lý làm sao để cài đặt cấu hình/ kích hoạt trên Antigravity, Claude đơn giản để dùng; cấu trúc cài đặt đẹp, chuẩn tốt nhất cho tôi nhé. Giúp tôi xử lý các vấn đề còn lại trước "bk-research" tự động, tốt ưu và tốt nhất có thể."). Design and sources: `docs/specs/2026-09-19-per-project-activation-design.md`, `docs/compat/2026-09-19-per-project-activation.md`. Not built yet; this plan is what a session executes, test first, reviewed before commit.

## What the owner types, in full

```
npx bearingkit install                 # once per machine, and after every kit update
cd <project> && npx bearingkit activate    # this project uses the kit
cd <project> && npx bearingkit deactivate  # it stops
npx bearingkit status                  # what is installed, and whether this project is on
```

`install` refreshes one central store and touches no project. `activate` writes one line of host configuration per host it finds, in the host's own file, and nothing else. Every command takes `--dry-run` and prints exactly what it changed.

## Layout

```
~/.bearingkit/                          the kit's own home (already holds state/ and the eval queue)
└─ antigravity/plugins/bearingkit/      the central store: one build for every project, both products
<project>/.agents/plugins.json          Antigravity: one entry pointing at the store
<project>/.claude/settings.local.json   Claude Code: enabledPlugins { "bearingkit@bearingkit": true }
```

## Decisions taken (reopen any of them with one word)

1. **Store location** `~/.bearingkit/antigravity/plugins/bearingkit`, with `--dest` for another path (the owner's `~/.gemini/shared-plugins/bearingkit` works the same way). Why the kit's own home: a session may refresh it without an approval for every update, and it sits outside every folder Antigravity scans, which matters on a host that auto-updates weekly. The `plugins/` level lets one entry name either the store or the plugin, whichever the probe shows the host wants.
2. **v2 §9 gains one exception**: activation writes into a project, but only the host's own configuration file, only for the project the owner names, and `deactivate` removes exactly what it wrote. No kit-specific file ever lands in a project.
3. **Git**: `activate` adds the two paths to `.git/info/exclude` when the repository does not already ignore them (local to the clone, never committed, removed by `deactivate`); `--no-git-exclude` skips it. This replaces the earlier "leave git alone" recommendation: the owner asked for the simple path, and an untracked file appearing in every activated repository is not that.
4. **Claude Code**: the manifest gains `"defaultEnabled": false`, so an install at user scope switches the kit on nowhere; `activate` writes the `enabledPlugins` entry itself and the kit never runs `claude plugin …` (those write under `~/.claude`, which is the owner's to run). `install` prints the two commands for the first time on a machine.
5. **Antigravity** keeps the always-on rule inside the store: it now reaches only the projects that declare it.
6. **Probes gate the release**, not the design: AG-1, AG-2, AG-4 (2.0 and the IDE) and CC-1, CC-2, CC-3 of the spec run before `activate` is documented as working; they need one approved Antigravity run.

## Steps

1. **Probes.** CC-1–CC-3 in the isolated profile under `_build/` (ACT). AG-1, AG-2, AG-4 in an approved Antigravity run, on the eval stage and one scratch folder outside `C:\Projects`. Record both in `docs/compat/2026-09-19-per-project-activation.md`. A failing AG-1 stops the Antigravity half and goes back to the owner.
2. **Store**: `scripts/antigravity.cjs` installs into the store path instead of `~/.gemini/config/plugins/bearingkit`, keeps its marker file, and removes an old global copy when it carries that marker. Tests: it writes only under the store; it refuses a destination it did not create; the old copy is gone after one run.
3. **`activate` / `deactivate`** in `scripts/activate.cjs`, one function per host, pure where it can be: merge into an existing `.agents/plugins.json` or `.claude/settings.local.json` without touching other keys, create them when absent, remove only the kit's entry, drop a file that becomes empty, and handle the git exclude. Tests first, including: an existing file with other content survives; `deactivate` restores the file byte for byte; a project that is not a git repository still activates.
4. **`status`**, and `doctor` alongside it: store present and matching the checkout, this project's activation state per host, and no write (the existing no-write test extends to the new paths).
5. **Docs**: `docs/hosts.md` (both hosts, the four commands), `README.md`, `docs/plans/2026-09-10-owner-migration.md` phase 2 (activate the daily projects one by one), `CHANGELOG.md`, and the eval stage (its `.agents/plugins.json` is committed in the stage's first commit so a reset keeps it).
6. **Acceptance** on both hosts in an activated project, and one conversation in a project that is not activated showing no kit at all: that second reading is the point of the whole change.

## The rest of the queue before `bk-research`

- **Rescore the older Antigravity runs** (status §7 (ii)): read-only, from the drive logs of 2026-09-11 and 2026-09-17, with `_build/harness-neutral/rescore-drive-log.cjs`; needs the owner's yes because it reads transcripts under `~/.gemini`. If many `none` prompts read the harness, rerun the activation set on the neutral stage in the same approved run and correct §2 item 6 and §5 row 2.
- **Boundary prompt** "I just inherited this repo, get it ready for agents to work in" (`bk-map|bk-setup`) into `evals/activation/boundaries.jsonl`, measured on Claude Code before the commit and on Antigravity in the approved run. The second candidate stays out: it needs label `bk-map|none`, which the file's own rule forbids (D5 question 28).
- **`doctor`** stops printing `antigravity install` as the one fix when the store is absent (step 4 covers it).
- Then `bk-research`, after the seven-day window resets on 23/09 10:00.
