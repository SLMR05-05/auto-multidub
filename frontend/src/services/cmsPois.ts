import type { PoiStatus } from '@/types';
import type { PublishResult } from './cms';
import { requestCms } from './cms';

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
interface Translation extends TranslationInput { languageCode: string }

export interface CoverageCell {
  languageCode: string;
  hasTranslation: boolean;
  hasAudio: boolean;
  hasTtsScript: boolean;
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

export async function getPoiEditor(id: string | undefined, signal: AbortSignal) {
  const [wards, stops, poi, translations] = await Promise.all([
    listCmsWards(signal),
    requestCms<StopOption[]>('/bus-stops', { signal }),
    id ? requestCms<CmsPoi>(`/pois/${id}`, { signal }) : null,
    id ? requestCms<Translation[]>(`/pois/${id}/translations`, { signal }) : [],
  ]);
  return { wards, stops, poi, vietnamese: translations.find((translation) => translation.languageCode === 'vi') };
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
