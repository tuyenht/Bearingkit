'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { receiptName } = require('./receipts.cjs');

const CONFIG = path.join(__dirname, '..', 'config', 'storage.json');

// Reads the storage settings: bucket, region and the access key pair.
function loadStorageConfig(file = CONFIG) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// The address a receipt is uploaded to.
function uploadUrl(receipt, config) {
  const host = `${config.bucket}.s3.${config.region}.amazonaws.com`;
  return `https://${host}/receipts/${receiptName(receipt)}`;
}

module.exports = { loadStorageConfig, uploadUrl };
