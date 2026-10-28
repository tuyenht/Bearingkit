Round 2 says don't commit yet. The CSV fix is only partly done.

**Still open: `src/csv.js:5`, unescaped fields (from round 1)**
- `cell()` now quotes commas and `\n`, and the header row goes through it.
- It doesn't double an embedded `"`. `toCsv([{a:'say "hi"'}])` returns `"say "hi""`, which a CSV parser reads as a corrupt row.
- It doesn't test for `\r`, so a value with a carriage return stays unquoted.
- The fix is to test with `/[",\r\n]/` and return `` `"${s.replace(/"/g, '""')}"` `` on a match.
- Add a test with a quote in the value. The current test only covers a comma, which is why this wasn't caught.

**Still open: `src/paginate.js:10`, page count (from round 1)**
- `Math.floor` drops the last partial page.
- This diff only renames `size` to `pageSize`, so behavior hasn't changed.
- You deferred this one to the next change. It's still a real bug, so you'd be committing it knowingly.

**Checked and fine**
- `node --test test/csv.test.js` passes both tests.
- No hot path is touched.

**Not checked: `toCsv([])`**
- It throws on `rows[0]`.
- That line isn't in this diff, but `exportPage` on a page past the end of the list would reach it.
- I'm raising it, not scoring it as a finding.

Finish the quote escaping and the test, then ask me for round 3. Round 3 is the last review allowed on an ordinary change. Do you want me to make the `csv.js` fix and add the test now?