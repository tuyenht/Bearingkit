# bk-map · A refresh re-checks every anchor it keeps against the current code, and keeps the owner's words verbatim

**Prompt** (en)
> Refresh the architecture map in docs/; the billing code has changed since it was written.

**Setup**
`docs/architecture-map.md` names the commit it was drawn at, carries two answers the owner gave, verbatim (one of them about a file that has since been deleted), and describes three areas with anchors. Since that commit a discount rate and a grace period changed, that file was deleted, and a new invoice-lifecycle module was added; the map was not touched.

**Expected**
1. The refresh starts from what changed since the map's commit (`git log --name-status <commit>..HEAD`), not from a blank page.
2. Every kept anchor is read again: the rate and the grace period are corrected from the code with their new lines; the deleted file's area is removed, and the removal is named.
3. The new lifecycle module is added with its anchors.
4. The owner's answers stay verbatim; the one about the deleted file is flagged for the owner, not rewritten or dropped.
5. The footer names the commit the refreshed map was drawn at.

**Fails if**
- A claim is carried over without its line being read again.
- The owner's recorded words are paraphrased or silently removed.
- The old rate or the old grace period appears as a current value; it may appear only as a correction, or as the stale comment it is.
