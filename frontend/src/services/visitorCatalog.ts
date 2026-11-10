import type { Poi, PoiAudio, PoiImage, PoiStatus, Tour, TourStatus, Ward } from '@/types';
import { apiUrl, requestJson } from './api';

interface PoiData {
  id: number;
  code: string;
  name: string;
  description: string | null;
  languageCode: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  priority: number;
  cooldownMinutes: number | null;
  status: PoiStatus;
  wardId: number | null;
  wardName: string | null;
  busStopId: number | null;
  busStopName: string | null;
  version: number;
}

interface AudioData {
  id: number;
  languageCode: string;
  fileName: string;
  streamUrl: string;
  format: string;
  durationSeconds: number;
}

interface ImageData {
  id: number;
  fileName: string;
  url: string;
  sortOrder: number;
  coverImage: boolean;
}

interface PoiMedia {
  ttsScript: string | null;
  audios: AudioData[];
  images: ImageData[];
}

interface SyncPoi extends PoiData, PoiMedia {
  localizedName: string;
}

interface TourData {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: TourStatus;
  version: number;
  pois: { poiId: number; orderIndex: number }[];
}

interface SyncResponse {
  pois: SyncPoi[];
  tours: TourData[];
}

interface QrResponse {
  poi: PoiMedia & { summary: PoiData };
}

function adaptPoi(data: PoiData, media: PoiMedia, requestedLanguage: string): Poi {
  const { id, name, languageCode, wardName, busStopName } = data;
  const audios: PoiAudio[] = media.audios.map((audio) => ({
    ...audio,
    poiId: id,
    audioUrl: apiUrl(audio.streamUrl),
    isPrerecorded: true,
  }));
  const images: PoiImage[] = media.images.map((image) => ({
    id: image.id,
    poiId: id,
    fileName: image.fileName,
    imageUrl: apiUrl(image.url),
    orderIndex: image.sortOrder,
    isPrimary: image.coverImage,
  }));
  images.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.orderIndex - b.orderIndex);
  return {
    ...data,
    isDeleted: data.status === 'ARCHIVED',
    wardId: data.wardId ?? undefined,
    ward: data.wardId != null && wardName ? { id: data.wardId, name: wardName, district: '', city: '' } : undefined,
    busStopId: data.busStopId ?? undefined,
    busStopName: busStopName ?? undefined,
    cooldownMinutes: data.cooldownMinutes ?? undefined,
    translations: [{
      id, poiId: id, languageCode, title: name,
      description: data.description ?? '', narrationScript: media.ttsScript ?? '',
    }],
    audios: audios.filter((audio) => audio.languageCode === requestedLanguage),
    images,
  };
}

type VisitorTour = Omit<Tour, 'estimatedMinutes'>;

export interface VisitorCatalog {
  pois: Poi[];
  wards: Ward[];
  tours: VisitorTour[];
}

export async function getVisitorCatalog(language: string, signal: AbortSignal): Promise<VisitorCatalog> {
  const response = await requestJson<SyncResponse>(`/api/v1/app/sync?lang=${encodeURIComponent(language)}`, { signal });
  const pois = response.pois.filter((poi) => poi.status === 'PUBLISHED')
    .map((poi) => adaptPoi({ ...poi, name: poi.localizedName }, poi, language));
  const byId = new Map(pois.map((poi) => [poi.id, poi]));
  const wards = new Map<number, Ward>();
  for (const poi of pois) {
    if (poi.ward) wards.set(poi.ward.id, poi.ward);
  }
  const tours: VisitorTour[] = response.tours.filter((tour) => tour.status === 'PUBLISHED').map((tour) => {
    const stops = tour.pois.flatMap(({ poiId, orderIndex }) => {
      const poi = byId.get(poiId);
      return poi ? [{ poi, orderIndex }] : [];
    });
    return {
      ...tour, description: tour.description ?? undefined,

      coverImageUrl: stops[0]?.poi.images?.[0]?.imageUrl,
      pois: stops,
    };
  });
  return { pois, wards: Array.from(wards.values()), tours };
}

export async function resolveVisitorQr(code: string, language: string): Promise<Poi> {
  const response = await requestJson<QrResponse>(
    `/api/v1/app/qr/${encodeURIComponent(code)}?lang=${encodeURIComponent(language)}`,
  );
  return adaptPoi(response.poi.summary, response.poi, language);
}

