# Business rules from code

Adapted from anthropics/claude-plugins-official (Apache-2.0): `plugins/code-modernization/agents/business-rules-extractor.md` and `plugins/code-modernization/commands/modernize-extract-rules.md`, commit `3b60051`; attribution in `NOTICE`. Kept: what counts as a business rule and the test for it, the extraction discipline, the three lenses, verification before writing, the rule card with its priority heuristic, and the rule for credentials among parameters. Not kept: the workflow orchestration and its referee agents, the persona, the separate data-object catalogue, and the steering and SME vocabulary (here the person who confirms a rule is the owner).

## What counts

- Calculations: fees, taxes, discounts, interest, scores, rounding.
- Validations: required fields, formats, ranges, cross-field checks.
- Eligibility and authorization: who may do what, when, under which conditions.
- State transitions: lifecycles, and what triggers each step.
- Policies: retention periods, business retry limits, cutoff times, grace periods.

Not a business rule: infrastructure, logging, error handling, UI layout, technical retries, connection pooling. The test: a business rule would be the same whatever language the system were written in.

## Three lenses, then verify

Read the code once per lens: calculations; validations and eligibility; state and lifecycle. On a host with subagents the lenses can run in parallel, read-only; merge them and remove duplicates.

Then read every cited line yourself and confirm the code implements the rule. A rule only a comment, a string or a document states is not a rule: record the discrepancy (the comment says one rate, the code applies another) as a finding, and let the code's value stand as the rule. A test that pins a value is cited beside the code.

## Rule card

    ### RULE-NNN: <plain-English name>
    Category: Calculation | Validation | Eligibility | Lifecycle | Policy
    Priority: P0 | P1 | P2
    Source: `path:line-line` (and the test that pins it, if any)
    Plain English: one sentence a business person would recognize.
    Specification:
      Given <precondition, with concrete values>
      When  <trigger>
      Then  <outcome, with concrete values>
    Parameters: the constants, rates and thresholds, with their current values
    Edge cases handled: …
    Suspected defect: optional; behaviour that looks wrong, for the owner to keep or fix
    Confidence: High | Medium | Low, and why; below High, the exact question for the owner

Concrete values, not placeholders: "Given an order of 12 items at 250 cents each, When it ships domestically, Then shipping costs 0, because the subtotal of 3,000 cents meets the 2,500-cent threshold."

Confidence is High when the logic is explicit, Medium when it is inferred from structure or names, Low when it is ambiguous.

Priority is P1 by default. P0 when the rule moves money, enforces a legal or compliance requirement, or guards data integrity; a P0 rule below High confidence needs the owner's confirmation. P2 for display and convenience rules.

A parameter that is a credential is written `<credential, masked, see path:line>`, never its value.

## Where they go

A summary table first (ID, name, category, priority, source, confidence), then the cards grouped by category, then "Rules needing confirmation": every Medium or Low card with its question. They go in the map's Business rules section, or in their own area file when the map is split.
