1. `src/csv.js:5` the quote inside a value is not doubled.

2. `src/export.js:6` exportPage past the last page passes [] and toCsv throws a TypeError (not introduced by the fix, but real).
