type JsonInit = number | ResponseInit | undefined;

export const json = (data: unknown, init?: JsonInit): Response =>
  new Response(JSON.stringify(data), {
    ...(typeof init === 'number' ? { status: init } : init),
    headers: { 'Content-Type': 'application/json', ...(typeof init === 'object' && init?.headers ? init.headers : {}) },
  });

export const ok = (data: unknown, init?: JsonInit): Response => json({ success: true, ...((data && typeof data === 'object') ? data : { data }) }, init);

export const err = (
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response => json({ success: false, error: { code, message, details } }, status);

const redactString = (s: string): string =>
  s
    .replace(/sk-[a-zA-Z0-9]{8,}/g, 'sk-***')
    .replace(/xoxb-[a-zA-Z0-9-]+/g, 'xoxb-***')
    .replace(/ghp_[a-zA-Z0-9]{8,}/g, 'ghp_***')
    .replace(/Bearer\s+[A-Za-z0-9\.\-_]+/g, 'Bearer ***');

export const redactSecrets = (obj: unknown): unknown => {
  if (typeof obj === 'string') return redactString(obj);
  if (Array.isArray(obj)) return obj.map(redactSecrets);
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = redactSecrets(v);
    }
    return out;
  }
  return obj;
};

export const log = (event: string, meta?: Record<string, unknown>) => {
  try {
    const entry = {
      t: new Date().toISOString(),
      event,
      ...(meta ? { meta: redactSecrets(meta) } : {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  } catch {
    // ignore logging errors
  }
};
