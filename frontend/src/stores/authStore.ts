import { create } from 'zustand';
import { AppUser } from '@/types';

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  favorites: number[]; // Array of POI ids
  loginWithEmail: (email: string, pass: string) => boolean;
  loginWithGoogle: () => void;
  loginWithApple: () => void;
  loginWithFacebook: () => void;
  register: (fullName: string, email: string, pass: string) => boolean;
  logout: () => void;
  toggleFavorite: (poiId: number) => void;
  isFavorite: (poiId: number) => boolean;
}

const DEFAULT_USER: AppUser = {
  id: 101,
  email: 'dukhach@gmail.com',
  fullName: 'Nguyễn Văn Du Khách',
  role: 'USER',
  isActive: true,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  provider: 'GOOGLE',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  favorites: [1, 2], // Mặc định thích Bến Nhà Rồng, Chợ Xóm Chiếu

  loginWithEmail: (email: string) => {
    const newUser: AppUser = {
      id: Date.now(),
      email,
      fullName: email.split('@')[0],
      role: 'USER',
      isActive: true,
      provider: 'LOCAL',
    };
    set({ user: newUser, isAuthenticated: true });
    return true;
  },

  loginWithGoogle: () => {
    set({
      user: {
        id: Date.now(),
        email: 'traveler.google@gmail.com',
        fullName: 'Alex Nguyễn (Google)',
        role: 'USER',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        provider: 'GOOGLE',
      },
      isAuthenticated: true,
    });
  },

  loginWithApple: () => {
    set({
      user: {
        id: Date.now(),
        email: 'traveler.apple@privaterelay.appleid.com',
        fullName: 'Apple Explorer',
        role: 'USER',
        isActive: true,
        provider: 'APPLE',
      },
      isAuthenticated: true,
    });
  },

  loginWithFacebook: () => {
    set({
      user: {
        id: Date.now(),
        email: 'traveler.fb@facebook.com',
        fullName: 'Minh Travel (Facebook)',
        role: 'USER',
        isActive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
        provider: 'FACEBOOK',
      },
      isAuthenticated: true,
    });
  },

  register: (fullName: string, email: string) => {
    const newUser: AppUser = {
      id: Date.now(),
      email,
      fullName,
      role: 'USER',
      isActive: true,
      provider: 'LOCAL',
    };
    set({ user: newUser, isAuthenticated: true });
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

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

