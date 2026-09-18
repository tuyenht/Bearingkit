# From the alert to the code: investigating an incident

Ideas only, no text taken: c0x12c/ai-toolkit (ops-investigate-alert, ops-oncall-log, sre-architect), tuyenht/Antigravity-Core (message-queue, monitoring-observability), claudekit/claudekit-engineer (the debugger agent; proprietary, ideas written clean-room), jeffallan/claude-skills (sre-engineer, kubernetes-specialist, devops-engineer, cloud-architect, monitoring-expert), addyosmani/agent-skills (observability-and-instrumentation), vercel-labs/agent-skills (vercel-optimize: usage-spike triage), cloudflare/skills (the observability notes of its product references). Rows: `docs/specs/2026-09-18-item-inventory.md`, target `bk-ops`.

## Start from the alert

- Read the alert itself: which signal, which threshold, since when. The window is the first fact; everything else is read inside it.
- List every change inside the window before forming a theory: deploys, configuration and secret changes, feature flags, traffic, a pricing or plan change, a dependency's status. Most incidents start with a change.

## Classify before fixing

The cause decides the fix, and the fixes conflict:

- a regression from a change: roll it back or fix forward;
- real traffic: scale or shed load, never block the users;
- a crawler or abuse: rate-limit or block that source, never revert a deploy for it;
- a failing dependency: degrade gracefully, wait, or fail over;
- exhausted capacity (connections, memory, disk, quota): raise the limit or relieve the pressure, then find what consumed it.

Test one hypothesis at a time, with evidence the systems already recorded: metrics, logs, traces, deploy history. Keep the trail of what was ruled out and by which evidence, so nobody tests it twice. When the evidence spans several services, put their log lines on one timeline first; clocks and time zones differ between sources, and an ordering read across unaligned logs is a guess.

## Reading a failing service

- Read the orchestrator's view before the application's: the rollout status, recent events, restarts, and the logs of the instance that crashed, not only the one running now.
- Before blaming the database, compare the service's CPU with its latency: high latency with idle CPU points at something the service waits on; both high points at work the service does itself.
- Sampling hides events: a sampled log without the error does not prove the error did not happen.
- A queue that keeps growing, or a dead-letter queue that fills, is a signal of its own. Delivery is at least once, so before messages are replayed the consumer has to be idempotent, or the replay repeats every side effect.

## Evidence before remediation

Take the queries, timestamps and log excerpts (without secrets) before anything restarts, redeploys or rolls back; a restart erases the state that explained the failure. A script that restarts on every error hides the cause and is itself a finding.

## After the incident

- A short record in the project's docs: timeline, cause, how it was detected, what did not alert, what changes.
- Every page-worthy alert fires on a symptom a user feels, carries a runbook, and has been test-fired once. Labels have bounded values; latency is read in percentiles, not averages; an error budget burning fast over a short window and steadily over a long one are two different alerts.
- An on-call log groups alerts by monitor, counts them, and carries the ones still active into the next handoff.
- Recovery is tested on a schedule, and the test records the recovery time it actually took against the target.
