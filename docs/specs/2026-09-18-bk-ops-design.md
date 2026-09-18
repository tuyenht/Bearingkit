# bk-ops · design · 2026-09-18

Status: BUILT 2026-09-18 under the owner's approval of the catalog (D5 question 27, group A: `bk-ops` is the first of the five skills still to build). Measured in the isolated profile before commit: 14 of 15 prompts around it routed as labelled, 0 false activations (the miss, `ship-en-04`, is the known fixture gap); acceptance passed on Claude Code; injected protocol 2,240 and 2,247 tokens. Antigravity acceptance waits for the copy to be reinstalled (question 27, C1). Catalog row: v1 §7.1 — intent "`--deploy` pre-flight with rollback (drift check v1.1); incident investigation from alert to code", gate "read-only first; any remote or production change is COUNCIL-class", sources "Owner's ops practice; Spartan deploy and incident (ideas)".

## What it is for

One person running what a DevOps and SRE team would: deploying and changing infrastructure with a way back, and investigating incidents from the alert to the code. The scope test of spec §1 holds: every step it carries is one a team splits between a release engineer, an SRE on call and a platform owner.

## Two paths, one gate

- **Change** — a deploy, an infrastructure apply, a configuration or secret change, a platform move. Read-only until the owner approves: name the target, read the current state and the plan, write the rollback before the change, propose it as COUNCIL, apply exactly what was read, then verify against thresholds stated in advance.
- **Incident** — an alert, an outage, an error spike, a cost spike. Read-only throughout: the window, every change inside it, the cause classified before any fix, the evidence kept before remediation changes the state, the way out (rollback or fix forward) proposed as COUNCIL, a short record afterwards.

The protocol already classes "remote or production systems" as COUNCIL (`bk-protocol/SKILL.md`, Autonomy Gate). `bk-ops` does not add a gate; it makes the COUNCIL proposal concrete — target, plan, rollback, verification — and keeps everything before it read-only.

## What goes where

- `SKILL.md` (≤100 lines, spec §5.4): Read first, the two paths as Steps, Gates, Evidence to paste, Next step.
- `references/change.md`: pre-flight in detail — naming the target, drift between the repository and the live system (field lesson L12), environment and CI parity (L2, L10), the variables-by-environment matrix, reading an infrastructure plan (what turns an update into a replace), infrastructure-as-code hygiene (pinned providers and modules, locked and encrypted state, one state per environment, state surgery as COUNCIL, import until the plan is empty), staged rollout and when it cannot work, secrets, cost traps, platform moves.
- `references/incident.md`: triage from the alert, classifying the cause, the order to read a failing workload, evidence before remediation, alerting that pages on symptoms with a runbook, and the incident record.

No text is vendored. Every source here is ideas-only for the kit (no licence, a proprietary licence, or a `reference`/`ideas-only` mode in `upstream/sources.json`), except the owner's own Antigravity-Core, whose text could have been adapted but carried nothing the kit lacked. The inventory rows are `docs/specs/2026-09-18-item-inventory.md`, target `bk-ops`, plus the notes (a) of cloudflare, vercel, jeffallan, addyosmani and Spartan.

## Routing

- Protocol router: the row "data, ops, research → bk-spec until their skills exist" becomes "deploy, infrastructure, incident → bk-ops" and "data, research → bk-spec until their skills exist". The injected protocol is at its 6,500-character proxy budget, so the change is paid for by cuts elsewhere in the same file, and the reading is taken again (spec §12).
- The description avoids the Vietnamese "triển khai" on its own, because the activation prompt `feat-vi-04` uses it for "implement".
- `ship-neg-02` ("Deploy bản này lên staging.", Phase 1) expected `bk-spec|none` because no ops skill existed. Its label gains `bk-ops`; the prompt text stays byte-identical, and every earlier pass stays a pass.
- Three new activation prompts (`ops-en-01`, `ops-vi-01`, `ops-neg-01`) under spec §11's rule.

## Done when (spec §5.3)

Body ≤100 lines; every body line traces to an inventory row or a field lesson; three test prompts in `skills/bk-ops/tests/`; activation prompts in both languages; acceptance on Claude Code, and on Antigravity once the owner reinstalls the copy (question 27, C1).
