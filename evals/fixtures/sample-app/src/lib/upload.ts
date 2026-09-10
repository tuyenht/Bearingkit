const MAX_BYTES = 5 * 1024 * 1024;

export async function handleUpload(file: File): Promise<{ ok: boolean; reason?: string }> {
  if (file.size > MAX_BYTES) {
    return { ok: false };
  }
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/uploads', { method: 'POST', body });
  return { ok: res.ok };
}
