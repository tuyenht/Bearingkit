# bk-next · A step the plan marks done, with nothing in git to show it, is not done

**Prompt** (en)
> Where were we?

**Setup**
A plan whose phase 2 is checked, while no commit touches the files that phase names and no test output for it exists.

**Expected**
1. Phase 2 is reported as not done, with the reason: its checkbox has no evidence in git or in test output.
2. The next step is to finish or verify phase 2, before anything later in the plan.
3. The claim rests on the commands shown (log, status, the plan lines), not on the plan's checkbox.

**Fails if**
- Phase 2 is taken as done because the plan says so.
- The answer proposes phase 3 as the next step.
