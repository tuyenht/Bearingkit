'use strict';
// Text helpers for fixed-width plain-text output.

// Pads a value on the left to `width` characters.
function padLeft(value, width, fill = ' ') {
  const text = String(value);
  return text.length >= width ? text : fill.repeat(width - text.length) + text;
}

// Formats an amount in cents as 1,234.50.
function money(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${whole}.${String(abs % 100).padStart(2, '0')}`;
}

module.exports = { padLeft, money };
