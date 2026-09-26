'use strict';
// Shared test helpers.
const { assertSameDay } = require('../vendor/datefmt-1/testing');

const sample = [
  { id: 'INV-101', date: '2026-01-15', amount: 125000 },
  { id: 'INV-102', date: '2026-02-20', amount: 8900 },
  { id: 'INV-103', date: '2026-03-03', amount: 45050 },
];

module.exports = { assertSameDay, sample };
