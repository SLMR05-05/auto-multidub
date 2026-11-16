import type { Tour, TourStatus, Poi } from '@/types';
import { apiUrl } from './api';
import { requestCms } from './cms';

interface TourPoiItem { poiId: number; code: string; name: string; orderIndex: number; latitude: number; longitude: number; coverImageUrl: string | null }
interface TourResponse {
  id: number; code: string; name: string; description: string | null; status: string;
  version: number; pois: TourPoiItem[] | null; createdAt: string; updatedAt: string;
}
interface PageResponse<T> { content: T[]; totalPages: number; totalElements?: number; number?: number }

export interface TourInput { code: string; name: string; description: string }

function adaptPoi(item: TourPoiItem): Poi {
  const imageUrl = item.coverImageUrl ? apiUrl(item.coverImageUrl) : '';
  return {
    id: item.poiId, code: item.code, name: item.name, latitude: item.latitude,
    longitude: item.longitude, radiusMeters: 0, priority: 0, status: 'PUBLISHED',
    version: 0, isDeleted: false, wardId: undefined, busStopId: undefined,
    images: imageUrl ? [{ id: 0, poiId: item.poiId, fileName: '', imageUrl, orderIndex: 1, isPrimary: true }] : [],
  } as Poi;
}

function adaptTour(response: TourResponse): Tour {
  const pois = (response.pois ?? []).map((item) => ({ poi: adaptPoi(item), orderIndex: item.orderIndex }));
  return {
    id: response.id, code: response.code, name: response.name,
    description: response.description ?? undefined, estimatedMinutes: 0,
    status: response.status as TourStatus, version: response.version,
    coverImageUrl: pois[0]?.poi.images?.[0]?.imageUrl, pois,
  };
}

export function listCmsTours(params: { search?: string; status?: string; page?: number; size?: number }, signal?: AbortSignal) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));
  return requestCms<PageResponse<TourResponse>>(`/tours?${query}`, { signal })
    .then((data) => ({ content: data.content.map(adaptTour), totalPages: data.totalPages ?? 1 }));
}

export function getCmsTour(id: number, signal?: AbortSignal) {
  return requestCms<TourResponse>(`/tours/${id}`, { signal }).then(adaptTour);
}

export function createCmsTour(input: TourInput) {
  return requestCms<TourResponse>('/tours', {
    method: 'POST', body: JSON.stringify(input),
  }).then(adaptTour);
}

export function updateCmsTour(id: number, input: TourInput) {
  return requestCms<TourResponse>(`/tours/${id}`, {
    method: 'PUT', body: JSON.stringify(input),
  }).then(adaptTour);
}

export function setCmsTourPois(id: number, poiIds: number[]) {
  return requestCms<TourResponse>(`/tours/${id}/pois`, {
    method: 'PUT', body: JSON.stringify({ poiIds }),
  }).then(adaptTour);
}

export function publishCmsTour(id: number) {
  return requestCms<TourResponse>(`/tours/${id}/publish`, { method: 'POST' }).then(adaptTour);
}

export function archiveCmsTour(id: number) {
  return requestCms<{ message: string }>(`/tours/${id}`, { method: 'DELETE' });
}

