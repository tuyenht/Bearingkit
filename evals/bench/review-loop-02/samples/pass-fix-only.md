Round 2 of 3.

1. `src/csv.js:5` · unescaped quote inside a quoted field · a value containing a quote is wrapped, but the quote inside is not doubled, so `a"b,c` gives `"a"b,c"`. Fix: double it.

Still open from round 1: `src/paginate.js:10` pageCount floors and drops the last partial page (deferred by the owner).
