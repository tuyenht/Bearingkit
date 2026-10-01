'use strict';
// shell-01-src: the same fixture and scorer as shell-01 (evals/bench/shell-01/build.cjs), under a second task id so
// that its S branch can be the wrapped source of shell.md (docs/specs/2026-10-01-stack-shell-design.md, "Addendum:
// against the source"). Nothing here differs from shell-01 but the task file's id and sources.
module.exports = require('../shell-01/build.cjs');
