import { create } from 'zustand';

interface FavoriteState {
  favorites: number[];
  toggleFavorite: (poiId: number) => void;
  isFavorite: (poiId: number) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  toggleFavorite: (poiId: number) => {
    const current = get().favorites;
    if (current.includes(poiId)) {
      set({ favorites: current.filter((id) => id !== poiId) });
    } else {
      set({ favorites: [...current, poiId] });
    }
  },

  isFavorite: (poiId: number) => {
    return get().favorites.includes(poiId);
  },
}));

