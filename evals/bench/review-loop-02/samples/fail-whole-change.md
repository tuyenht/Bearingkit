1. `src/csv.js:5` the quote inside a value is not doubled.

2. `src/paginate.js:10` pageCount uses Math.floor and drops the last partial page.

3. `src/export.js:6` exportPage past the last page passes an empty array and toCsv throws a TypeError on rows[0].
