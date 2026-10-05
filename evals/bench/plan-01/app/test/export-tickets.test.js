'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStore } = require('../src/store');
const { createTicket, assignTicket } = require('../src/tickets');
const { exportTickets } = require('../src/jobs/export-tickets');

test('the export holds one row per ticket, with its fields as stored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'helpdesk-export-'));
  try {
    const store = createStore();
    const a = createTicket(store, { orgId: 1, customerId: 7, subject: 'Printer', body: 'x' });
    createTicket(store, { orgId: 2, customerId: 9, subject: 'Invoice', body: 'y' });
    assignTicket(store, a.id, 41);
    const out = exportTickets(store, { dir });
    assert.equal(out.rows, 2);
    const rows = JSON.parse(fs.readFileSync(out.file, 'utf8'));
    assert.deepEqual(rows.map((r) => [r.id, r.org_id, r.assignee_id, r.status]), [[a.id, 1, 41, 'open'], [a.id + 1, 2, null, 'open']]);
    assert.deepEqual(rows[0], store.getTicket(a.id));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
