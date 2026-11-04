'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin, Sliders, AlertTriangle, Check, Layers } from 'lucide-react';
import { MOCK_POIS, MOCK_WARDS, MOCK_BUS_STOPS } from '@/services/mockData';

export default function CmsPoiEditorPage() {
  const router = useRouter();

  const [code, setCode] = useState('POI_DEMO_KH01');
  const [name, setName] = useState('Di tích Lịch sử Cầu Khánh Hội');
  const [wardId, setWardId] = useState(1);
  const [busStopId, setBusStopId] = useState(1);
  const [latitude, setLatitude] = useState(10.7681);
  const [longitude, setLongitude] = useState(106.7052);
  const [radiusMeters, setRadiusMeters] = useState(50);
  const [priority, setPriority] = useState(3);
  const [cooldownMinutes, setCooldownMinutes] = useState(30);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      router.push('/cms/poi');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cms/poi"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Soạn thảo POI & Cấu hình Geofence</h1>
            <p className="text-xs text-slate-500 mt-0.5">Thiết lập tọa độ, bán kính kích hoạt và mức ưu tiên phát âm thanh</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          Lưu thông tin POI
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> Đã lưu thông tin POI thành công vào CSDL!
        </div>
      )}

      {/* Editor Grid: Left = Form, Right = Interactive Geofence Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            1. Thông tin cơ bản & Phân cấp hành chính
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mã POI (Unique code)</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tên địa danh (Tiếng Việt)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phường trực thuộc</label>
              <select
                value={wardId}
                onChange={(e) => setWardId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                {MOCK_WARDS.map((w) => (
                  <option key={w.id} value={w.id}>
                    P. {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Trạm xe buýt gần nhất</label>
              <select
                value={busStopId}
                onChange={(e) => setBusStopId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                {MOCK_BUS_STOPS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-2">
            2. Tọa độ GPS & Tham số Geofence (P1 - P5)
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Kinh độ (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Slider Bán kính Geofence */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Bán kính kích hoạt Geofence (PRD P1: 20m – 300m):
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {radiusMeters} mét
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>20m (Tối thiểu)</span>
              <span>50m (Mặc định chuẩn)</span>
              <span>300m (Trục đại lộ)</span>
            </div>
          </div>

          {/* Priority & Cooldown Override */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mức ưu tiên (Priority 1-5)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={5}>5 (Cao nhất - Di tích biểu tượng)</option>
                <option value={4}>4 (Cao)</option>
                <option value={3}>3 (Trung bình - Mặc định)</option>
                <option value={2}>2 (Thấp)</option>
                <option value={1}>1 (Rất thấp)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Thời gian Cooldown (Phút)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Right Map Canvas (Live Radius Preview) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Mô phỏng Vùng phủ Geofence trực quan
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Bản đồ vệ tinh/phố</span>
            </div>

            {/* Simulated Live Map Canvas */}
            <div className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center select-none">
              <div className="absolute inset-0 bg-[#0f172a] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px]"></div>

              {/* Dynamic Geofence Circle based on radiusMeters slider */}
              <div
                className="rounded-full border-2 border-emerald-400 bg-emerald-500/20 transition-all duration-200 flex items-center justify-center relative shadow-lg shadow-emerald-500/20"
                style={{
                  width: `${Math.min(260, Math.max(70, radiusMeters * 1.4))}px`,
                  height: `${Math.min(260, Math.max(70, radiusMeters * 1.4))}px`,
                }}
              >
                {/* Center Pin */}
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-300/40">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>

                {/* Radius label */}
                <span className="absolute -bottom-6 bg-slate-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                  R = {radiusMeters}m
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-800 mt-4 flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              Bán kính <strong>{radiusMeters} mét</strong> là hợp lý, không chồng lấn với các điểm di tích lân cận trong cùng khu vực Phường {MOCK_WARDS[wardId - 1]?.name}.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
