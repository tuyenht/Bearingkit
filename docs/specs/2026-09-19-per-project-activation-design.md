# Per-project activation · design · 2026-09-19

Status: PROPOSED, waiting on the owner (COUNCIL: a design change, and it touches v2 §9). Nothing below is built. Sources for every host behaviour: `docs/compat/2026-09-19-per-project-activation.md` (rows C1–C9, A1–A10).

## The requirement

D5 question 29, owner, 2026-09-19: "Theo tôi cài global nhưng sẽ cần phải kích hoạt riêng cho từng dự án, dự án nào được kích hoạt thì mới dùng chứ không phải dự án nào cũng dùng." Install once for the machine; the kit acts only in projects activated for it; everywhere else it is absent: no bootstrap, no skill in the listing, no hook.

Today: on Claude Code the kit is not installed in the daily profile (evals load it with `--plugin-dir`); on Antigravity the copy under `~/.gemini/config/plugins/bearingkit` was global, reached every workspace and the IDE (the owner saw `bk-debug` open in one of their projects), and was removed on 2026-09-19; it is installed only for a measurement.

## What the hosts allow

- **Claude Code** switches a plugin on per project natively: `enabledPlugins` holds one Boolean per `plugin@marketplace` in any settings file, a project or local entry beats the user entry, and a plugin with no entry anywhere follows its `defaultEnabled` (C3–C5). The payload is cached once per user (C2). A plugin that is off does not load (C7, inferred).
- **Antigravity** has no per-project switch: everything under `~/.gemini/config/plugins/` is discovered for every workspace, a discovered plugin loads whole, and its skill names and descriptions go into every conversation even when its rules do not load (A1–A4). The one documented per-project handle is a workspace `.agents/plugins.json` that registers a plugin kept outside the discovered roots, by absolute or `~` path, ranked above global discovery (A5, A6).

## Proposal

**Claude Code.** (1) The manifest gains `"defaultEnabled": false`, so a user-scope install (the CLI's default scope) switches nothing on anywhere. (2) Install for the machine as `docs/hosts.md` says today (`claude plugin marketplace add …`, `claude plugin install bearingkit@bearingkit`). (3) Activate a project with an entry `"bearingkit@bearingkit": true` in that project's `.claude/settings.local.json`, written by the host's own command (which one, `install --scope local` or `enable`, is probe CC-1); the host keeps that file out of git (C6). A team project that wants the kit for everyone uses `--scope project` instead, the owner's call per project. Deactivate: `false`, or remove the entry.

**Antigravity.** (1) `bearingkit antigravity install` writes the copy to `~/.bearingkit/antigravity/plugins/bearingkit/`, outside every discovered root, so installing no longer writes under `~/.gemini` and reaches no workspace. (2) `bearingkit antigravity activate [<project>]` adds one entry for that folder to the project's `.agents/plugins.json` (creating or merging the file); `deactivate` removes the entry and the file if it becomes empty. The kit touches nothing else in the project and nothing in its git settings: the owner commits the file or not. (3) The rule inside the plugin stays `always_on`; it now applies only where the plugin is declared. (4) `install` removes a copy left under `~/.gemini/config/plugins/bearingkit` when it carries the kit's marker, so the old global install cannot linger beside the new one.

**Both.** `doctor` stays read-only and reports, for the current directory, whether each host has the kit installed and whether this project is activated; when the Antigravity copy is absent it no longer prints `antigravity install` as the one fix (status §7, open thread of 2026-09-19). The eval harness: Claude Code runs keep `--plugin-dir` (probe CC-3); the Antigravity stage commits its `.agents/plugins.json` in the stage's first commit, so every reset keeps it activated.

**v2 §9 amendment (proposed; decision 1 below, not yet taken).** "Writes nothing into a project except work products" would gain one exception: the activation entry, written only when the owner asks for that project, in the host's own configuration file (`.claude/settings.local.json`, or `.agents/plugins.json`). No kit-specific file ever lands in a project.

## Rejected

- A session hook that checks a list of activated folders (`~/.bearingkit/projects.json`) and stays silent elsewhere: the bootstrap would leave other projects, the skills would not (C7, A3), and a listed skill is what opened `bk-debug` in the owner's project.
- Antigravity rule trigger `manual` or `model_decision` in a global plugin: same gap, the skill listing still reaches every conversation (A3).
- The `config.json` switch or `"disabled": true`: one switch for every workspace (A4).
- A copy of the plugin in each project's `.agents/plugins/`: one install per project, each copy drifting at every update, against "install once".
- Keeping the global `always_on` install: the state the owner rejected on 2026-09-19.

## Probes before building (each needs its approval where noted)

| # | Question | Where | Passes when |
|---|---|---|---|
| CC-1 | Which command writes `true` into `.claude/settings.local.json` for a `defaultEnabled: false` plugin, and does `install --scope user` write any entry | isolated profile under `_build/`, a scratch project outside any git repository (so no global git exclude is written) | an activated scratch project lists the kit's skills and gets the bootstrap; a second one lists none |
| CC-2 | Does a disabled plugin leave its SessionStart hook, skills and agents out | same | the second project's first-turn input carries no protocol and no `bk-*` skill |
| CC-3 | Does `--plugin-dir` load the kit although `defaultEnabled` is false | same | an eval run lists the kit's skills |
| AG-1 | Does `.agents/plugins.json` in one workspace load a plugin kept under `~/.bearingkit/antigravity/`, and a workspace without it not | the app with port 1405 (owner's approval), the eval stage and a second scratch folder outside `C:\Projects` | the first lists `bk-*` skills and applies the rule; the second shows neither |
| AG-2 | Does the entry name the plugin folder or a folder of plugins; does `~` expand on Windows | same | the form that loads is recorded in `docs/compat/` |
| AG-3 | Does a declared plugin's `hooks.json` run | same, with the eval driver armed | the driver injects a queued prompt |
| AG-4 | Does the IDE honour the workspace file as 2.0 does | the IDE, one scratch folder | same result as AG-1 |

A failing AG-1 sends the Antigravity half back to the owner before any code: the remaining choices are a per-project copy (rejected above) or accepting global skill listing.

## Build order, after approval

1. Probes CC-1–CC-3 (ACT: isolated profile inside the repository) and AG-1–AG-4 (in an approved Antigravity run); results into `docs/compat/`.
2. Tests first: `antigravity install` writes only under `~/.bearingkit/antigravity/`; `activate` and `deactivate` create, merge and remove exactly one entry and nothing else; `doctor` keeps its no-write invariant and reports activation; the manifest carries `defaultEnabled: false`.
3. Code, then `docs/hosts.md`, `README.md`, the migration plan (`docs/plans/2026-09-10-owner-migration.md`, phase 2 activates projects one by one), and the eval stage.
4. Acceptance on both hosts in an activated project, plus one conversation in a non-activated project showing no kit.

## Decisions for the owner

1. Direction as proposed: host-native activation, `defaultEnabled: false` on Claude Code, the Antigravity payload outside `~/.gemini`, and the v2 §9 exception.
2. The Antigravity file `.agents/plugins.json`: the kit writes it and leaves git alone (proposed), or the kit also adds it to the project's `.git/info/exclude`.
3. Approval for the probe run on Antigravity (AG-1–AG-4), which writes one `.agents/plugins.json` into the eval stage and one scratch folder, and a copy under `~/.bearingkit/antigravity/`.
