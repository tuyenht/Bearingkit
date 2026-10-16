'use strict';
const { padLeft, money } = require('./text.cjs');

// One line per account: the name, then the balance right-aligned in 12 columns.
function balanceLine(account) {
  return `${account.name}${padLeft(money(account.balanceCents), 12)}`;
}

module.exports = { balanceLine };
