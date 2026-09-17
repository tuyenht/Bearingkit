---
name: bk-setup
description: "Make a project ready for AI agents on every host the owner uses: one instruction source, the facts agents cannot infer, guardrails wired where the host allows. Use when: set up this repo for agents, onboard a project, chuẩn bị repo cho agent. Not for: the kit's own install, run bearingkit doctor."
---

# bk-setup

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say). Its `guardrails`, `hotPathGlobs` and `notes` are the facts this skill compares the project against.
- Every instruction file that a host the owner uses would read, named in `bk-protocol/references/host-tools.md`, plus the project's README.
- The output of `bearingkit doctor` if the owner has run it. Whether the kit itself is installed and current is doctor's question, not this skill's.

## Steps
1. One source for every host. List the instruction file each host reads and whether they import one source or are separate copies. Copies that say different things are a finding; the stack profile decides which of two conflicting commands is right, and the owner decides when it cannot.
2. Facts an agent cannot infer. Compare the instruction files with the profile: the guardrail commands the files declare against the profile's `guardrails`, the hot paths against `hotPathGlobs` plus the project's own, the do-not list, where specs, plans and handoffs live, and the language the owner writes in. Each gap becomes the exact line to add, with its evidence.
3. Conflicts with the protocol. A line telling agents to skip tests, push without asking, or print secrets is reported, not rewritten: the project's own facts outrank the kit, so the owner decides.
4. Guardrails on edit. Where the host has an after-edit event (`host-tools.md`), write the exact snippet that runs the profile's format or lint command there, and say how a failing check reaches the agent on that host. Where the host has no such event, the guardrail lives in the instruction file and bk-ship runs it. A command that touches state or the network is never proposed; the profile's `notes` name the ones that need preparing first.
5. Documentation lookup. Only when the profile shows framework majors newer than what the model knows: give the owner the documentation-lookup line of `bk-protocol/references/host-tools.md` for that host, as a command to run. No other tool, server or plugin is recommended; the kit keeps no catalog of them.
6. Report at most two recommendations per group (instruction files, facts, guardrails, lookup), most useful first. Each carries its evidence (`file:line` or a profile field), the exact change, and its gate.

## Gates
- Lines added to the project's own instruction files follow the protocol's gate (documentation is ACT), and every added line carries the evidence behind it: a wrong line there misleads every later session.
- Hook wiring, whether in the project or in a user profile, and anything under a host's user-level directory are proposed as exact snippets or commands and applied only after the owner approves. A hook runs on every edit of every session; that is not a documentation change.
- Nothing is installed: no plugin, no server, no package.
- A mechanism that `host-tools.md` marks unverified stays marked unverified in the recommendation.

## Evidence to paste
- The profile fields used, the instruction files read with their paths, and for each recommendation its evidence, the exact change and its gate.

## Next step
- bk-build to apply the approved lines; bk-ship to run the guardrails the files now declare; `bearingkit doctor` when the question is the kit's own install.

Sources: no upstream text vendored - ideas only from anthropics/claude-plugins-official (Apache-2.0), its claude-code-setup plugin: recommend from codebase indicators, stay read-only until approved, at most two recommendations per group.
