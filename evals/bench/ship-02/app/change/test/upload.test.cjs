'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { uploadUrl } = require('../src/upload.cjs');

test('uploadUrl puts the receipt under receipts/ in the bucket', () => {
  const config = { bucket: 'ledger-lite-receipts', region: 'ap-southeast-1' };
  const url = uploadUrl({ id: 'R-17', date: '2026-10-02' }, config);
  const host = 'ledger-lite-receipts.s3.ap-southeast-1.amazonaws.com';
  assert.equal(url, `https://${host}/receipts/2026-10-02-R-17.pdf`);
});
