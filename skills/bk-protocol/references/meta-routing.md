# Meta-routing: what the router keeps from using-superpowers

Adapted from obra/superpowers 5.1.0 (MIT): `skills/using-superpowers/SKILL.md`, with the authoring rules from `skills/writing-skills/SKILL.md`; attribution in `NOTICE`. The kit has no meta-skill: the router lives in `core/AGENTS.md` and costs no skill slot. This file records what the source's meta-skill does, where the kit keeps each behavior, and what it drops on purpose, so the router is edited with the list in view.

| Behavior in the source | Where the kit keeps it |
|---|---|
| Invoke the matching skill before any response, including a clarifying question | `core/AGENTS.md` Router: the skill is the first action, before reading or searching code |
| A one-percent chance a skill applies is enough to open it; drop it when it does not fit | Router, same sentence |
| Announce which skill and for what | Router: "name the intent, then invoke" |
| A dispatched subagent executes its task and does not re-route | Hooks no-op inside subagents; a subagent prompt carries its task text, not the router |
| Instruction priority: the user's instruction files first, the skill second, the host's defaults last | `core/AGENTS.md` opening: the project's facts always win over the kit |
| Process skills before implementation skills (design or debug before build) | The handoff chain spec, plan, build, test, review, ship, close, and the intent table |
| Rigid versus flexible skills | Every skill body: the Gates section is rigid, the Steps adapt to context |
| Instructions say what, not how; "add X" does not skip the workflow | Router: a request to add, change, rename or fix never starts with an edit |
| A checklist becomes one task-list item per entry | The host's task list, named in `references/host-tools.md` |
| Re-read the skill each time; memory of it is stale | The skill file is opened, not recalled |
| Per-platform tool names | `references/host-tools.md` |

## Rationalizations the router must survive

| Thought | Answer |
|---|---|
| this is just a question | questions are tasks; the router says which skill, or none |
| I need context first | the skill says what to read; open it first |
| let me explore the codebase first | exploring first and deciding later is the failure mode |
| I can check git or a file quickly | the file does not know the request; route first |
| this does not need a formal skill | if one matches, open it |
| I remember this skill | it changed; open it |
| the skill is overkill | simple things grow; open it, drop it if it does not fit |
| one small thing first | route before doing anything |
| this feels productive | undisciplined action costs more than the routing step |

## Dropped on purpose

The all-capitals block and the "not negotiable" framing (the activation set measures whether routing happens; volume does not), the dot flowchart, the per-host sections (the host map is one table), the meta-skill as a listed skill (it would cost a description in every session).

## Authoring convention taken from writing-skills

- A description names triggers, not the workflow: a description that summarizes the steps is followed instead of the body (the source measured one review happening where the body asked for two). The kit's shape is one action clause plus cues ("Use when: ... Not for: ...", spec 7.3); the action clause stays a clause.
- Cross-reference by relative path (`references/<file>`, `bk-protocol/references/<file>`); never a force-loading include.
- Token discipline: bodies at or under 100 lines, one example rather than three, details in `references/` read on demand.
- A skill change is tested against the prompts that exercise it (the activation set, then the skill evals of spec 13), not shipped on reading alone; the source's baseline-then-skill loop is the same idea: see the failure without the skill, write the minimum that fixes it, close the loopholes it reveals.
- Mechanical constraints are enforced by a check, not by prose: `tests/skills.test.cjs` holds the static checks (frontmatter, description budget, body length, cited references exist, provenance recorded) until `doctor` takes them over.
