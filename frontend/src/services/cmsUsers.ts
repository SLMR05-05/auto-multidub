import type { AppUser, Role } from '@/types';
import { requestCms } from './cms';

interface UserResponse {
  id: number; email: string; fullName: string; role: string; active: boolean;
  failedLoginAttempts: number; lockedUntil: string | null; createdAt: string;
}

function adapt(response: UserResponse): AppUser {
  return { id: response.id, email: response.email, fullName: response.fullName,
    role: response.role as Role, isActive: response.active };
}

export function listCmsUsers(signal?: AbortSignal) {
  return requestCms<UserResponse[]>('/users', { signal }).then((items) => items.map(adapt));
}