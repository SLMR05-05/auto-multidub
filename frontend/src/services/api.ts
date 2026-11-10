const apiOrigin = (process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8080').replace(/\/+$/, '');

export function apiUrl(path: string) {
  return new URL(path, apiOrigin).href;
}

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super(`API HTTP ${status}`);
  }
}

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), { ...options, cache: 'no-store' });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
