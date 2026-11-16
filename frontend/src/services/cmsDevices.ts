import { requestCms } from './cms';

export interface AdminDeviceItem {
  deviceId: string;
  deviceType: string;
  osVersion: string | null;
  appVersion: string | null;
  preferredLanguage: string | null;
  analyticsConsent: boolean;
  totalPlaybacks: number;
  totalSessions: number;
  createdAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
}

export interface AdminDeviceSummary {
  totalDevices: number;
  onlineDevices: number;
  webDevices: number;
  appDevices: number;
  items: AdminDeviceItem[];
}

export function getAdminDevices(
  params?: { search?: string; type?: string; os?: string },
  signal?: AbortSignal
) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.type && params.type !== 'ALL') query.set('type', params.type);
  if (params?.os && params.os !== 'ALL') query.set('os', params.os);

  const qs = query.toString();
  return requestCms<AdminDeviceSummary>(`/devices${qs ? `?${qs}` : ''}`, { signal });
}

export function deleteAdminDevice(deviceId: string) {
  return requestCms<{
    deviceId: string;
    playbackLogsDeleted: number;
    trackingSessionsDeleted: number;
    locationPointsDeleted: number;
  }>(`/devices/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE',
  });
}

