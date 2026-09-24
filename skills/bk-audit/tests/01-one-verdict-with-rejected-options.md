# bk-audit · One verdict, the rejected options with reasons, nothing executed

**Prompt** (en)
> Should we move from JWT access tokens to server-side sessions? Evaluate the options.

**Setup**
A project whose authentication issues JWTs, with the token code and its middleware in the repository.

**Expected**
1. The question is stated in one line, and only the lenses it needs are picked (security and risk here, not all six).
2. Two to four roles each state one option with its cost and risk; only the conflicts are debated, and disputed facts are checked in the repository first.
3. One verdict, the rejected options with a reason each, and a priority matrix (impact × effort); each claim carries `file:line` or command output, and an opinion without an anchor is labelled as one.
4. No file is changed and no state-changing command runs.

**Fails if**
- The answer lists options and ends with "it depends", or with more than one verdict.
- A claim about the current code carries no anchor and is not labelled as opinion.
- The audit starts the migration or edits a file.
