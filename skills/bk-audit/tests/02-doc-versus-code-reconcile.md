# bk-audit · A document checked against the code uses the reconcile format

**Prompt** (vi)
> Rà soát README xem còn khớp với code không.

**Setup**
A README that states behaviour the code no longer has (for example an upload limit or a retry count that differs from the constant in the source), and one statement it makes that the code does not cover at all.

**Expected**
1. The reconcile format: each item is verified, a mismatch, or a gap, with the decision for it.
2. A mismatch cites both sides, the document line and the code line.
3. Each item is labelled ACT or COUNCIL, by the protocol's gate.
4. The README and the code are left unchanged; fixing them is the next step, not part of the audit.

**Fails if**
- A mismatch is reported with only one side anchored.
- The audit rewrites the README or the code.
- Items carry no ACT or COUNCIL label.
