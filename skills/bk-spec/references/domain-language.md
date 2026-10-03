# Domain language

Adapted from mattpocock/skills (MIT): `skills/engineering/domain-modeling/SKILL.md` with its `ADR-FORMAT.md` and `CONTEXT-FORMAT.md`, commit `3cca18b`; attribution in `NOTICE`. Kept: challenging terms against the project's language, sharpening vague ones, probing with scenarios, checking claims against the code, and the three-part test for recording a decision. Not carried: the fixed `CONTEXT.md` and `docs/adr/` layout and their creation; the kit never creates a folder of its own.

Open this when the request uses a word the project already defines, a word that could mean two things, or states how something works.

## The project's words

- **Find the vocabulary first**: a glossary if the project keeps one (the instruction files name it), else the names in the code (types, enums, tables, function names).
- **A term that conflicts is said at once.** When the request uses a word the project defines differently, quote both: "the glossary defines X as A; the request seems to mean B". Never quietly use one meaning in the spec and the other in the code.
- **A vague or overloaded term gets one canonical word.** Propose it ("by 'account', the customer or the user? They are different things here") and use only that word in the spec.
- **Terms carry no implementation.** A definition says what a thing is in the domain, not how it is stored, in one or two sentences; only words specific to this project are defined, and the words to avoid for a term are named with it.

## The request against the code

- When the request states how something works, check the code. Where they differ, say so with the `file:line`: the code may be right and the request out of date, or the reverse, and either way the user decides.
- Probe the boundary between two concepts with a concrete scenario ("what happens to B when A is undone halfway?"). A scenario the spec cannot answer is a question or an edge case.

## Recording a decision

Record a decision only when all three hold:

1. **Hard to reverse**: changing your mind later costs something real.
2. **Surprising without context**: a later reader would ask why it was done this way.
3. **The result of a real trade-off**: there were genuine alternatives and one was chosen for a reason.

If any of the three is missing, do not record it. A recorded decision can be one to three sentences: the context, the choice, the reason.

## Where it goes

Terms and decisions go into the spec ("Terms", "Decisions") as they are settled, not batched at the end. A glossary or decision record is updated only where the project already keeps one, and only with the user's agreement when the work is COUNCIL (the kit's gate; not in the source).
