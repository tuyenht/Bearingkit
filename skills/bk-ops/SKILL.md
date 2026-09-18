---
name: bk-ops
description: "Deploy and change infrastructure with a way back; investigate incidents from alert to code, read-only first. Use when: deploy, staging, production, terraform, infra, alert, outage, incident; đưa lên production, sự cố, cảnh báo, hạ tầng. Not for: commit, push or PR, use bk-ship."
---

# bk-ops

## Read first
- The project's instruction files and runbooks: where it deploys, which environments exist, what counts as production, and its own deploy procedure, which wins over this skill.
- The stack profile (run `detect-stack` as bk-protocol's host notes say): its guardrails and its environment-parity notes.
- `references/change.md` before a deploy, an infrastructure apply, a configuration or secret change, or a move between platforms; `references/incident.md` before investigating an alert, an outage or a cost spike.

## Steps
Name the path first. A deploy request or `--deploy` takes the change path; an alert, an outage or `--incident` takes the incident path.

**Change**
1. Name the target: account or project, environment, region, resource, and whether each command acts locally or on the remote system. A command whose target cannot be named is not run.
2. Read the current state, read-only: the plan or diff of what would change, the variables each environment sets (names, never values), and whether the live system has drifted from the repository.
3. Write the way back before the change: the rollback command, what it restores and what it does not (code, not data or connected resources), and the check that proves it worked. A change with no way back says so.
4. Propose the change as COUNCIL: the target, what the plan creates, updates, replaces and destroys (every replace and destroy named with its reason), the rollback, the checks after, and the thresholds that decide advance, hold or roll back.
5. After approval, apply exactly what was read (the saved plan, the built artifact), run the checks, and read the thresholds before calling it done.

**Incident**
1. Stay read-only. Read the alert and its window, then every change inside that window: deploys, configuration, traffic, pricing, dependencies.
2. Classify before fixing: a regression from a change, real traffic, a crawler or abuse, a failing dependency, exhausted capacity. Test one hypothesis at a time against what the systems already recorded.
3. Keep the evidence (queries, timestamps, log lines without secrets) before anything restarts or redeploys.
4. Propose the way out as COUNCIL: roll the change back, or fix forward through bk-debug; say which is safer and why.
5. When service is back, record the timeline, the cause, what alerted and what did not, and add the missing alert or runbook line.

## Gates
- Read-only until the owner approves. Deploys, applies, restarts, scaling, secret writes, DNS changes and state surgery are COUNCIL, as the protocol classes every remote or production system.
- A secret never passes through chat, command arguments, logs or diffs; it moves between the secret store and the environment. A secret change is a deployment.
- An apply runs the plan that was read, never a fresh one and never with auto-approve. Replacing a resource that holds data is never the fix for drift.
- Nothing restarts, redeploys or rolls back while the cause is unread, unless the owner orders it to stop the damage; the evidence is taken first either way.
- Numbers after a change are read against a baseline stated before it; "looks fine" is not a threshold.

## Evidence to paste
- Change: the target, the plan summary with every replace and destroy, the rollback and its check, and the checks after against their thresholds.
- Incident: the window, the changes inside it, the hypotheses with the evidence for and against each, and the proposed way out.

## Next step
- bk-debug when the cause is in the code, then bk-build and bk-ship for the fix; bk-close records the change or the incident in the handoff.

Sources: no upstream text vendored - ideas only from c0x12c/ai-toolkit (no license), tuyenht/Antigravity-Core (owner-authored), jeffallan/claude-skills (MIT, reference), cloudflare/skills (Apache-2.0, reference), addyosmani/agent-skills (MIT, ideas-only), mattpocock/skills (MIT), vercel-labs/agent-skills (no license), claudekit/claudekit-engineer (proprietary, clean-room); field lessons L2, L10 and L12 (v1 §18).
