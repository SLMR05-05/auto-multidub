'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { VisitorCatalogContent } from '@/components/visitor/VisitorCatalog';
import type { Poi } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useAssistantStore } from '@/stores/assistantStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import {
  ArrowLeft,
  Volume2,
  Navigation,
  Sparkles,
  MapPin,
  Clock,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Share2,
  Heart,
  Compass,
  Bus,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export default function PoiDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <VisitorCatalogContent>
      {({ pois }) => {
        const poi = pois.find((item) => String(item.id) === id);
        return poi
          ? <PoiDetailContent key={poi.id} poi={poi} pois={pois} />
          : <p role="alert" className="p-6">Không tìm thấy điểm thuyết minh.</p>;
      }}
    </VisitorCatalogContent>
  );
}

function PoiDetailContent({ poi, pois }: { poi: Poi; pois: Poi[] }) {
  const router = useRouter();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [customQuestion, setCustomQuestion] = useState('');

  const { currentPoi, isPlaying, playPoi, pause, resume, seek, currentTime, duration, playbackRate: playbackSpeed, setPlaybackRate: setPlaybackSpeed } = usePlayerStore();
  const { currentLang } = useLanguageStore();
  const { sendMessage } = useAssistantStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const isCurrentPlaying = currentPoi?.id === poi.id && isPlaying;
  const isFav = isFavorite(poi.id);

  // Tìm bản dịch theo ngôn ngữ đang chọn hoặc Fallback sang tiếng Việt
  const translation =
    poi.translations?.find((t) => t.languageCode === currentLang) ||
    poi.translations?.find((t) => t.languageCode === 'vi') ||
    poi.translations?.[0];

  const handleAskAI = (presetQuestion: string) => {
    sendMessage(presetQuestion, poi.id, currentLang);
    router.push('/assistant');
  };

  const handleCustomAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    sendMessage(customQuestion, poi.id, currentLang);
    router.push('/assistant');
  };

  // Các điểm lân cận cùng phường hoặc ngẫu nhiên
  const nearbyPois = pois.filter((p) => p.id !== poi.id).slice(0, 3);

  const images = poi.images && poi.images.length > 0
    ? poi.images
    : [{ id: 999, poiId: poi.id, imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80', isPrimary: true }];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 pt-0 md:pt-6">
      {/* Mobile Top Navigation Bar (< md) */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-sm text-slate-800 truncate max-w-[200px]">
          {poi.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavorite(poi.id)}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:text-rose-500 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: poi.name, url: window.location.href });
              }
            }}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8">
        {/* Desktop Breadcrumb Navigation (>= md) */}
        <nav className="hidden md:flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Bản đồ</Link>
          <span>/</span>
          <Link href="/list" className="hover:text-emerald-600 transition-colors">Điểm thuyết minh</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-sm">{poi.name}</span>
        </nav>

        {/* 2-Column Split Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Media & Story Content (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Hero Image Section */}
            <div className="relative bg-slate-900 md:rounded-3xl overflow-hidden shadow-sm">
              <div className="relative w-full h-64 sm:h-80 md:h-96">
                <img
                  src={images[activeImageIdx]?.imageUrl || images[0].imageUrl}
                  alt={poi.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                {/* Overlaid Title on Mobile */}
                <div className="md:hidden absolute bottom-3 left-4 right-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    {poi.ward?.name || 'Quận 4'}
                  </span>
                  <h1 className="text-xl font-bold text-white mt-1 drop-shadow-sm">
                    {translation?.title || poi.name}
                  </h1>
                </div>
              </div>

              {/* Gallery Thumbnails (if multiple images) */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-4 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Title & Tags Header */}
            <div className="hidden md:block bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  📍 Phường {poi.ward?.name || 'Quận 4'}
                </span>
                {poi.busStopName && (
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium flex items-center gap-1 border border-sky-100">
                    <Bus className="w-3.5 h-3.5" /> Trạm {poi.busStopName}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  Bán kính phát: {poi.radiusMeters}m
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {translation?.title || poi.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Tọa độ GPS: {poi.latitude.toFixed(4)}°N, {poi.longitude.toFixed(4)}°E
              </p>
            </div>

            {/* Audio Player Card */}
            <div className="px-4 md:px-0">
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2 tracking-wider">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    Trình phát thuyết minh âm thanh
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                      {poi.audios?.[0]?.isPrerecorded ? 'Audio thu âm HD' : 'Giọng đọc AI đa ngữ'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      seek(pos * (duration || 60));
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 h-2.5 rounded-full overflow-hidden cursor-pointer transition-colors"
                  >
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-150"
                      style={{
                        width: `${isCurrentPlaying ? (currentTime / (duration || 1)) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>{isCurrentPlaying ? `${Math.floor(currentTime)}s` : '0:00'}</span>
                    <span>{poi.audios?.[0]?.durationSeconds || 60}s</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2">
                  {/* Speed switch */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {[1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-0.5 rounded-lg transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  {/* Playback action buttons */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button
                      onClick={() => seek(Math.max(0, currentTime - 10))}
                      className="p-2 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
                      title="Lùi 10 giây"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => {
                        if (isCurrentPlaying) {
                          pause();
                        } else if (currentPoi?.id === poi.id) {
                          resume();
                        } else {
                          playPoi(poi, true);
                        }
                      }}
                      className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-7 h-7 fill-current" />
                      ) : (
                        <Play className="w-7 h-7 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => seek(Math.min(duration, currentTime + 10))}
                      className="p-2 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
                      title="Tới 10 giây"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Placeholder for symmetry */}
                  <div className="w-16"></div>
                </div>
              </div>
            </div>

            {/* Story & Historical Content */}
            <div className="px-4 md:px-0">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  Nội dung thuyết minh & Lịch sử
                </h2>

                <div className="prose prose-slate max-w-none text-slate-600 text-sm md:text-base leading-relaxed space-y-4">
                  <p>{translation?.description}</p>

                  {translation?.narrationScript && (
                    <div className="p-4 bg-emerald-50/70 rounded-2xl border-l-4 border-emerald-500 italic text-slate-700 text-xs md:text-sm">
                      <p className="font-semibold text-emerald-800 not-italic mb-1 flex items-center gap-1.5 text-xs">
                        <Volume2 className="w-4 h-4" /> Bản ghi thuyết minh tự động:
                      </p>
                      "{translation.narrationScript}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Assistant & Quick Actions (4-5 cols on lg) */}
          <div className="lg:col-span-5 xl:col-span-4 px-4 md:px-0 space-y-6">
            {/* Quick Actions Card (Desktop & Mobile) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Thao tác nhanh
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors border border-sky-100 text-center"
                >
                  <Navigation className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Chỉ đường Maps</span>
                </a>

                <button
                  onClick={() => toggleFavorite(poi.id)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-colors border text-center ${
                    isFav
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} shrink-0`} />
                  <span>{isFav ? 'Đã yêu thích' : 'Lưu di tích'}</span>
                </button>
              </div>
            </div>

            {/* "Hỏi AI về địa danh này" Contextual Box */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-teal-800/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Hỏi Trợ lý Voice AI
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300">
                      Ngữ cảnh POI
                    </span>
                  </h3>
                  <p className="text-[11px] text-teal-200">Tìm hiểu sâu hơn về {poi.name}</p>
                </div>
              </div>

              {/* Preset Questions Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300 block">
                  Câu hỏi gợi ý:
                </span>
                <div className="space-y-1.5">
                  {[
                    'Địa danh này được xây dựng năm nào?',
                    'Có những huyền tích lịch sử nào ở đây?',
                    'Xung quanh đây có món ngon nào?',
                    'Giờ mở cửa và vé tham quan ra sao?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskAI(q)}
                      className="w-full text-left text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-2 rounded-xl border border-slate-700/80 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">💬 {q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Ask AI Form */}
              <form onSubmit={handleCustomAskAI} className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Hỏi bất kỳ điều gì về điểm này..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Nearby POIs in District 4 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Điểm di tích lân cận
              </h3>

              <div className="space-y-2.5">
                {nearbyPois.map((item) => (
                  <Link
                    key={item.id}
                    href={`/poi/${item.id}`}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                  >
                    <img
                      src={item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.ward?.name} • Bán kính {item.radiusMeters}m
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}