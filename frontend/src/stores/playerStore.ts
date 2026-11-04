import { create } from 'zustand';
import { Poi, AudioMode } from '@/types';

interface PlayerState {
  currentPoi: Poi | null;
  isPlaying: boolean;
  audioMode: AudioMode;
  progress: number; // 0 - 100
  currentTime: number; // seconds
  duration: number; // seconds
  autoPlayEnabled: boolean;
  cooldowns: Record<number, number>; // poiId -> timestamp milliseconds

  playPoi: (poi: Poi, manual?: boolean) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  toggleAutoPlay: () => void;
  isCooldown: (poiId: number) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentPoi: null,
  isPlaying: false,
  audioMode: 'PRERECORDED',
  progress: 0,
  currentTime: 0,
  duration: 60,
  autoPlayEnabled: true,
  cooldowns: {},

  isCooldown: (poiId: number) => {
    const lastPlayed = get().cooldowns[poiId];
    if (!lastPlayed) return false;
    // 30 minutes cooldown (30 * 60 * 1000)
    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - lastPlayed < thirtyMinutes;
  },

  playPoi: (poi: Poi, manual = false) => {
    // If not manual, check cooldown
    if (!manual && get().isCooldown(poi.id)) {
      console.log(`POI ${poi.id} is in cooldown, skipping auto-play`);
      return;
    }

    const hasAudio = !!(poi.audios && poi.audios.length > 0);
    const duration = poi.audios?.[0]?.durationSeconds ?? 45;

    // Record cooldown timestamp
    set((state) => ({
      currentPoi: poi,
      isPlaying: true,
      audioMode: hasAudio ? 'PRERECORDED' : 'TTS',
      currentTime: 0,
      progress: 0,
      duration: duration,
      cooldowns: {
        ...state.cooldowns,
        [poi.id]: Date.now(),
      },
    }));
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false, currentPoi: null, currentTime: 0, progress: 0 }),
  seek: (seconds: number) => {
    const duration = get().duration || 1;
    set({
      currentTime: seconds,
      progress: Math.min(100, Math.max(0, (seconds / duration) * 100)),
    });
  },
  toggleAutoPlay: () => set((state) => ({ autoPlayEnabled: !state.autoPlayEnabled })),
}));
