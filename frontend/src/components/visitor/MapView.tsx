'use client';

import { useEffect, useState } from 'react';
import { Poi } from '@/types';
import { MapPin, Navigation, Volume2, Info, Compass, Layers } from 'lucide-react';
import Link from 'next/link';

interface MapViewProps {
  pois: Poi[];
  onSelectPoi: (poi: Poi) => void;
  selectedPoi: Poi | null;
  onPlayPoi: (poi: Poi) => void;
}

export default function MapView({ pois, onSelectPoi, selectedPoi, onPlayPoi }: MapViewProps) {
  // Tọa độ người dùng mặc định tại Quận 4 (gần Khánh Hội/Nhà Rồng)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 10.7670,
    lng: 106.7050,
  });

  // Tìm POI gần nhất
  const nearestPoi = pois[0];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-full bg-slate-900 overflow-hidden select-none">
      {/* Giả lập Bản đồ Vệ tinh / Đường phố SVG tương tác cao */}
      <div className="absolute inset-0 bg-[#0f172a] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Bản đồ Kênh Bến Nghé & Sông Sài Gòn */}
        <svg className="w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Đường sông/kênh */}
          <path
            d="M 0,220 C 150,210 280,180 450,240 C 600,290 750,200 900,180"
            fill="none"
            stroke="#0284c7"
            strokeWidth="38"
            strokeLinecap="round"
          />
          {/* Cầu bắc qua */}
          <line x1="280" y1="160" x2="300" y2="230" stroke="#94a3b8" strokeWidth="8" />
          <line x1="420" y1="210" x2="440" y2="280" stroke="#94a3b8" strokeWidth="8" />
        </svg>

        {/* Các vòng rào Geofence của các POI */}
        {pois.map((poi, idx) => {
          // Tính tọa độ offset tương đối trên màn hình mô phỏng
          const x = 35 + ((poi.longitude - 106.703) * 8000) % 65;
          const y = 30 + ((10.770 - poi.latitude) * 7000) % 55;
          const isSelected = selectedPoi?.id === poi.id;

          return (
            <div
              key={poi.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onSelectPoi(poi)}
            >
              {/* Geofence Radar Circle */}
              <div
                className={`rounded-full border transition-all duration-500 flex items-center justify-center ${
                  isSelected
                    ? 'w-32 h-32 bg-emerald-500/20 border-emerald-400 border-2 animate-pulse'
                    : 'w-20 h-20 bg-emerald-500/10 border-emerald-500/30 group-hover:border-emerald-400'
                }`}
              >
                {/* Marker Pin */}
                <div
                  className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-transform ${
                    isSelected
                      ? 'bg-emerald-500 text-white scale-125 ring-4 ring-emerald-300/40'
                      : 'bg-white text-emerald-700 hover:scale-110'
                  }`}
                >
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </div>

              {/* Tên POI Tooltip */}
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow backdrop-blur-sm pointer-events-none border border-slate-700">
                {poi.name.split('-')[0].trim()}
              </div>
            </div>
          );
        })}

        {/* User GPS Pulse */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          style={{ left: '48%', top: '52%' }}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-60"></span>
            <div className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-xl px-3 py-1.5 shadow pointer-events-auto flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="font-medium text-emerald-400">GPS Sẵn sàng</span>
          <span className="text-slate-400">| Q.4, TP.HCM</span>
        </div>

        <button
          onClick={() => setUserLocation({ lat: 10.7670, lng: 106.7050 })}
          className="w-10 h-10 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center pointer-events-auto hover:bg-slate-50 active:scale-95 transition-all"
          title="Về vị trí của tôi"
        >
          <Navigation className="w-5 h-5 text-emerald-600 fill-emerald-100" />
        </button>
      </div>

      {/* Bottom Sheet Modal when selecting a POI */}
      {selectedPoi && (
        <div className="md:hidden absolute bottom-4 left-3 right-3 z-30 max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            {selectedPoi.images && selectedPoi.images[0] ? (
              <img
                src={selectedPoi.images[0].imageUrl}
                alt={selectedPoi.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {selectedPoi.ward?.name || 'Quận 4'}
                </span>
                <span className="text-xs text-slate-500">Cách bạn ~45m</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1 leading-snug">
                {selectedPoi.name}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {selectedPoi.translations?.[0]?.description || 'Chưa có bài giới thiệu.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => onPlayPoi(selectedPoi)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow hover:bg-emerald-700 active:scale-98 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Nghe thuyết minh ngay
            </button>

            <Link
              href={`/poi/${selectedPoi.id}`}
              className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              <Info className="w-4 h-4" />
              Chi tiết
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
