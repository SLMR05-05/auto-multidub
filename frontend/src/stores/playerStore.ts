'use client';

import { create } from 'zustand';
import type { Poi, AudioMode } from '@/types';

interface PlayerState {
  currentPoi: Poi | null;
  isPlaying: boolean;
  audioMode: AudioMode;
  progress: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  error: string | null;
  autoPlayEnabled: boolean;
  cooldowns: Record<number, number>;

  playPoi: (poi: Poi, manual?: boolean) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleAutoPlay: () => void;
  isCooldown: (poiId: number) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  let audio: HTMLAudioElement | null = null;
  let speech: SpeechSynthesisUtterance | null = null;
  let generation = 0;

  function release() {
    generation += 1;
    if (audio) {
      const previous = audio;
      audio = null;
      previous.pause();
      previous.removeAttribute('src');
      previous.load();
    }
    if (speech) {
      speech = null;
      window.speechSynthesis.cancel();
    }
  }

  function markStarted(poi: Poi) {
    set((state) => ({ isPlaying: true, error: null, cooldowns: { ...state.cooldowns, [poi.id]: Date.now() } }));
  }

  function startSpeech(poi: Poi) {
    const translation = poi.translations?.[0];
    const text = translation?.narrationScript.trim();
    if (!text || !('speechSynthesis' in window)) {
      set({ isPlaying: false, error: 'Điểm này chưa có nội dung âm thanh khả dụng.' });
      return;
    }
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = translation?.languageCode ?? 'vi';
    voice.rate = get().playbackRate;
    speech = voice;
    set({ audioMode: 'TTS', currentTime: 0, duration: 0, progress: 0 });
    voice.onstart = () => { if (speech === voice) markStarted(poi); };
    voice.onend = () => {
      if (speech !== voice) return;
      speech = null;
      set({ isPlaying: false, progress: 100 });
    };
    voice.onerror = () => {
      if (speech !== voice) return;
      speech = null;
      set({ isPlaying: false, error: 'Trình duyệt không thể đọc bài thuyết minh.' });
    };
    window.speechSynthesis.speak(voice);
  }

  return {
    currentPoi: null,
    isPlaying: false,
    audioMode: 'PRERECORDED',
    progress: 0,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    error: null,
    autoPlayEnabled: true,
    cooldowns: {},

    isCooldown: (poiId) => {
      const lastPlayed = get().cooldowns[poiId];
      return lastPlayed != null && Date.now() - lastPlayed < 30 * 60 * 1000;
    },

    playPoi: (poi, manual = false) => {
      if (!manual && get().isCooldown(poi.id)) return;
      release();
      const source = poi.audios?.[0];
      set({
        currentPoi: poi, isPlaying: false, error: null, currentTime: 0, progress: 0,
        duration: source?.durationSeconds ?? 0, audioMode: source ? 'PRERECORDED' : 'TTS',
      });
      if (!source) {
        startSpeech(poi);
        return;
      }
      const player = new Audio(source.audioUrl);
      audio = player;
      const current = generation;
      player.playbackRate = get().playbackRate;
      function updateProgress() {
        if (audio !== player || !Number.isFinite(player.duration) || player.duration <= 0) return;
        set({ currentTime: player.currentTime, duration: player.duration,
          progress: Math.min(100, 100 * player.currentTime / player.duration) });
      }
      player.addEventListener('loadedmetadata', updateProgress);
      player.addEventListener('timeupdate', updateProgress);
      player.addEventListener('playing', () => { if (audio === player) markStarted(poi); });
      player.addEventListener('ended', () => { if (audio === player) set({ isPlaying: false }); });
      player.addEventListener('error', () => {
        if (audio !== player) return;
        release();
        startSpeech(poi);
      });
      void player.play().catch((failure: unknown) => {
        if (generation !== current || audio !== player) return;
        if (failure instanceof DOMException && failure.name === 'NotAllowedError') {
          set({ isPlaying: false, error: 'Bấm Phát để cho phép trình duyệt mở âm thanh.' });
        } else if (player.error) {
          release();
          startSpeech(poi);
        } else {
          set({ isPlaying: false, error: 'Không phát được âm thanh. Vui lòng thử lại.' });
        }
      });
    },

    pause: () => {
      audio?.pause();
      if (speech) window.speechSynthesis.pause();
      set({ isPlaying: false });
    },
    resume: () => {
      const player = audio;
      if (player) {
        void player.play().catch(() => {
          if (audio === player) set({ isPlaying: false, error: 'Không thể tiếp tục phát âm thanh.' });
        });
      } else if (speech) {
        window.speechSynthesis.resume();
        set({ isPlaying: true });
      } else {
        const poi = get().currentPoi;
        if (poi) get().playPoi(poi, true);
      }
    },
    stop: () => {
      release();
      set({ isPlaying: false, currentPoi: null, currentTime: 0, duration: 0, progress: 0, error: null });
    },
    seek: (seconds) => {
      if (audio && Number.isFinite(seconds) && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
      }
    },
    setPlaybackRate: (rate) => {
      if (audio) audio.playbackRate = rate;
      set({ playbackRate: rate });
    },
    toggleAutoPlay: () => set((state) => ({ autoPlayEnabled: !state.autoPlayEnabled })),
  };
});
