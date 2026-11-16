import type { QrCode } from '@/types';
import { requestCms, readCmsSession } from './cms';

interface QrResponse {
  id: number;
  code: string;
  url: string;
  poiId: number | null;
  poiName: string | null;
  busStopId: number | null;
  busStopName: string | null;
  active: boolean;
  label: string;
  version: number;
  createdAt: string;
}

export interface QrInput {
  poiId: number;
  busStopId?: number;
  label?: string;
}

function adapt(response: QrResponse): QrCode {
  return {
    id: response.id,
    code: response.code,
    poiId: response.poiId ?? 0,
    busStopId: response.busStopId ?? undefined,
    label: response.label,
    isActive: response.active,
    scanCount: 0,
    url: response.url,
    createdAt: response.createdAt,
    poi: response.poiName ? ({ id: response.poiId ?? 0, name: response.poiName } as any) : undefined,
    busStop: response.busStopName ? ({ id: response.busStopId ?? 0, name: response.busStopName } as any) : undefined,
  };
}

export function listCmsQrCodes(signal?: AbortSignal) {
  return requestCms<QrResponse[]>('/qr-codes', { signal }).then((items) => items.map(adapt));
}

export function createCmsQrCode(input: QrInput) {
  return requestCms<QrResponse>('/qr-codes', {
    method: 'POST',
    body: JSON.stringify({ poiId: input.poiId, busStopId: input.busStopId ?? null, label: input.label }),
  }).then(adapt);
}

export function setCmsQrActive(id: number, active: boolean) {
  return requestCms<QrResponse>(`/qr-codes/${id}/active?active=${active}`, { method: 'PUT' }).then(adapt);
}

export function deleteCmsQrCode(id: number) {
  return requestCms<{ message: string }>(`/qr-codes/${id}`, { method: 'DELETE' });
}

export async function fetchCmsQrImageBlob(id: number, format: 'png' | 'svg' = 'png', size = 512): Promise<Blob> {
  const session = readCmsSession();
  const res = await fetch(`/api/v1/admin/qr-codes/${id}/image?format=${format}&size=${size}`, {
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
  });
  if (!res.ok) throw new Error('Không tải được ảnh mã QR từ máy chủ.');
  return res.blob();
}

export async function downloadCmsQrImage(id: number, code: string, format: 'png' | 'svg' = 'png', size = 1024) {
  const blob = await fetchCmsQrImageBlob(id, format, size);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `QR_${code}_${size}px.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadCmsQrPrint(id: number, code: string) {
  const session = readCmsSession();
  const res = await fetch(`/api/v1/admin/qr-codes/${id}/print`, {
    headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
  });
  if (!res.ok) throw new Error('Không tải được file in từ máy chủ.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `QR_PRINT_${code}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
