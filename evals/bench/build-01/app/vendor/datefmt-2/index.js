'use strict';
// datefmt 2.0.0: small date helpers on ISO calendar dates ('YYYY-MM-DD' strings, no time zone).

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');

function split(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) throw new Error(`datefmt: not an ISO date: ${iso}`);
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function valid(y, m, d) {
  if (m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// formatDate('2026-01-02', { pattern: 'DD MMM YYYY' }) -> '02 Jan 2026'. Tokens: YYYY, MMM, MM, DD.
function formatDate(iso, { pattern = 'YYYY-MM-DD' } = {}) {
  const { y, m, d } = split(iso);
  return pattern.replace(/YYYY|MMM|MM|DD/g, (t) => ({ YYYY: String(y), MMM: MONTHS[m - 1], MM: pad(m), DD: pad(d) })[t]);
}

// parse('01/02/2026') -> '2026-02-01'. Slash dates are read day first unless { order: 'MDY' } is given.
function parse(text, opts) {
  const order = (opts && opts.order) || 'DMY';
  const s = String(text).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { split(s); return s; }
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (!m) throw new Error(`datefmt: cannot parse ${text}`);
  const [a, b, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const [month, day] = order === 'MDY' ? [a, b] : [b, a];
  if (!valid(year, month, day)) throw new Error(`datefmt: invalid date ${text}`);
  return `${year}-${pad(month)}-${pad(day)}`;
}

function addDays(iso, days) {
  const { y, m, d } = split(iso);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

function daysBetween(a, b) {
  const x = split(a); const y = split(b);
  return Math.round((Date.UTC(y.y, y.m - 1, y.d) - Date.UTC(x.y, x.m - 1, x.d)) / 86400000);
}

module.exports = { formatDate, parse, addDays, daysBetween, VERSION: '2.0.0' };
