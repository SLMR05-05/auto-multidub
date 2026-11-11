'use client';

import { create } from 'zustand';
import type { Poi, AudioMode } from '@/types';
import { apiUrl } from '@/services/api';

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'web-visitor-default';
  try {
    let id = localStorage.getItem('seminar.visitor.device_id');
    if (!id) {
      id = 'dev-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 18) : Math.random().toString(36).substring(2, 12));
      localStorage.setItem('seminar.visitor.device_id', id);
    }
    return id;
  } catch {
    return 'web-visitor-default';
  }
}

export function getClientPlatform() {
  if (typeof window === 'undefined') return { deviceType: 'WEB', osVersion: 'Web' };
  const ua = navigator.userAgent;
  let os = 'Windows';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone;
  const isApp = Boolean(isStandalone || /AutoMultidubApp|wv/i.test(ua));
  return {
    deviceType: isApp ? 'APP' : 'WEB',
    osVersion: os,
  };
}

async function reportPlayback(log: {
  poiId: number;
  triggerType: 'MANUAL' | 'GPS' | 'QR';
  audioMode: 'PRERECORDED' | 'TTS';
  languageCode: string;
  startTime: Date;
  listenedSeconds: number;
  completed: boolean;
}) {
  try {
    const platform = getClientPlatform();
    const payload = {
      logs: [
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          deviceId: getDeviceId(),
          poiId: log.poiId,
          triggerType: log.triggerType,
          audioMode: log.audioMode,
          languageCode: log.languageCode || 'vi',
          startTime: log.startTime.toISOString().slice(0, 19),
          endTime: new Date().toISOString().slice(0, 19),
          listenedSeconds: Math.max(0, Math.round(log.listenedSeconds)),
          completed: log.completed,
          deviceType: platform.deviceType,
          osVersion: platform.osVersion,
        },
      ],
    };
    await fetch(apiUrl('/api/v1/app/playback-logs'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Fail silently so telemetry never interferes with player UI
  }
}

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

  playPoi: (poi: Poi, manual?: boolean, trigger?: 'MANUAL' | 'GPS' | 'QR') => void;
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
  let activeSession: {
    poi: Poi;
    trigger: 'MANUAL' | 'GPS' | 'QR';
    mode: 'PRERECORDED' | 'TTS';
    start: Date;
    reported: boolean;
  } | null = null;

  function flushPlayback(completed = false) {
    if (!activeSession || activeSession.reported) return;
    const session = activeSession;
    session.reported = true;
    const listened = Math.round(audio ? audio.currentTime : get().currentTime);
    if (listened < 2 && !completed) return;

    const translation = session.poi.translations?.[0];
    const lang = translation?.languageCode ?? 'vi';

    void reportPlayback({
      poiId: session.poi.id,
      triggerType: session.trigger,
      audioMode: session.mode,
      languageCode: lang,
      startTime: session.start,
      listenedSeconds: completed && Number.isFinite(audio?.duration) ? Math.round(audio!.duration) : listened,
      completed,
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => flushPlayback(false));
    window.addEventListener('pagehide', () => flushPlayback(false));
  }

  function release() {
    flushPlayback(false);
    activeSession = null;
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
      flushPlayback(true);
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

    playPoi: (poi, manual = false, trigger) => {
      if (!manual && get().isCooldown(poi.id)) return;
      release();
      const source = poi.audios?.[0];
      const triggerType: 'MANUAL' | 'GPS' | 'QR' = trigger ?? (manual ? 'MANUAL' : 'GPS');
      const mode: 'PRERECORDED' | 'TTS' = source ? 'PRERECORDED' : 'TTS';

      activeSession = {
        poi,
        trigger: triggerType,
        mode,
        start: new Date(),
        reported: false,
      };

      set({
        currentPoi: poi, isPlaying: false, error: null, currentTime: 0, progress: 0,
        duration: source?.durationSeconds ?? 0, audioMode: mode,
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
      player.addEventListener('ended', () => {
        if (audio === player) {
          flushPlayback(true);
          set({ isPlaying: false });
        }
      });
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
