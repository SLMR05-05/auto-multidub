import { create } from 'zustand';
import { Language } from '@/types';
import { listCmsLanguages } from '@/services/cmsLanguages';

interface LanguageState {
  currentLang: string; // 'vi', 'en', ...
  languages: Language[];
  setLanguage: (code: string) => void;
  toggleLanguageActive: (id: number) => void;
  addLanguage: (lang: Omit<Language, 'id'>) => void;
  getActiveLanguages: () => Language[];
  loadLanguages: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLang: 'vi',
  languages: [],
  loadLanguages: async () => {
    try {
      const languages = await listCmsLanguages();
      set({ languages });
    } catch {
      // Keep the UI usable even if the language endpoint is unavailable.
    }
  },

  setLanguage: (code: string) => {
    const found = get().languages.find((l) => l.code === code && l.isActive);
    if (found) {
      set({ currentLang: code });
    }
  },

  toggleLanguageActive: (id: number) => {
    set((state) => ({
      languages: state.languages.map((l) => {
        if (l.id === id) {
          // Tiếng Việt là bắt buộc không thể tắt
          if (l.isDefault) return l;
          return { ...l, isActive: !l.isActive };
        }
        return l;
      }),
    }));
  },

  addLanguage: (newLang) => {
    set((state) => ({
      languages: [
        ...state.languages,
        {
          ...newLang,
          id: Math.max(...state.languages.map((l) => l.id), 0) + 1,
        },
      ],
    }));
  },

  getActiveLanguages: () => {
    return get().languages.filter((l) => l.isActive);
  },
}));

if (typeof window !== 'undefined') {
  void useLanguageStore.getState().loadLanguages();
}
