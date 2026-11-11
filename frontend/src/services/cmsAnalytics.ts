import { requestCms } from './cms';

interface Dashboard {
  from: string;
  to: string;
  sessions: number;
  totalListens: number;
  validListens: number;
  qrScans: number;
  uniqueDevices: number;
  triggerDistribution?: Record<string, number>;
  languageDistribution?: Record<string, number>;
  platformDistribution?: Record<string, number>;
  osDistribution?: Record<string, number>;
}
interface TopPoi {
  poiId: number;
  poiName: string;
  validListens: number;
  avgListenedSeconds: number;
  completionRate: number;
}
interface Heatmap {
  minDevices: number;
  cells: { latitude: number; longitude: number; deviceCount: number; pointCount: number }[];
}
interface Transition {
  fromPoiId: number;
  fromPoiName: string;
  toPoiId: number;
  toPoiName: string;
  count: number;
}

export function getDashboard(signal: AbortSignal) {
  return Promise.all([
    requestCms<Dashboard>('/analytics/dashboard', { signal }),
    requestCms<{ items: TopPoi[] }>('/analytics/top-pois', { signal }),
  ]);
}

export function getHeatmap(from: string, to: string, signal: AbortSignal) {
  const range = new URLSearchParams({ from, to });
  return Promise.all([
    requestCms<Heatmap>(`/analytics/heatmap?${range}`, { signal }),
    requestCms<{ items: Transition[] }>(`/analytics/transitions?${range}`, { signal }),
  ]);
}
