'use strict';
// Nightly. Writes exports/tickets.json: one row per ticket, with its fields as they are stored. The file is picked up
// by the finance team's reporting job, which that team deploys on its own schedule.
const fs = require('node:fs');
const path = require('node:path');

const EXPORT_DIR = path.join(__dirname, '..', '..', 'exports');

function exportTickets(store, { dir = EXPORT_DIR } = {}) {
  const rows = store.listTickets();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'tickets.json');
  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n');
  return { file, rows: rows.length };
}

module.exports = { exportTickets, EXPORT_DIR };
