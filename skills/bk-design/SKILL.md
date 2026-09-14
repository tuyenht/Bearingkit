---
name: bk-design
description: "Design an interface with a point of view, then critique it before building: subject, tokens, one bold move, accessibility floor. Use when: UI, screen, landing page, redesign, look and feel, giao diện, thiết kế màn hình, làm trang. Not for: implementing a design already agreed, use bk-build."
---

# bk-design

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say) and the project's own instruction files. A project that ships its own design system, tokens or brand guidelines gets those; this skill never overrides them.
- `references/distinctive-ui.md` before writing the plan: it carries the generic-default clusters, the typographic tells, and the writing rules.
- The brief. If it does not say what the product is, who it is for, and what job the screen does, those three are proposed in one line each and confirmed before anything is designed.

## Steps
1. Name the subject, the audience and the primary job. Distinctive choices come from the subject's own world, so a toy shop and a trading desk do not share a palette.
2. Write the plan before any code: four to six named hex values, the typefaces with their roles, a layout concept with an ASCII wireframe and an alignment decision, and the principles that make this screen specific.
3. Review the plan against the brief. Anything that would come out the same for any similar brief is a default, not a choice: revise it, and say what changed and why. Where the brief pins a direction, the brief wins, including when it asks for a look that is otherwise a default.
4. Build from the revised plan. Spend boldness in one place and keep everything around it quiet; cut decoration that serves no part of the brief.
5. Critique the built result against the plan, with a screenshot where the host can take one, then remove one thing.

## Gates
- No code before step 3 has run and its changes are stated. A plan that was not reviewed is not a plan.
- The quality floor holds without being announced: responsive to 375px, visible keyboard focus, reduced motion respected, contrast checked on text and controls.
- Every generic-default cluster in `references/distinctive-ui.md` is either absent or present because the brief asked for it, and that is said out loud.
- Copy is design content: no filler, active voice, one job per element, and an empty or failing state that tells the person what to do next.

## Evidence to paste
- The plan (palette, type, layout, principles), what the review changed and why, the screenshot path, and the accessibility checks actually run.

## Next step
- bk-build to implement the revised plan; bk-test --browser for the rendered check; bk-review when the change touches a hot path.

Sources: anthropics/claude-plugins-official (Apache-2.0) via references/distinctive-ui.md; attribution in NOTICE.
