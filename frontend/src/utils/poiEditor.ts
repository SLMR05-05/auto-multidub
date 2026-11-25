import type { CmsGeofence, PoiInput, TranslationInput } from '../services/cmsPois';
import { calculateHaversineDistance } from './geofenceEngine';

export function overlappingPois(poi: Pick<PoiInput, 'latitude' | 'longitude' | 'radiusMeters'>,
  others: CmsGeofence[], id?: number) {
  return others.filter((other) => other.id !== id && other.status !== 'ARCHIVED')
    .map((other) => ({ ...other, distance: calculateHaversineDistance(
      poi.latitude, poi.longitude, other.latitude, other.longitude) }))
    .filter((other) => other.distance <= poi.radiusMeters + other.radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

export function mediaFileError(file: File, kind: 'image' | 'audio'): string | null {
  const extensions = kind === 'image' ? ['jpg', 'jpeg', 'png', 'webp'] : ['mp3', 'm4a', 'aac'];
  const limit = kind === 'image' ? 5 : 20;
  if (!extensions.includes(file.name.split('.').pop()?.toLowerCase() ?? '')) {
    return `${file.name}: định dạng hỗ trợ ${extensions.join(', ')}.`;
  }
  if (!file.size || file.size > limit * 1024 * 1024) {
    return `${file.name}: file phải có dữ liệu và không vượt quá ${limit} MB.`;
  }
  return null;
}

/** Empty optional tabs are omitted; partially entered content must have a title. */
export function prepareTranslations(values: Record<string, TranslationInput>, baseName: string) {
  const result: Record<string, TranslationInput> = {};
  for (const [language, value] of Object.entries(values)) {
    const translation = {
      name: value.name.trim() || (language === 'vi' ? baseName.trim() : ''),
      description: value.description.trim(), ttsScript: value.ttsScript.trim(),
    };
    if (!translation.name && !translation.description && !translation.ttsScript) continue;
    if (!translation.name) throw new Error(`Cần nhập tiêu đề cho ngôn ngữ ${language}.`);
    result[language] = translation;
  }
  return result;
}
