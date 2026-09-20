# Per-project activation · design · 2026-09-19

Status: PROPOSED, waiting on the owner (COUNCIL: a design change, and it touches v2 §9). Nothing below is built. Sources for every host behaviour: `docs/compat/2026-09-19-per-project-activation.md` (rows C1–C9, A1–A10).

## The requirement

D5 question 29, owner, 2026-09-19: "Theo tôi cài global nhưng sẽ cần phải kích hoạt riêng cho từng dự án, dự án nào được kích hoạt thì mới dùng chứ không phải dự án nào cũng dùng." Install once for the machine; the kit acts only in projects activated for it; everywhere else it is absent: no bootstrap, no skill in the listing, no hook.

Today: on Claude Code the kit is not installed in the daily profile (evals load it with `--plugin-dir`); on Antigravity the copy under `~/.gemini/config/plugins/bearingkit` was global, reached every workspace and the IDE (the owner saw `bk-debug` open in one of their projects), and was removed on 2026-09-19; it is installed only for a measurement.

## What the hosts allow

- **Claude Code** switches a plugin on per project natively: `enabledPlugins` holds one Boolean per `plugin@marketplace` in any settings file, a project or local entry beats the user entry, and a plugin with no entry anywhere follows its `defaultEnabled` (C3–C5). The payload is cached once per user (C2). A plugin that is off does not load (C7, inferred).
- **Antigravity** has no per-project switch: everything under `~/.gemini/config/plugins/` is discovered for every workspace, a discovered plugin loads whole, and its skill names and descriptions go into every conversation even when its rules do not load (A1–A4). The one documented per-project handle is a workspace `.agents/plugins.json` that registers a plugin kept outside the discovered roots, by absolute or `~` path, ranked above global discovery (A5, A6).

## Owner's proposal for Antigravity (2026-09-19, about 23:50)

Verbatim: "Thiết kế giải pháp tối ưu cho Antigravity IDE và Antigravity 2.0 tránh bị load mặc định toàn bộ các project: Central Store + `.agents/plugins.json` (Khuyên dùng ⭐) Thay vì sao chép toàn bộ source code vào từng project, giải pháp "chuẩn công nghiệp" và gọn gàng nhất là: 1. Lưu 1 bản build duy nhất tại `~/.gemini/shared-plugins/bearingkit` (Central Store). 2. Kích hoạt cho project nào thì chỉ ghi 1 file `.agents/plugins.json` tại project đó. 3. Khi cập nhật Bearingkit, chỉ cần update tại Central Store một lần, tất cả project trên cả Antigravity 2.0 và IDE đều tự động nhận bản mới ngay lập tức, không tốn dung lượng ổ đĩa."

It is the Antigravity half below: one copy outside every discovered root, one `.agents/plugins.json` entry per activated project, an update applied once for every project (in new conversations; a conversation already open keeps what it loaded, unverified). Whether a workspace `plugins.json` reaches a folder outside the workspace, on 2.0 and on the IDE, is still what probes AG-1, AG-2 and AG-4 establish. One difference is open, **the store's location**:

