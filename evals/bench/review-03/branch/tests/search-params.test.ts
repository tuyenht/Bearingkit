import { describe, expect, test } from 'vitest';
import { likePattern, parseSearchParams } from '../src/lib/search-params';

const parse = (query: string) => parseSearchParams(new URLSearchParams(query));

describe('parseSearchParams', () => {
  test('defaults', () => {
    expect(parse('')).toEqual({ ok: true, value: { q: null, status: null, sort: 'newest', limit: 20, offset: 0 } });
  });
  test('trims the text and clamps the page', () => {
    expect(parse('q=%20acme%20&status=open&sort=overdue&limit=500&offset=-4')).toEqual({
      ok: true,
      value: { q: 'acme', status: 'open', sort: 'overdue', limit: 50, offset: 0 },
    });
    expect(parse('limit=abc')).toMatchObject({ ok: true, value: { limit: 20 } });
  });
  test('refuses a sort that is not one of its own keys', () => {
    for (const sort of ['name', '__proto__', 'toString', 'created_at; DROP TABLE invoices']) expect(parse(`sort=${encodeURIComponent(sort)}`).ok).toBe(false);
  });
  test('refuses an unknown status and an overlong text', () => {
    expect(parse('status=archived').ok).toBe(false);
    expect(parse(`q=${'x'.repeat(101)}`).ok).toBe(false);
  });
});

describe('likePattern', () => {
  test('matches the text as typed', () => {
    expect(likePattern('50%_off\\')).toBe('%50\\%\\_off\\\\%');
  });
});
