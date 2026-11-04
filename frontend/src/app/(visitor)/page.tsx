'use client';

import { useState } from 'react';
import MapView from '@/components/visitor/MapView';
import { MOCK_POIS, MOCK_WARDS } from '@/services/mockData';
import { Poi } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { useAuthStore } from '@/stores/authStore';
import {
  Radio,
  Volume2,
  Search,
  MapPin,
  ExternalLink,
  ChevronRight,
  Heart,
  Navigation,
  Compass,
  Info,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function VisitorHomePage() {
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(MOCK_POIS[0]);
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState<number | 'ALL'>('ALL');

  const { playPoi, autoPlayEnabled, toggleAutoPlay } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useAuthStore();

  const handleSelectPoi = (poi: Poi) => {
    setSelectedPoi(poi);
  };

  const handlePlayPoi = (poi: Poi) => {
    playPoi(poi, true);
  };

  const filteredPois = MOCK_POIS.filter((poi) => {
    const matchSearch = poi.name.toLowerCase().includes(search.toLowerCase());
    const matchWard = selectedWard === 'ALL' || poi.wardId === selectedWard;
    return matchSearch && matchWard;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-900 flex flex-col md:flex-row">
      {/* Mobile Top Header Bar (< md) */}
      <header className="md:hidden absolute top-0 left-0 right-0 z-30 px-4 py-3 bg-gradient-to-b from-slate-950/85 to-transparent flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-Narration Guide
          </h1>
          <p className="text-[11px] text-slate-300">Quận 4: Khánh Hội - Vĩnh Hội - Xóm Chiếu</p>
        </div>

        {/* Công tắc tự động phát GPS (FR-NAR-12) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow">
          <Radio className={`w-3.5 h-3.5 ${autoPlayEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-[11px] font-medium text-slate-200">Tự động phát</span>
          <button
            onClick={toggleAutoPlay}
            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
              autoPlayEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
            title="Bật/Tắt tự động kích hoạt âm thanh khi đến gần"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md"></div>
          </button>
        </div>
      </header>

      {/* Desktop Left Sidebar (>= md) */}
      <aside className="hidden md:flex flex-col w-96 lg:w-[420px] bg-slate-900 border-r border-slate-800 text-white shrink-0 h-[calc(100vh-4rem)] z-20 shadow-xl overflow-hidden">
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/95 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Khám phá Quận 4
              </h2>
              <p className="text-[11px] text-slate-400">Thuyết minh tự động định vị GPS</p>
            </div>

            {/* GPS Auto-play switch */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              <Radio className={`w-3 h-3 ${autoPlayEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-[10px] text-slate-300 font-medium">GPS Auto</span>
              <button
                onClick={toggleAutoPlay}
                className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                  autoPlayEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-600 justify-start'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm điểm di tích, ẩm thực..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Ward filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setSelectedWard('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedWard === 'ALL'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({MOCK_POIS.length})
            </button>
            {MOCK_WARDS.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWard(w.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedWard === w.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                P. {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected POI Spotlight Card on Desktop */}
        {selectedPoi && (
          <div className="p-4 bg-gradient-to-b from-slate-800/90 to-slate-800/40 border-b border-slate-700/80">
            <div className="flex items-start gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={selectedPoi.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=400&q=80'}
                  alt={selectedPoi.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(selectedPoi.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                  title="Yêu thích"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavorite(selectedPoi.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedPoi.ward?.name || 'Quận 4'}
                  </span>
                  <span className="text-[10px] text-slate-400">Cách ~45m</span>
                </div>
                <h3 className="font-bold text-sm text-white line-clamp-1">{selectedPoi.name}</h3>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                  {selectedPoi.translations?.[0]?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/60">
              <button
                onClick={() => handlePlayPoi(selectedPoi)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Nghe ngay
              </button>

              <Link
                href={`/poi/${selectedPoi.id}`}
                className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                Xem chi tiết
              </Link>
            </div>
          </div>
        )}

        {/* POI List Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1 text-[11px] text-slate-400">
            <span>Danh sách điểm đến ({filteredPois.length})</span>
            <span>Bán kính 20 - 300m</span>
          </div>

          {filteredPois.map((poi, idx) => {
            const isSelected = selectedPoi?.id === poi.id;
            return (
              <div
                key={poi.id}
                onClick={() => handleSelectPoi(poi)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <img
                  src={poi.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=200&q=80'}
                  alt={poi.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                      {poi.ward?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">~{(idx + 1) * 50}m</span>
                  </div>
                  <h4 className="font-semibold text-xs text-white truncate">{poi.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {poi.busStop ? `Gần ${poi.busStop.name}` : `Bán kính phát: ${poi.radiusMeters}m`}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPoi(poi);
                  }}
                  className="w-8 h-8 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                  title="Nghe điểm này"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Map (Full screen on mobile, Flex-1 on desktop) */}
      <div className="flex-1 relative h-[calc(100vh-4rem)] overflow-hidden">
        <MapView
          pois={filteredPois}
          selectedPoi={selectedPoi}
          onSelectPoi={handleSelectPoi}
          onPlayPoi={handlePlayPoi}
        />
      </div>
    </div>
  );
}