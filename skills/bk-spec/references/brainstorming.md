# Brainstorming an ask into requirements

Adapted from obra/superpowers 5.1.0 (MIT): `skills/brainstorming/SKILL.md` and `skills/brainstorming/spec-document-reviewer-prompt.md`; the rounds of questions from mattpocock/skills (MIT) `skills/productivity/grilling/SKILL.md`, commit `3cca18b`; attribution in `NOTICE`. The source's folder defaults and its browser companion are not carried; the kit's gate (ACT or COUNCIL) decides when questions are asked at all.

## The gate

No implementation action (code, scaffold, install, a "quick" edit) before the requirements are written and, for COUNCIL work, accepted. "Too simple to need a design" is the failure pattern: a config change, a one-function utility and a todo list all get a restatement and edge cases; the write-up can be three sentences, it is never skipped. One exception: a throwaway prototype that answers a question already written in the spec, on the terms of `prototyping.md`.

## Questions

1. Ask only when the answer changes the work. A clear ACT request is not questioned; it is restated and built.
2. Ask in rounds of **at most four questions**, each one independent of the others' answers, **numbered, each with the answer you recommend and why in one line**. A question that depends on an answer still open waits for the next round.
3. A fact is looked up, never asked. What the code, the project's documents or the pinned version's documentation can answer is read and cited (`file:line`); only decisions go to the user.
4. Prefer multiple choice; open questions when no sensible options exist.
5. Scope first: a request naming several independent subsystems (chat, storage, billing, analytics) is decomposed before any detail question. Each piece gets its own spec, plan and build; the first piece goes through the normal flow now.
6. Purpose, constraints and success criteria are what the questions are for. Detail preferences come later or never.
7. When nobody can answer (the user is away, a headless run, a delegation): write the round into the spec under "Open questions", each with its recommended answer, carry on from the recommendations as far as the gate allows, and mark each "assumed, not confirmed". The cap still holds: the four questions whose answers change the work most stay open; any further one becomes a recorded assumption with its default.

## Approaches before design

- Propose two or three approaches with trade-offs, the recommended one first with the reason.
- YAGNI applies to every design: remove what nobody asked for.

## Presenting the design

- Sections scaled to their complexity: a few sentences when plain, two or three paragraphs when nuanced. Cover architecture, components, data flow, error handling, testing.
- COUNCIL: confirm after each section before the next; go back when something does not fit. ACT: present it once with the requirements.
- Design for isolation: units with one purpose, communicating through defined interfaces, each answerable in three lines (what it does, how it is used, what it depends on). A unit whose behavior cannot be understood without its internals has the wrong boundary. Files the model can hold in context at once produce more reliable edits.
- Existing code: explore the structure first and follow its patterns. Include the targeted improvements the work needs (a file that has grown too large, tangled responsibilities); never unrelated refactoring.

## Writing the spec

- The spec goes where the project keeps design documents; the project's instruction files name the place. No kit-named folder is ever created.
- Self-review before showing it, fixed inline, no second pass:
  1. Placeholders: "TBD", "TODO", empty sections, vague requirements.
  2. Consistency: sections that contradict each other; architecture that does not match the feature text.
  3. Scope: one implementation plan's worth, or decomposition needed.
  4. Ambiguity: a requirement readable two ways is rewritten to one.
- COUNCIL: the user reads the file before planning starts; changes loop back through the self-review. ACT: the acceptance criteria are the spec.

## Independent spec review (when a reviewer is dispatched)

Give the reviewer the file path only, never the conversation. It checks completeness, consistency, clarity, scope and YAGNI, and flags only what would derail planning: a missing section, a contradiction, a requirement that could build the wrong thing. Wording, style and uneven detail are advisory. Output: status (approved or issues), issues as `[section]: issue, why it matters`, recommendations separately.

## Next

bk-plan (COUNCIL or more than three files) or bk-build (ACT, at most three files); never an implementation skill straight from the design.
