import type { Role } from '@/types';
import { ApiError, requestJson } from './api';

interface Session {
  token: string;
  role: Role;
}

const sessionKey = 'seminar.cms.session';

export function readCmsSession(): Session | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(sessionKey) ?? 'null');
    if (value && typeof value === 'object' && 'token' in value && typeof value.token === 'string' &&
        'role' in value && (value.role === 'ADMIN' || value.role === 'EDITOR' || value.role === 'ANALYST')) {
      return { token: value.token, role: value.role };
    }
  } catch {
    return null;
  }
  return null;
}

export function clearCmsSession() {
  sessionStorage.removeItem(sessionKey);
}

export async function loginCms(email: string, password: string) {
  const session = await requestJson<Session>('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (session.role !== 'ADMIN' && session.role !== 'EDITOR' && session.role !== 'ANALYST') return null;
  sessionStorage.setItem(sessionKey, JSON.stringify({ token: session.token, role: session.role }));
  return session.role;
}

export interface PublishResult {
  dataVersion: number;
  publishedCount: number;
  issues: { poiId: number; poiCode: string; message: string }[];
}

export function publishCatalog(token: string) {
  return requestJson<PublishResult>('/api/v1/admin/publish', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function requestCms<T>(path: string, options: RequestInit = {}) {
  const session = readCmsSession();
  if (!session) throw new ApiError(401);
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.token}`);
  if (options.body) headers.set('Content-Type', 'application/json');
  return requestJson<T>(`/api/v1/admin${path}`, { ...options, headers });
}
