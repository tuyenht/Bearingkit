# Prototyping

Adapted from mattpocock/skills (MIT): `skills/engineering/prototype/SKILL.md` with its `LOGIC.md` and `UI.md`, commit `3cca18b`; attribution in `NOTICE`. Kept: the prototype as throwaway code answering one question, the shared rules, the logic demo over a pure module, and variants on an existing route. Fitted to the kit: the question is written in the spec first, the user agrees before one is built, and the skill makes no commit and names no tracker. Not carried: the logic demo as one shareable HTML file with guided tabs, and the commit to a throwaway branch.

Open this when a design question cannot be settled on paper: whether a state model behaves, or what a screen should look like.

## Before building one

- **The question comes first, in the spec**, in one sentence ("does this state model allow X after Y?", "which of these layouts reads best with real data?"). No question, no prototype.
- **The user agrees to the prototype before it is built**, for ACT and COUNCIL work alike (`bk-test/references/tdd.md`: exceptions to test-first are agreed with the user, not assumed). When nobody can answer, the prototype becomes an open question in the spec and is not built. It is the one exception to the gate in `brainstorming.md`.
- Pick the shape from the question: logic or state → a logic demo; look and layout → UI variants. If the question is ambiguous and nobody can answer, take the shape that matches the code around it (a backend module → logic; a page → UI) and state that choice at the top of the prototype.

## Rules for both shapes

1. **Throwaway, and named so.** Put it next to what it prototypes, with a name a casual reader recognises as a prototype; follow the project's own routing and folder conventions.
2. **Trivial to run**: one command, or one file to open.
3. **No persistence by default.** State lives in memory unless persistence is the question.
4. **No polish**: no tests, no error handling beyond what makes it run, no abstractions, no "what if later". It answers one question. (`bk-test`'s test-first rule exempts it because the user agreed to it.)
5. **Show the state** after every action or every switch of variant.
6. **It never lands in the change.** The validated decision goes into the spec and then into the real code through the normal flow; the prototype is removed or kept aside as the user prefers, and its answer is written in the spec.

## A logic demo

Isolate the logic in a pure module (a reducer, a state machine, a few pure functions) with no reference to a page; a thin shell over it shows the full state, one control per action, and a few guided scenarios that push it through the cases hard to reason about on paper. Only the module is worth keeping.

## UI variants

Prefer variants **on an existing page**, switched by a URL parameter, so they sit among real data and real layout; a new throwaway route is the last resort. Default three variants, at most five, each structurally different (layout, hierarchy, interaction), not three colourings of one idea. Variants read real data but never change it (mutations stubbed), and the switch between them exists only outside production builds.
