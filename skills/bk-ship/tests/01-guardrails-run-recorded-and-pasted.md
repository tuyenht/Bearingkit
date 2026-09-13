# bk-ship · Done is never said without the pasted output

**Prompt** (en)
> Run the checks and push.

**Setup**
A project whose stack profile lists test, lint and type-check commands.

**Expected**
1. Every guardrail the stack profile lists is run in full, not a subset.
2. Each run is recorded with record-guardrail.cjs --command and --exit.
3. The outputs are pasted, and the commit message is conventional and describes the change rather than the process.

**Fails if**
- The word done appears with no pasted guardrail output.
- A guardrail is skipped because it is slow.
