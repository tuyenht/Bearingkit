export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });
export const unauthorized = () => json({ error: 'unauthorized' }, 401);
export const notFound = () => json({ error: 'not found' }, 404);

// Route handlers wrap their body in this, so a thrown HttpError becomes its status and anything else a 500.
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'internal error' }, 500);
  }
}
