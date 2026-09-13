# bk-spec · Feature is pinned before any code

**Prompt** (en)
> Add CSV export to the invoices page.

**Setup**
The eval fixture, or any project with an invoices page.

**Expected**
1. The request is restated in one paragraph, in the user's own words plus the technical reading, and any difference between the two is named.
2. At least three edge cases, each with how it is handled: empty result set, a very large export, permissions.
3. Assumptions listed with a confidence each; a low-confidence assumption about a technology triggers a documentation check before anything else.
4. A classification, ACT or COUNCIL, naming the gate pattern that decided it, and the touchpoints as file:line.
5. Requirements written as acceptance criteria a test could check.

**Fails if**
- Any file is edited, or code is written, during this turn.
- Requirements are listed with no acceptance criterion.
