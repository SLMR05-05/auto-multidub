'use client';

import React, { useState } from 'react';
import { MOCK_HEATMAP_POINTS, MOCK_POIS, HeatmapPoint } from '@/services/mockData';
import {
  Flame,
  ShieldCheck,
  Download,
  Filter,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Eye,
  Info
} from 'lucide-react';

export default function CmsHeatmapAnalyticsPage() {
  const [points, setPoints] = useState<HeatmapPoint[]>(MOCK_HEATMAP_POINTS);
  const [timeRange, setTimeRange] = useState<'TODAY' | '7DAYS' | '30DAYS'>('7DAYS');
  const [timeSlot, setTimeSlot] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [privacyTrimmed, setPrivacyTrimmed] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapPoint | null>(null);

  // Filtered heatmap points
  const filteredPoints = points.filter((p) => {
    const matchesWard = wardFilter === 'ALL' || p.wardName === wardFilter;
    return matchesWard;
  });

  // Transition Flow Matrix (POI A -> POI B)
  const transitionFlows = [
    { from: 'Bến Nhà Rồng', to: 'Cầu Mống', percentage: 42, count: 1450, trend: '+8%' },
    { from: 'Bến Nhà Rồng', to: 'Chợ Xóm Chiếu', percentage: 35, count: 1210, trend: '+12%' },
    { from: 'Cầu Mống', to: 'Chợ Xóm Chiếu', percentage: 28, count: 620, trend: '+4%' },
    { from: 'Chợ Xóm Chiếu', to: 'Nhà thờ Xóm Chiếu', percentage: 51, count: 1590, trend: '+15%' },
    { from: 'Cầu Ông Lãnh Vĩnh Hội', to: 'Phố ẩm thực Vĩnh Khánh', percentage: 64, count: 1240, trend: '+19%' }
  ];

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Ward,Nearby_POI,Latitude,Longitude,Visitors,Intensity_Weight\n' +
      filteredPoints
        .map(
          (p) =>
            `${p.id},"${p.wardName}","${p.nearbyPoi || ''}",${p.latitude},${p.longitude},${p.visitors},${p.weight}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `heatmap_q4_${timeRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Flame className="w-7 h-7 text-amber-500" />
            Bản đồ Nhiệt (Heatmap) & Luồng Di chuyển Du khách
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân tích mật độ tập trung và tuyến dịch chuyển thực địa tại Quận 4 (`FR-ANA-09`, `FR-ANA-10`).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Xuất Báo cáo CSV (`FR-ANA-11`)
          </button>
        </div>
      </div>

      {/* Privacy Alert Banner */}
      <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-sky-900 space-y-0.5">
          <span className="font-bold">Cơ chế Bảo vệ Quyền riêng tư Du khách (`NFR-PRV-01`, `FR-ANA-04`):</span>
          <p className="text-sky-800">
            Hệ thống đã tự động cắt bỏ 100m đầu/cuối của phiên GPS, tổng hợp dữ liệu ẩn danh và ẩn toàn bộ các ô lưới có dưới 5 thiết bị để triệt tiêu nguy cơ định danh nơi cư trú cá nhân.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange('TODAY')}
              className={`px-3 py-1.5 rounded-md transition ${
                timeRange === 'TODAY' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange('7DAYS')}
              className={`px-3 py-1.5 rounded-md transition ${
                timeRange === '7DAYS' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeRange('30DAYS')}
              className={`px-3 py-1.5 rounded-md transition ${
                timeRange === '30DAYS' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              30 ngày qua
            </button>
          </div>

          {/* Time of Day */}
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value as any)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Cả ngày (24h)</option>
            <option value="MORNING">Khung giờ Sáng (06:00 - 11:30)</option>
            <option value="AFTERNOON">Khung giờ Chiều (12:00 - 17:30)</option>
            <option value="EVENING">Khung giờ Tối ẩm thực (18:00 - 23:00)</option>
          </select>

          {/* Ward Filter */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Toàn Quận 4 (3 Phường)</option>
            <option value="Khánh Hội">Phường Khánh Hội</option>
            <option value="Xóm Chiếu">Phường Xóm Chiếu</option>
            <option value="Vĩnh Hội">Phường Vĩnh Hội</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-medium flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyTrimmed}
              onChange={(e) => setPrivacyTrimmed(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            Áp dụng cắt 100m bảo mật
          </label>
        </div>
      </div>

      {/* Heatmap Visualizer Canvas (SVG Overlay on District 4) */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 relative">
        <div className="flex items-center justify-between text-white text-xs mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Mật độ Tọa độ GPS Du khách (District 4 Density Canvas)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Thấp (&lt; 1,000)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Trung bình (1,000 - 2,500)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cao (&gt; 2,500)
            </span>
          </div>
        </div>

        {/* Heatmap SVG */}
        <div className="relative w-full h-96 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 450">
            <defs>
              {/* Radial gradients for heatmap heat spots */}
              <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatMed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatLow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Simulated District 4 Geometrical Map outline */}
            <path
              d="M 120 220 C 180 80, 420 50, 700 120 C 740 280, 580 380, 360 390 C 200 400, 100 320, 120 220 Z"
              fill="#090d16"
              stroke="#1e293b"
              strokeWidth="2.5"
            />

            {/* Canal Lines (Saigon River & Ben Nghe Canal) */}
            <path
              d="M 100 160 Q 350 40 730 110"
              fill="none"
              stroke="#0284c7"
              strokeWidth="4"
              strokeDasharray="6 3"
              opacity="0.4"
            />
            <text x="450" y="70" fill="#38bdf8" fontSize="10" opacity="0.6" fontWeight="bold">
              Kênh Bến Nghé / Sông Sài Gòn
            </text>

            {/* Heatmap Nodes */}
            {filteredPoints.map((pt, idx) => {
              // Convert lat/long to 800x450 canvas
              // District 4 lat: ~10.7600 to 10.7700, long: ~106.6980 to 106.7080
              const normX = ((pt.longitude - 106.698) / (106.708 - 106.698)) * 600 + 100;
              const normY = (1 - (pt.latitude - 10.759) / (10.771 - 10.759)) * 320 + 60;
              const radius = pt.weight > 0.8 ? 55 : pt.weight > 0.6 ? 42 : 32;
              const gradient = pt.weight > 0.8 ? 'url(#heatHigh)' : pt.weight > 0.6 ? 'url(#heatMed)' : 'url(#heatLow)';

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Heat blur ring */}
                  <circle cx={normX} cy={normY} r={radius} fill={gradient} />
                  {/* Core hotspot dot */}
                  <circle
                    cx={normX}
                    cy={normY}
                    r={pt.weight > 0.8 ? 5 : 3.5}
                    fill={pt.weight > 0.8 ? '#f87171' : '#fbbf24'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Label */}
                  {pt.weight > 0.7 && (
                    <text
                      x={normX}
                      y={normY - 10}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow"
                    >
                      {pt.nearbyPoi}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hovered Point Card Popup */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 text-white p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
                {hoveredPoint.nearbyPoi || 'Khu vực mật độ'}
              </div>
              <div className="text-[11px] text-slate-300 mt-1">Phường {hoveredPoint.wardName}</div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-xs">
                <span>Số lượt khách:</span>
                <span className="font-bold text-emerald-400">
                  {hoveredPoint.visitors.toLocaleString()} lượt
                </span>
              </div>
              <div className="flex justify-between text-xs mt-0.5">
                <span>Hệ số mật độ nhiệt:</span>
                <span className="font-mono text-amber-300">{(hoveredPoint.weight * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visitor Transition Flow Model Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transition Flow Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Mô hình Luồng Di chuyển Tiếp nối (Visitor Transition Flow)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tỷ lệ khách sau khi nghe thuyết minh tại POI này di chuyển tiếp tới POI kế tiếp (`FR-ANA-10`).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {transitionFlows.map((flow, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-xs">
                    {flow.from}
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs">
                    {flow.to}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {flow.percentage}% du khách
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {flow.count.toLocaleString()} lượt ({flow.trend})
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${flow.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">Gợi ý Tối ưu Vận hành Thực địa</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="font-bold text-amber-900 block mb-1">
                🔥 Điểm nóng ẩm thực Chợ Xóm Chiếu (18:00 - 22:00):
              </span>
              Lượng truy cập tăng vọt $312\%$ vào buổi tối. Đề xuất bổ sung thêm 2 biển quét mã QR tại các ngõ hẻm ẩm thực đường Lê Văn Linh.
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="font-bold text-emerald-900 block mb-1">
                🚶 Tuyến liên kết Bến Nhà Rồng $\rightarrow$ Cầu Mống ($42\%$):
              </span>
              Tuyến đi bộ dọc kênh Bến Nghé có lưu lượng cao nhất. Khuyến nghị tạo riêng một Tuyến Tour chuyên đề "Ký ức Bến cảng" để dẫn dắt du khách trọn vẹn.
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-900 block mb-1">
                🚌 Trạm dừng xe buýt Cầu Khánh Hội:
              </span>
              $68\%$ du khách quốc tế bắt đầu hành trình từ trạm xe buýt này. Đề xuất cập nhật tờ rơi và banner hướng dẫn cài đặt PWA tại nhà chờ.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