| | `~/.gemini/shared-plugins/bearingkit` (owner's text) | `~/.bearingkit/antigravity/plugins/bearingkit` (this spec) |
|---|---|---|
| Found by Antigravity on its own | no documented root there today; a future auto-updated version could scan more of `~/.gemini` | outside every Antigravity folder |
| Each install or update by a session | a write under `~/.gemini`: needs the owner's yes every time (AGENTS.md) | the kit's own folder, like its state and eval queue: no approval per update |
| One place for everything Antigravity | yes | no, the payload sits apart from `~/.gemini` |
| Room for other shared plugins | yes, if the entry names the folder of plugins (probe AG-2); then every plugin in it loads in every activated project | only the kit |

Recommendation: the kit's own folder, for the approval flow and to stay clear of whatever Antigravity scans next; the owner's location works under the same mechanism if the owner prefers one place.

## Proposal

**Claude Code.** (1) The manifest gains `"defaultEnabled": false`, so a user-scope install (the CLI's default scope) switches nothing on anywhere. (2) Install for the machine as `docs/hosts.md` says today (`claude plugin marketplace add …`, `claude plugin install bearingkit@bearingkit`). (3) Activate a project with an entry `"bearingkit@bearingkit": true` in that project's `.claude/settings.local.json`, written by the host's own command (which one, `install --scope local` or `enable`, is probe CC-1); the host keeps that file out of git (C6). A team project that wants the kit for everyone uses `--scope project` instead, the owner's call per project. Deactivate: `false`, or remove the entry.

**Antigravity.** (1) `bearingkit antigravity install` writes the copy to `~/.bearingkit/antigravity/plugins/bearingkit/`, outside every discovered root, so installing adds nothing under `~/.gemini` (its one touch there is step 4, removing the old global copy once) and reaches no workspace. (2) `bearingkit antigravity activate [<project>]` adds one entry for that folder to the project's `.agents/plugins.json` (creating or merging the file); `deactivate` removes the entry and the file if it becomes empty. The kit touches nothing else in the project and nothing in its git settings: the owner commits the file or not. (3) The rule inside the plugin stays `always_on`; it now applies only where the plugin is declared. (4) `install` removes a copy left under `~/.gemini/config/plugins/bearingkit` when it carries the kit's marker, so the old global install cannot linger beside the new one.

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
| CC-1 | Which command writes `true` into `.claude/settings.local.json` for a `defaultEnabled: false` plugin, and does `install --scope user` write any entry | isolated profile under `_build/`, a scratch project outside any git repository (so no global git exclude is written) | **done 2026-09-20**: install at user scope writes `false`, the plugin is switched on nowhere; `bearingkit activate` writes the project's `true` |
| CC-2 | Does a disabled plugin leave its SessionStart hook, skills and agents out | same | **done**: activated project 33 skills, 15 the kit's, bootstrap present; the other 18 and 0; after `deactivate`, 18 and 0 |
| CC-3 | Does `--plugin-dir` load the kit although `defaultEnabled` is false | same | **done, and it did not**: 0 kit skills until the profile enables `bearingkit@inline`; the runner now stops rather than measure an empty kit |
| AG-1 | Does `.agents/plugins.json` in one workspace load a plugin kept under `~/.bearingkit/antigravity/`, and a workspace without it not | the app with port 1405 (owner's approval), the eval stage and a second scratch folder outside `C:\Projects` | the first lists `bk-*` skills and applies the rule; the second shows neither |
| AG-2 | Does the entry name the plugin folder or a folder of plugins; does `~` expand on Windows | same | the form that loads is recorded in `docs/compat/` |
| AG-3 | Does a declared plugin's `hooks.json` run | same, with the eval driver armed | the driver injects a queued prompt |
| AG-4 | Does the IDE honour the workspace file as 2.0 does | the IDE, one scratch folder | same result as AG-1 |
| AG-5 | May the declared path be the checkout itself, or a junction to it, so that `git pull` alone updates every activated project | same as AG-1, with an entry naming the checkout | the kit's skills load from the checkout; if they do, `update` needs no copy step for that install |

A failing AG-1 sends the Antigravity half back to the owner before any code: the remaining choices are a per-project copy (rejected above) or accepting global skill listing.

## Build order, after approval

1. Probes CC-1–CC-3 (ACT: isolated profile inside the repository) and AG-1–AG-4 (in an approved Antigravity run); results into `docs/compat/`.
2. Tests first: `antigravity install` writes only under `~/.bearingkit/antigravity/`; `activate` and `deactivate` create, merge and remove exactly one entry and nothing else; `doctor` keeps its no-write invariant and reports activation; the manifest carries `defaultEnabled: false`.
3. Code, then `docs/hosts.md`, `README.md`, the migration plan (`docs/plans/2026-09-10-owner-migration.md`, phase 2 activates projects one by one), and the eval stage.
4. Acceptance on both hosts in an activated project, plus one conversation in a non-activated project showing no kit.

## Decided 2026-09-20 under the owner's delegation

The owner's words: "Xử lý làm sao để cài đặt cấu hình/ kích hoạt trên Antigravity, Claude đơn giản để dùng; cấu trúc cài đặt đẹp, chuẩn tốt nhất cho tôi nhé. Giúp tôi xử lý các vấn đề còn lại trước "bk-research" tự động, tốt ưu và tốt nhất có thể." The three questions below are answered in `docs/plans/2026-09-20-activation-build.md`: the store lives in the kit's own home (`--dest` for the owner's `~/.gemini/shared-plugins/bearingkit`), the v2 §9 exception is taken, `activate` also adds the two paths to `.git/info/exclude` unless told not to, and the probes stay a precondition to shipping — the Antigravity ones still need an approved run of the app. Any of these reopens with one word.

## Decisions for the owner (as written before the delegation)

1. Direction as proposed: host-native activation, `defaultEnabled: false` on Claude Code, and the v2 §9 exception. For Antigravity the owner's proposal of 2026-09-19 night already chose the central store and `.agents/plugins.json`; left open is the store's location (table above).
2. The Antigravity file `.agents/plugins.json`: the kit writes it and leaves git alone (proposed), or the kit also adds it to the project's `.git/info/exclude`.
3. Approval for the probe run on Antigravity (AG-1–AG-4), which writes one `.agents/plugins.json` into the eval stage and one scratch folder, and a copy under `~/.bearingkit/antigravity/`.
