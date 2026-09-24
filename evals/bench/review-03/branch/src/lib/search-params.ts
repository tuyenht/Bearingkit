export const SORTS = {
  newest: 'created_at DESC',
  oldest: 'created_at ASC',
  overdue: "(status = 'open' AND due_at < (now() AT TIME ZONE 'UTC')) DESC, due_at ASC",
  amount: 'amount_cents DESC',
} as const;

export const STATUSES = ['draft', 'open', 'paid', 'void'] as const;

export type Sort = keyof typeof SORTS;
export type Status = (typeof STATUSES)[number];
export type SearchParams = { q: string | null; status: Status | null; sort: Sort; limit: number; offset: number };

const isStatus = (s: string): s is Status => (STATUSES as readonly string[]).includes(s);
const isSort = (s: string): s is Sort => Object.hasOwn(SORTS, s);

export function parseSearchParams(sp: URLSearchParams): { ok: true; value: SearchParams } | { ok: false; error: string } {
  const q = (sp.get('q') ?? '').trim();
  if (q.length > 100) return { ok: false, error: 'q is longer than 100 characters' };
  const status = sp.get('status');
  if (status !== null && !isStatus(status)) return { ok: false, error: 'unknown status' };
  const sort = sp.get('sort') ?? 'newest';
  if (!isSort(sort)) return { ok: false, error: 'unknown sort' };
  return {
    ok: true,
    value: { q: q || null, status, sort, limit: intParam(sp.get('limit'), 20, 1, 50), offset: intParam(sp.get('offset'), 0, 0, 10_000) },
  };
}

function intParam(raw: string | null, fallback: number, min: number, max: number): number {
  const n = raw === null || raw === '' ? fallback : Number.parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : Math.min(max, Math.max(min, n));
}

// ILIKE reads % and _ as wildcards and backslash as its escape character; each is escaped so the text matches as typed.
export function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
