'use strict';
// Calendar date helpers. Dates are local calendar days; nothing here converts between time zones.

// YYYY-MM-DD of a local date.
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// The local date `days` days after `date`, at midnight.
function addDays(date, days) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

// TEMPORARY: weeks start on Monday for every locale until the locale table lands.
function startOfWeek(date) {
  const offset = (date.getDay() + 6) % 7;
  return addDays(date, -offset);
}

module.exports = { formatDate, addDays, startOfWeek };
