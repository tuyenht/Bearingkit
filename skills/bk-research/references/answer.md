# The answer

Read by bk-research before writing the answer. Kit-original, from the ideas recorded in `docs/specs/2026-09-23-bk-research-design.md`.

## Shape

1. **The answer**, in two or three sentences, with its confidence.
2. **Claims**, each with its link (deep link), the version or date it describes, a confidence, and its kind: a fact a source states, an inference drawn from sources, or a recommendation.
3. **Conflicts and evidence against** the answer, or "none found".
4. **Not found**, in the UNVERIFIED form below.
5. **Open questions**, last, each with the decision it blocks.

Synthesis, not a list: say what the claims add up to for this project, what the data does not cover, and what was surprising.

## Confidence

Labels are the persona's (`bk-protocol/references/personas.md`, bk-researcher):

- **high**: the source that owns the fact, for the pinned version; or two independent sources that agree.
- **medium**: one good source; or sources that describe a nearby version; or a sound inference from high-confidence facts.
- **low**: indirect, old or non-primary sources only.

## UNVERIFIED

When nothing reliable settles a claim, it is said on its own line, not hedged inside a sentence:

```
UNVERIFIED: no documentation found for <claim> in <library> <version>.
It rests on <what it rests on>. Check <how to check> before relying on it.
```

## Taking a position

When the evidence supports one option, take it and say why. "It depends" is allowed only with what it depends on and the answer for this project's case, from its stack profile and instruction files.

## Adoption checklist

For a choice of tool, library or service, each point sourced or marked unverified:

- What it does and how, in the version that would be installed; fit with the project's pinned majors.
- Maintenance: last release and its date, release cadence, open issues over time, who maintains it.
- Trade-offs against the named alternatives, and against changing nothing.
- Setup and migration cost; lock-in, and the way back out.
- Security and licence: published advisories, licence compatibility with the project, what it sends and where.
- Who uses it, from evidence, not from a vendor's list of logos.

## Saving

The answer stays in the chat. A file is written only when the user asks or a spec will cite it, at the first of: the location the project's instruction files give; an existing folder that already holds research or decision notes; `docs/research/<date>-<slug>.md`. The answer says where it wrote. The file has the same shape, the date, the pinned versions it applies to, and every link.
