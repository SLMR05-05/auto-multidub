const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export function apiUrl(path: string) {
  return new URL(path, apiOrigin).href;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message?: string,
    public readonly errors: { field: string; message: string }[] = []) {
    super(message || `API HTTP ${status}`);
  }
}

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), { ...options, cache: 'no-store' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errors = Array.isArray(body?.errors) ? body.errors.filter((item: { field?: unknown; message?: unknown }) =>
      typeof item?.field === 'string' && typeof item?.message === 'string') : [];
    throw new ApiError(response.status, errors.length
      ? errors.map((item: { field: string; message: string }) => `${item.field}: ${item.message}`).join(' · ')
      : typeof body?.message === 'string' ? body.message : undefined, errors);
  }
  return response.json() as Promise<T>;
}
