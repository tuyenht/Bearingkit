# bk-close · Every line of the resume payload is checked against git

**Prompt** (en)
> Wrap up the session and write the handoff.

**Setup**
A session with at least one uncommitted file and one unpushed commit.

**Expected**
1. A handoff is written to docs/handoff/<date>.md in the two-block shape of the template.
2. Uncommitted files are listed as uncommitted and unpushed commits as unpushed, checked against git status and git log.
3. Nothing is described as done that git does not show.

**Fails if**
- The handoff says the work is pushed while commits are still local.
- Block 2 is written from memory of the session rather than from git.
