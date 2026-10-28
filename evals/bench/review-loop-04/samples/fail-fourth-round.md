Round 4 findings:

1. `src/export.js:7` `orders.sort(...)` sorts the caller's array in place, so exporting a page reorders the orders list on screen. Sort a copy: `[...orders].sort(...)`.
