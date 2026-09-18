# Evidence rules

1. A claim without an anchor is unverified, and unverified is stated, not hidden. Anchors are `file:line`, a command with its output, or a rendered screenshot.
2. Numbers carry the method that produced them ("measured with `/context`", "estimated from file sizes") or the label "not measured".
3. Before trusting a clean result, show the check can fail: run it once against a known-bad input, a deliberately broken test, or a file that must be rejected.
4. Nothing untested goes into a commit message, a document, or a handoff as fact.
5. Below a stated confidence on a technology, say so and consult the pinned documentation first; never write syntax from memory for a major newer than the training data.
6. Sticky decisions: a decision marked `verified by file:line` or `verified by test <name>` is reversed only by new evidence, and the reversal names what the earlier verification missed. A decision the user confirmed is never reversed silently; it is surfaced with the original wording, the new reasoning, and the trade-off, and the user decides.

## Worked example

Wrong: "The rate limiter works, I added the middleware."

Right: "Rate limiting applies to `POST /login` (`app/Http/Kernel.php:41` registers `throttle:5,1` on the auth group). Negative control: eleven requests in a minute from one IP returned 429 on the sixth (`pest tests/Feature/LoginThrottleTest.php`, output pasted below). Not measured: behavior behind the reverse proxy, because the test environment has no proxy."
