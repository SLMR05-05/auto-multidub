'use client';

import { useState } from 'react';
import { MOCK_POIS, MOCK_WARDS } from '@/services/mockData';
import { Poi } from '@/types';
import {
  Search,
  MapPin,
  Volume2,
  Filter,
  Heart,
  ChevronRight,
  Info,
  Compass,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePlayerStore } from '@/stores/playerStore';
import { useAuthStore } from '@/stores/authStore';

export default function PoiListPage() {
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'NAME'>('DISTANCE');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const { playPoi } = usePlayerStore();
  const { isFavorite, toggleFavorite } = useAuthStore();

  let filteredPois = MOCK_POIS.filter((poi) => {
    const matchSearch =
      poi.name.toLowerCase().includes(search.toLowerCase()) ||
      poi.translations?.some((t) =>
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    const matchWard = selectedWard === 'ALL' || poi.wardId === selectedWard;
    const matchFavorite = !onlyFavorites || isFavorite(poi.id);
    return matchSearch && matchWard && matchFavorite;
  });

  if (sortBy === 'NAME') {
    filteredPois = [...filteredPois].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 pt-4 md:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <Compass className="w-4 h-4" />
              <span>Khám phá văn hóa & lịch sử Quận 4</span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Điểm thuyết minh tự động
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Hệ thống thuyết minh đa ngôn ngữ kích hoạt tự động theo tọa độ GPS và mã QR
            </p>
          </div>

          {/* Stats pills on desktop */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs font-medium">
              📍 <strong className="text-slate-900">{MOCK_POIS.length}</strong> Điểm di tích
            </span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs font-medium">
              🏛️ <strong className="text-slate-900">{MOCK_WARDS.length}</strong> Phường thí điểm
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 border border-slate-200/80 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên di tích, địa danh, lịch sử..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 md:bg-white border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Desktop Sort & Favorites filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy(sortBy === 'DISTANCE' ? 'NAME' : 'DISTANCE')}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Xếp theo: {sortBy === 'DISTANCE' ? 'Khoảng cách' : 'Tên A-Z'}</span>
              </button>

              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap ${
                  onlyFavorites
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Đã thích</span>
              </button>
            </div>
          </div>

          {/* Ward Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Khu vực:
            </span>
            <button
              onClick={() => setSelectedWard('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedWard === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-50 md:bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả ({MOCK_POIS.length})
            </button>
            {MOCK_WARDS.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWard(w.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedWard === w.id
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-50 md:bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Phường {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* POI Cards Responsive Grid (Mobile: Stacked, Desktop: 3-4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filteredPois.map((poi, idx) => {
            const isFav = isFavorite(poi.id);
            const mainImage =
              poi.images?.[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80';
            const distanceMeters = (idx + 1) * 45;

            return (
              <div
                key={poi.id}
                className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-row md:flex-col group"
              >
                {/* Image Section */}
                <div className="relative w-28 h-28 md:w-full md:h-48 shrink-0 overflow-hidden bg-slate-100">
                  <Link href={`/poi/${poi.id}`} className="block w-full h-full">
                    <img
                      src={mainImage}
                      alt={poi.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Gradient overlay on desktop */}
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

                  {/* Distance badge */}
                  <span className="absolute bottom-1.5 right-1.5 md:bottom-2.5 md:left-2.5 md:right-auto bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                    Cách ~{distanceMeters}m
                  </span>

                  {/* Favorite button on desktop card */}
                  <button
                    onClick={() => toggleFavorite(poi.id)}
                    className="hidden md:flex absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs items-center justify-center text-slate-700 hover:text-rose-500 shadow-sm transition-colors"
                    title={isFav ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Card Body */}
                <div className="flex-1 min-w-0 p-3 md:p-5 flex flex-col justify-between">
                  <div>
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {poi.ward?.name}
                      </span>
                      {poi.busStop && (
                        <span className="text-[10px] text-slate-500 truncate">
                          Trạm {poi.busStop.name}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/poi/${poi.id}`}>
                      <h3 className="font-bold text-sm md:text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {poi.name}
                      </h3>
                    </Link>

                    {/* Description Excerpt */}
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {poi.translations?.[0]?.description || 'Điểm tham quan nổi bật tại Quận 4.'}
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{poi.radiusMeters}m</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Mobile favorite button */}
                      <button
                        onClick={() => toggleFavorite(poi.id)}
                        className="md:hidden p-1.5 text-slate-400 hover:text-rose-500"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => playPoi(poi, true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe</span>
                      </button>

                      <Link
                        href={`/poi/${poi.id}`}
                        className="hidden md:flex items-center justify-center p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Xem chi tiết"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPois.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 mt-4">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy địa điểm nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc khu vực.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}