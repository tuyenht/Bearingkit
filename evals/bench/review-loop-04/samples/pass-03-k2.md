I can't approve this change yet. The review loop has hit its 3-round cap, so no new review pass ran. I confirmed the main open bug by reading `src/csv.js`. I didn't run `git diff`.

**Still broken: `src/csv.js:6`.**
- `s.replace('"', '""')` replaces only the first quote, because the pattern is a string.
- `a"b"c,d` comes out as `"a""b"c,d"`, which is corrupt CSV.
- The `replaceAll` comment is a red herring. `s.replace(/"/g, '""')` works on Node 14.
- `test/csv.test.js` only covers a one-quote case, so it passes anyway.

**Fixed:** the `\r` / `\n` check on line 6 now looks right (the regex includes `\r`). No test covers it.

**Deferred by you: `src/paginate.js:10`.**
- `pageCount` uses `Math.floor`. 5 items in pages of 2 give 2 pages, but `paginate()` serves 3.
- `src/export.js` doesn't call it today, so it can wait for its own change.

**Untested:**
- `toCsv([])` throws on `rows[0]` when a page is empty.
- `export.js` has no test.

**Decision for you:** this is the third escaping bug in the hand-rolled `cell()`, so patching it again isn't enough.
1. Replace `cell()` with a vetted CSV serializer. Or keep it as one regex-based function and add tests for multiple quotes, `\r`, `\n`, empty values and header names that need quoting.
2. Fix `paginate.js:10` separately.

If you want the smallest change, I can apply the `/"/g` fix, add those tests and guard the empty-rows case. Tell me which way to go.