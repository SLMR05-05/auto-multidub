import { requestCms } from './cms';

export interface OfflinePackage {
  id: number; code: string; name: string; languageCode: string;
  dataVersion: number; status: 'BUILDING' | 'READY' | 'FAILED';
  sizeBytes: number; checksumSha256: string | null; poiCount: number;
  errorMessage: string | null; downloadUrl: string | null; createdAt: string;
}

export function listCmsPackages(signal?: AbortSignal) {
  return requestCms<OfflinePackage[]>('/offline-packages', { signal });
}

export function retryCmsPackage(id: number) {
  return requestCms<OfflinePackage>(`/offline-packages/${id}/retry`, { method: 'POST' });
}
