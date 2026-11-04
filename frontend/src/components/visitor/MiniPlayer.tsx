'use client';

import Link from 'next/link';
import { usePlayerStore } from '@/stores/playerStore';
import { Play, Pause, X, Volume2, ChevronRight } from 'lucide-react';

export default function MiniPlayer() {
  const { currentPoi, isPlaying, progress, pause, resume, stop, audioMode } = usePlayerStore();

  if (!currentPoi) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 z-30 max-w-md w-full md:w-96 shadow-2xl">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-xl border border-slate-700/50 flex flex-col gap-2">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/poi/${currentPoi.id}`}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                  {audioMode}
                </span>
                <span className="text-xs text-slate-400 truncate">Đang phát thuyết minh</span>
              </div>
              <h4 className="text-sm font-semibold truncate text-white">{currentPoi.name}</h4>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => (isPlaying ? pause() : resume())}
              className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={stop}
              className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
