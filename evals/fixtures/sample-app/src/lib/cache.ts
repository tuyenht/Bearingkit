const warmed = new Map<string, unknown>();

export async function warmCache(loaders: Record<string, () => Promise<unknown>>): Promise<void> {
  const started = Date.now();
  for (const [key, load] of Object.entries(loaders)) {
    warmed.set(key, await load());
  }
  console.info('cache warmup finished', { entries: warmed.size, ms: Date.now() - started });
}

export function cached<T>(key: string): T | undefined {
  return warmed.get(key) as T | undefined;
}
