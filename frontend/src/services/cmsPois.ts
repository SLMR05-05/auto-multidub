import type { PoiStatus } from '@/types';
import type { PublishResult } from './cms';
import { requestCms } from './cms';
import { listCmsLanguages } from './cmsLanguages';

export const poiStatusLabels: Record<PoiStatus, string> = {
  DRAFT: 'Bản nháp', READY: 'Sẵn sàng duyệt', PUBLISHED: 'Đã xuất bản', ARCHIVED: 'Đã lưu trữ',
};

export interface PoiInput {
  code: string;
  name: string;
  wardId: number | null;
  busStopId: number | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  priority: number;
  cooldownMinutes: number | null;
}

export interface CmsPoi extends PoiInput {
  id: number;
  status: PoiStatus;
  version: number;
  wardName: string | null;
  busStopName: string | null;
}

interface WardOption { id: number; name: string }
interface StopOption extends WardOption { wardId: number | null }
export interface TranslationInput {
  name: string;
  description: string;
  ttsScript: string;
}
export interface Translation extends TranslationInput { languageCode: string }

export interface CmsPoiImage {
  id: number; fileName: string; contentType: string; sizeBytes: number;
  sortOrder: number; coverImage: boolean; url: string;
}

export interface EditorResponse {
  poi: CmsPoi;
  translations: Translation[];
  audios: CmsPoiAudio[];
  images: CmsPoiImage[];
  tours: { id: number; code: string; name: string; orderIndex: number }[];
}

export type CmsGeofence = Pick<CmsPoi, 'id' | 'name' | 'latitude' | 'longitude' | 'radiusMeters' | 'priority' | 'status'>;

export interface CmsPoiAudio {
  id: number;
  languageCode: string;
  fileName: string;
  contentType: string;
  format: string;
  sizeBytes: number;
  durationSeconds: number;
  checksumSha256: string | null;
  streamUrl: string;
}

export interface CoverageCell {
  languageCode: string;
  hasTranslation: boolean;
  hasAudio: boolean;
  hasTtsScript: boolean;
  audio: CmsPoiAudio | null;
}

export interface CoverageRow {
  poiId: number;
  poiCode: string;
  poiName: string;
  translationCount: number;
  audioCount: number;
  languages: CoverageCell[];
}

export function listCmsPois(query: URLSearchParams, signal: AbortSignal) {
  return requestCms<{ content: CmsPoi[]; totalPages: number }>(`/pois?${query}`, { signal });
}

export function listCmsWards(signal: AbortSignal) {
  return requestCms<WardOption[]>('/wards', { signal });
}

export function getCoverageMatrix(signal: AbortSignal) {
  return requestCms<CoverageRow[]>('/pois/coverage/all', { signal });
}

export function getPoiTranslations(id: number, signal: AbortSignal) {
  return requestCms<Translation[]>(`/pois/${id}/translations`, { signal });
}

export async function getPoiEditor(id: string | undefined, signal: AbortSignal) {
  const [wards, stops, editor, languages, geofences] = await Promise.all([
    listCmsWards(signal),
    requestCms<StopOption[]>('/bus-stops', { signal }),
    id ? getCmsPoiEditor(Number(id), signal) : null,
    listCmsLanguages(signal),
    requestCms<CmsGeofence[]>('/pois/geofences', { signal }),
  ]);
  return { wards, stops, editor, languages, geofences };
}

export function getCmsPoiEditor(id: number, signal?: AbortSignal) {
  return requestCms<EditorResponse>(`/pois/${id}/editor`, { signal });
}

export function savePoiEditor(poi: PoiInput, translations: Record<string, TranslationInput>, id?: number) {
  return requestCms<EditorResponse>(id == null ? '/pois/editor' : `/pois/${id}/editor`, {
    method: id == null ? 'POST' : 'PUT', body: JSON.stringify({ poi, translations }),
  });
}

export function markPoiReady(id: number) {
  return requestCms<{ poi: CmsPoi; issues: PublishResult['issues'] }>(`/pois/${id}/ready`, { method: 'POST' });
}

export async function listAllCmsPois(signal?: AbortSignal) {
  const pois: CmsPoi[] = [];
  let page = 0;
  let totalPages = 1;
  do {
    const result = await requestCms<{ content: CmsPoi[]; totalPages: number }>(`/pois?page=${page++}&size=100`, { signal });
    pois.push(...result.content);
    totalPages = result.totalPages;
  } while (page < totalPages);
  return pois;
}

export function uploadPoiImage(id: number, file: File) {
  const body = new FormData();
  body.append('file', file);
  return requestCms<CmsPoiImage>(`/pois/${id}/images`, { method: 'POST', body });
}

export function uploadPoiAudio(id: number, language: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return requestCms<CmsPoiAudio>(`/pois/${id}/audio?lang=${encodeURIComponent(language)}`, { method: 'POST', body });
}

export function deletePoiImage(id: number, imageId: number) {
  return requestCms(`/pois/${id}/images/${imageId}`, { method: 'DELETE' });
}

export function setPoiCover(id: number, imageId: number) {
  return requestCms<CmsPoiImage>(`/pois/${id}/images/${imageId}/cover`, { method: 'PUT' });
}

export function reorderPoiImages(id: number, imageIds: number[]) {
  return requestCms<CmsPoiImage[]>(`/pois/${id}/images/order`, { method: 'PUT', body: JSON.stringify({ imageIds }) });
}

export function deletePoiAudio(id: number, language: string) {
  return requestCms(`/pois/${id}/audio/${encodeURIComponent(language)}`, { method: 'DELETE' });
}

export function deletePoiTranslation(id: number, language: string) {
  return requestCms(`/pois/${id}/translations/${encodeURIComponent(language)}`, { method: 'DELETE' });
}

export function saveCmsPoi(poi: PoiInput, id?: number) {
  return requestCms<CmsPoi>(id == null ? '/pois' : `/pois/${id}`, {
    method: id == null ? 'POST' : 'PUT',
    body: JSON.stringify(poi),
  });
}

export function saveVietnamese(id: number, translation: TranslationInput) {
  return requestCms<Translation>(`/pois/${id}/translations/vi`, {
    method: 'PUT',
    body: JSON.stringify(translation),
  });
}

export function archiveCmsPoi(id: number) {
  return requestCms<{ message: string }>(`/pois/${id}`, { method: 'DELETE' });
}

export function publishCmsPoi(id: number) {
  return requestCms<PublishResult>(`/pois/${id}/publish`, { method: 'POST' });
}
