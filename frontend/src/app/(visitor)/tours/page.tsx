'use client';

import { MOCK_TOURS } from '@/services/mockData';
import {
  Compass,
  Clock,
  MapPin,
  ChevronRight,
  Play,
  Navigation,
  Sparkles,
  Route,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { usePlayerStore } from '@/stores/playerStore';

export default function ToursPage() {
  const { playPoi } = usePlayerStore();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 pt-4 md:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <Compass className="w-4 h-4" />
              <span>Hành trình khám phá trọn vẹn</span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Tuyến Tour tham quan theo chủ đề
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Các lộ trình nối tuyến tối ưu với thuyết minh GPS tự động tuần tự qua từng trạm dừng
            </p>
          </div>

          {/* Stats pill on desktop */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
            <span className="bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-xs font-medium">
              🧭 <strong className="text-slate-900">{MOCK_TOURS.length}</strong> Tuyến tour sẵn sàng
            </span>
          </div>
        </div>

        {/* Tour Cards Grid (Mobile: 1 col, Desktop: 2-3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {MOCK_TOURS.map((tour) => {
            const stopCount = tour.pois?.length || 0;
            const firstPoiId = tour.pois?.[0]?.poi.id;

            return (
              <div
                key={tour.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 sm:h-48 bg-slate-900 overflow-hidden">
                    <img
                      src={tour.coverImageUrl}
                      alt={tour.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow">
                        Tour chủ đề
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="flex items-center gap-3 text-emerald-300 text-[11px] font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{tour.estimatedMinutes} phút
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {stopCount} trạm dừng
                        </span>
                      </div>
                      <h3 className="font-bold text-base md:text-lg text-white drop-shadow-xs">
                        {tour.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-5 md:p-6 pb-2">
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
                      {tour.description}
                    </p>

                    {/* Waypoints Sequence List */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>Lộ trình các trạm dừng:</span>
                        <span className="text-[10px] text-emerald-600 font-semibold lowercase">
                          tự động nối tuyến
                        </span>
                      </div>

                      <div className="space-y-2 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-100">
                        {tour.pois?.map((item, idx) => (
                          <div
                            key={item.poi.id}
                            className="relative flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 group/stop"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate group-hover/stop:text-emerald-700 transition-colors">
                                {item.poi.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {item.poi.ward?.name} • Bán kính {item.poi.radiusMeters}m
                              </p>
                            </div>
                            <button
                              onClick={() => playPoi(item.poi, true)}
                              className="p-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold transition-colors"
                              title="Nghe điểm này"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tour Start CTA */}
                <div className="p-5 md:p-6 pt-0">
                  <Link
                    href={`/poi/${firstPoiId || 1}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                  >
                    <span>Bắt đầu hành trình Tour</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}