# Distinctive UI: the defaults to avoid, and the passes that catch them

Adapted from anthropics/claude-plugins-official (Apache-2.0): `plugins/frontend-design/skills/frontend-design/SKILL.md`, commit `3b60051`; attribution in `NOTICE`. The same text ships byte-identical in `anthropics/skills` (SHA-256 checked 2026-09-11 and again 2026-09-14); the kit records the plugin repository as the provenance because its release cycle is the clearer one. Kept: the generic-default clusters, the typographic tells, the motion rule, the two-pass process, the writing rules. Not kept: the studio-persona framing, the client-relationship prose, and the memory-note suggestion, which the kit's handoff already covers.

## The two passes

1. **Plan before code.** A compact token system: four to six named hex values for the base palette; the typefaces and their roles; a layout concept written as one-sentence prose plus an ASCII wireframe, with an alignment decision (left, centred, justified); and the principles that make this screen specific.
2. **Review the plan against the brief before building.** Work through a similar prompt in your head: if you would arrive somewhere similar for any comparable brief, that part is a default rather than a choice. Revise it and say what changed and why. Code starts only after that pass.

Where the brief pins a visual direction, the brief wins exactly, including when it asks for one of the defaults below. Where the brief leaves an axis free, that freedom is not spent on a default.

## Generic-default clusters

These are the shapes AI-generated design currently clusters around. Each is legitimate for some brief; what makes them a tell is that they arrive regardless of subject.

1. A warm cream background near `#F4F1EA`, a high-contrast serif display, and a terracotta or warm-clay accent near `#D97757` — that accent is Anthropic's own interaction colour, so on someone else's brief it reads as a tell.
2. A near-black background with a single bright acid-green or vermilion accent.
3. A broadsheet layout: hairline rules, zero border-radius, dense newspaper columns.
4. The SaaS-card kit: content chopped into identical rounded cards, one radius on everything regardless of hierarchy, the same soft grey shadow under each, gradient washes as decoration.
5. Template chrome that appears whatever the subject: a tracked-out all-caps eyebrow above every heading; meta strings joined with middle dots; labels built as `WORD — fragment` with a spaced em dash; tinted near-black standing in for black; a monospace face for small data labels; an arrow appended to link and button text.

## Typographic tells

- Accenting a single word in a headline with italic, bold or another colour.
- All caps for labels.
- A typographic label added above content that did not need one.

Use one family, or two that are clearly distinct. Set a real type scale with intentional weights, widths and spacing rather than the families you would reach for on any project. When type is the headline, the treatment is part of the design, not a delivery vehicle. Line length under about 80 characters; serif body text takes slightly longer lines and slightly more line-height than sans.

## Structure and motion

Structural devices — outlines, borders, numbering, eyebrows, dividers, labels — encode information about the content or they do not belong. Numbered markers (01 / 02 / 03) are for content that really is a sequence; check before adding them.

Motion the person did not trigger is used sparingly and deliberately, to draw attention. One orchestrated moment lands better than scattered effects: fade-and-slide-up on every section and a hover transition on every card are the generic default. Motion that answers an action — opening, expanding, confirming — is welcome, because it shows what changed.

## The hero

For a web design, the hero is the first thing seen, and it opens with the most characteristic thing in the subject's world, in whatever form fits: a headline, an image, an animation, a live demo, an interactive moment. A big number with a small label, supporting stats and a gradient accent is the default treatment, so it is used only when it is genuinely the best one.

## Restraint

Spend boldness in one place: one memorable element, everything around it quiet and disciplined, and any decoration that does not serve the brief is cut. Build to the quality floor without announcing it — responsive to mobile, visible keyboard focus, reduced motion respected, accessible contrast, harmonious palette. Critique while building, with a screenshot where the environment allows one. Before shipping, remove one thing.

## Writing is design content

Words exist to make the interface easier to understand and use, and they carry the same intentionality as spacing and colour.

- Name things as the user understands them, not as the system is built: a person manages notifications, not webhook config.
- Active voice, and a call to action that says what happens: "Save changes", not "Submit".
- One name per action through the whole flow: the button that says "Publish" produces a toast that says "Published".
- Failure and emptiness are directions, not mood. An error says what happened and how to fix it, in the interface's voice, and never vaguely; an empty screen is an invitation to act.
- Conversational tone: plain verbs, sentence case, no filler, matched to the brand and audience. Each element does exactly one job.

## CSS note carried from the source

Watch selector specificity when writing the code: type-based selectors (`.section`) and element-based ones (`.cta`) commonly cancel each other out, and the usual casualty is padding or margin between sections.
