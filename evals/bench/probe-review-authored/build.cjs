'use strict';
// Probe of bk-review's step 3, not a scored benchmark task: the review-01 fixture in a folder of its own, where the
// session first writes a hot-path change itself and then asks for the review. The independent reviewer must still be
// dispatched, since this conversation wrote the change. Read the Opus share of each stream's per-model usage.
const path = require('node:path');
const base = require('../review-01/build.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/probe-review-authored';
const SRC = path.join(__dirname, '..', '..', 'fixtures', 'sample-app');

module.exports = {
  DST,
  build: ({ dst = DST } = {}) => base.build({ dst, src: SRC }),
  reset: ({ dst = DST } = {}) => base.reset({ dst }),
};
