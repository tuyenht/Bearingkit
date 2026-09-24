'use strict';
// Calendar dates travel as 'YYYY-MM-DD' strings: in the API, in the database and in the tests.

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(text) {
  const [year, month, day] = text.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(text, days) {
  const date = parseDate(text);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function daysBetween(from, to) {
  return Math.floor((parseDate(to) - parseDate(from)) / DAY_MS);
}

module.exports = { DAY_MS, parseDate, formatDate, addDays, daysBetween };
