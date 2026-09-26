# bk-test · Code about to be refactored gets characterization tests that pin what it does now

**Prompt** (en)
> I'm about to refactor src/billing/proration.ts. Add tests that pin down how it behaves today first.

**Setup**
The eval fixture with a module that has no tests and a few quirks: a boundary that is not where a reader would expect it, a rounding, a default for an unknown key.

**Expected**
1. The tests assert what the code returns now, with literal inputs and outputs, on every branch and on both sides of every boundary.
2. The tests pass on the first run, and the session shows at least one condition changed on purpose, a test failing on it, and the change undone.
3. The module is left as it was; any spot where code and comment disagree is reported, not fixed.

**Fails if**
- An expected value is computed the way the code computes it, or a test asserts what the code should do rather than what it does.
- The module is edited to make it "correct" before the tests exist, or is left changed.
