// Bounded cache and in-flight deduplication; no automatic retry storms.
const cache = new Map<string, { expires: number; value: unknown }>();
const pending = new Map<string, Promise<any>>();

export function cachedRequest(url: string, ttl: number, init?: RequestInit): Promise<any> {
  const key = `${url}|${init?.body ?? ''}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return Promise.resolve(hit.value);
  const request = pending.get(key);
  if (request) return request;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  // Browsers identify with their normal UA/Referer. Native and CLI requests need
  // an application identifier; public Overpass rejects the generic Node UA.
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  if (typeof document === 'undefined') headers.set('User-Agent', 'BiteLane/1.0 (+https://github.com/DustinDoan315/bitelane)');
  const next = fetch(url, { ...init, signal: controller.signal, headers })
    .then(async (response) => {
      if (!response.ok) throw new Error(response.status === 429 ? 'rateLimited' : 'serviceUnavailable', { cause: { status: response.status } });
      const value: unknown = await response.json();
      if (cache.size >= 60) cache.delete(cache.keys().next().value!);
      cache.set(key, { value, expires: Date.now() + ttl });
      return value;
    })
    .catch((error: unknown) => {
      if (error instanceof Error && ['rateLimited', 'serviceUnavailable'].includes(error.message)) throw error;
      throw new Error('networkError');
    })
    .finally(() => { clearTimeout(timer); pending.delete(key); });
  pending.set(key, next);
  return next;
}
