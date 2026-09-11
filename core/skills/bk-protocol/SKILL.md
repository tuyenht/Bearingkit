---
name: bk-protocol
description: Reference material for the Bearingkit protocol (gate patterns, personas, evidence rules, council, RBA-lite, host tool map). Not a task skill; other bk-* skills read its references. Not for direct use.
user-invocable: false
disable-model-invocation: true
---

# bk-protocol

This skill holds shared references. Task skills read the files under `references/` by relative path and never copy them.

| File | Holds |
|---|---|
| `references/gate-patterns.md` | Path and content patterns that classify ACT, COUNCIL and hot paths |
| `references/personas.md` | The four agent personas (researcher, reviewer, query optimizer, design critic) |
| `references/host-tools.md` | Action → tool name on each host |
| `references/evidence.md` | Evidence rules with a worked example |
| `references/council.md` | Council format with a worked example |
| `references/rba-lite.md` | Reasoning-before-action block and its fail conditions |
| `references/correction-cues.md` | Phrases that mark a user correction |
| `references/handoff-template.md` | Two-block handoff skeleton used by bk-close |
| `references/meta-routing.md` | What the router keeps from Superpowers' meta-skill, and the authoring convention for skills |
