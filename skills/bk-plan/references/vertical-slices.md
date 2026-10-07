# Vertical slices

Adapted from mattpocock/skills (MIT): `skills/engineering/to-tickets/SKILL.md`, commit `3cca18b`; attribution in `NOTICE`. Kept: phases as tracer-bullet slices, prefactoring first, blocking edges and the frontier, the size of one fresh session, expand–contract for wide refactors. Not carried: publishing to a tracker, triage labels, the per-ticket files, the rule against file paths and code in a ticket (the kit's plan is executed at once, so `references/writing-plans.md` keeps exact paths and code), iterating until the user approves and its granularity quiz (the gate decides), and the step on the project's glossary and decision records. Kit additions are marked.

## A phase is a vertical slice

- A phase cuts a narrow but complete path through every layer the feature touches (data, logic, interface, tests). It is not a horizontal cut of one layer: "all the schema", "all the endpoints", "the tests" are layers, not phases.
- A finished phase can be demonstrated or verified on its own. Its file opens with what it makes work, seen from the user's side, and the check that shows it.
- The first slice is the thinnest path that works end to end: one behaviour through every layer, with its test. Later slices widen it.
- A phase is sized to fit one fresh session; the kit may hand each phase to its own subagent (`bk-build/references/executing.md`).

## Prefactoring comes first

"Make the change easy, then make the easy change." A change that only prepares the ground is done first, before the slices that need it. Kit addition: it is a phase of its own; behaviour stays the same, and the project's test command (or the check the phase states) passes before and after.

## Blocking edges

Each phase names the phases that must be done before it can start, or says "none". Name only what truly gates it (kit addition: a numbered order is not a dependency). Work proceeds on the frontier, the phases whose blockers are all done; for a plain chain that is top to bottom. The edges are written in each phase file; `plan.md` may repeat them beside its list of phases.

## Wide refactors: expand, migrate, contract

A wide refactor is one mechanical change (a renamed column, a retyped shared symbol) whose blast radius fans across the code, so that one edit breaks every caller at once and no slice can land green. Do not force it into a slice; sequence it:

1. **Expand**: add the new form beside the old, so nothing breaks.
2. **Migrate**: move the callers over in batches sized by blast radius (per package, per directory), each batch a phase blocked by the expand; the suite stays green from batch to batch because the old form still exists.
3. **Contract**: remove the old form once no caller remains, in a last phase blocked by every batch.

Kit addition: the blast radius includes readers outside the repository: another team's job, a client application, a stored file or a message someone else consumes. A search of the code cannot show that such a reader has moved. The contract phase names that reader and what confirms it has moved; until then the old form stays, and the contract may be left out of the plan for that reason. When it is left out, `plan.md` records the reader, what would confirm it has moved, and that the removal is not part of this plan.

When even the batches cannot stay green alone, keep the sequence and let them share an integration branch that all block one final integrate-and-verify phase; green is promised only there.

## Split signals (kit addition)

Split a phase when its title needs an "and", when it gathers more than a handful of exit criteria, or when it reaches into two subsystems.

## Re-read after the first slice (kit addition)

Write into `plan.md` that the plan is read again once the first slice has landed: against what the slice showed, the phases it proved wrong are revised, and what changed and why is noted there.
