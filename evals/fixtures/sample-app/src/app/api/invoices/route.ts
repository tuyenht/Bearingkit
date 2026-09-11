import { NextResponse } from 'next/server';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const size = Math.min(MAX_PAGE_SIZE, Number(url.searchParams.get('size') ?? DEFAULT_PAGE_SIZE));
  return NextResponse.json({ page, size, items: [] });
}
