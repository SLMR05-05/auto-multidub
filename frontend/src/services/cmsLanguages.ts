import type { Language } from '@/types';
import { requestJson } from './api';

interface BackendLanguage { code: string; name: string; nativeName: string; ttsLocale: string }

export function listCmsLanguages(signal?: AbortSignal) {
  return requestJson<BackendLanguage[]>('/api/v1/languages', { signal }).then((items) =>
    items.map((item, index) => ({
      id: index + 1,
      code: item.code,
      name: item.name,
      nativeName: item.nativeName,
      localeTts: item.ttsLocale,
      isActive: true,
      isDefault: item.code === 'vi',
      orderIndex: index + 1,
    } as Language)),
  );
}