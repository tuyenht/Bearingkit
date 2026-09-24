# bk-next · Exactly one next step, taken from git and the plan

**Prompt** (vi)
> Tiếp theo làm gì?

**Setup**
A plan in `docs/plans/` with its first two phases checked, a last commit that implements part of phase 3, and one uncommitted file.

**Expected**
1. Where the work is, in three lines: the last completed step with its evidence (the commit), what is uncommitted, and what the plan says comes next.
2. Exactly one next step, with the evidence that would prove it done (a test run, a rendered check, a commit).
3. The commands run and their output are pasted: status, log, the plan excerpt used.
4. The step is not started; the answer hands off to the skill that does it.

**Fails if**
- More than one next step is proposed, or none.
- The uncommitted file is not mentioned.
- The session starts writing the phase 3 code.
