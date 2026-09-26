# Changelog

## 2.0.0

### Breaking

- `format(date, pattern)` is renamed `formatDate(date, { pattern })`. The pattern tokens are unchanged.
- The `datefmt/testing` entry point is removed. Use your test runner's own assertions.

### Behaviour

- `parse` reads slash dates day first (`DD/MM/YYYY`), the reading most locales use. Pass `{ order: 'MDY' }` to keep the 1.x reading.

### Added

- `daysBetween(a, b)`: whole days from `a` to `b`.
- `formatDate` defaults its pattern to `YYYY-MM-DD`.

## 1.4.2

- Fix: `addDays` across a month end in leap years.

## 1.4.0

- `parse` accepts ISO dates and returns them unchanged.
