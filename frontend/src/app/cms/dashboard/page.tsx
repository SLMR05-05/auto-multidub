'use client';

import {
  Users,
  Volume2,
  QrCode,
  CheckCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { MOCK_POIS } from '@/services/mockData';

export default function CmsDashboardPage() {
  const stats = [
    { label: 'Tổng phiên truy cập', val: '2,840', sub: '+18.4% tuần này', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Lượt nghe hợp lệ (≥ 5s)', val: '1,920', sub: 'Tỷ lệ nghe 67.6%', icon: Volume2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lượt quét mã QR trạm buýt', val: '430', sub: '22.4% tổng kích hoạt', icon: QrCode, color: 'text-purple-600 bg-purple-50' },
    { label: 'Tỷ lệ nghe hết bài (≥ 95%)', val: '71.2%', sub: 'Mục tiêu PRD ≥ 60%', icon: CheckCircle, color: 'text-amber-600 bg-amber-50' },
  ];

  const topQuestions = [
    { q: 'Bến Nhà Rồng có mở cửa buổi tối không?', count: 184, lang: 'vi' },
    { q: 'What street food is famous in Xom Chieu?', count: 142, lang: 'en' },
    { q: 'Xe buýt nào đi qua Chợ Xóm Chiếu?', count: 98, lang: 'vi' },
    { q: 'Is there an entrance fee for Nha Rong Wharf?', count: 76, lang: 'en' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bảng điều khiển Thống kê Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu ẩn danh giám sát lưu lượng du khách và tương tác Voice AI thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Kỳ báo cáo:</span>
          <select className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none">
            <option>7 ngày gần nhất</option>
            <option>30 ngày gần nhất</option>
            <option>Hôm nay</option>
          </select>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.val}</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> {s.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Grid: Voice AI Stats & Trigger Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice AI Interactions (Tính năng MỚI) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Thống kê Tương tác Trợ lý Voice AI
              </h2>
              <p className="text-xs text-slate-500">Các câu hỏi du khách thường đặt bằng giọng nói theo ngữ cảnh</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              520 lượt hỏi thoại
            </span>
          </div>

          <div className="space-y-3">
            {topQuestions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">"{item.q}"</p>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Ngôn ngữ: {item.lang}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">{item.count}</span>
                  <span className="text-[10px] text-slate-400 block">lượt hỏi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger Distribution Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900 mb-1">Cơ cấu nguồn kích hoạt</h2>
            <p className="text-xs text-slate-500 mb-4">Phân bổ giữa GPS, QR và Nghe thủ công</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Tự động GPS Geofence</span>
                  <span className="text-slate-800">58.2% (1,118 lượt)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '58.2%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-purple-700">Quét mã QR trạm buýt</span>
                  <span className="text-slate-800">22.4% (430 lượt)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '22.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700">Bấm nghe thủ công (Manual)</span>
                  <span className="text-slate-800">19.4% (372 lượt)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '19.4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mt-4 text-[11px] text-slate-600">
            💡 Tỷ lệ kích hoạt tự động bằng GPS đạt chuẩn PRD $K1 \ge 90\%$ độ chính xác.
          </div>
        </div>
      </div>

      {/* Top POIs Ranking Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <h2 className="font-bold text-sm text-slate-900 mb-3">Xếp hạng điểm thuyết minh nghe nhiều nhất (Top POIs)</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Thứ hạng</th>
                <th className="py-2.5 px-3">Tên điểm POI</th>
                <th className="py-2.5 px-3">Phường</th>
                <th className="py-2.5 px-3">Lượt nghe</th>
                <th className="py-2.5 px-3">Thời gian nghe TB</th>
                <th className="py-2.5 px-3">Tỷ lệ nghe hết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_POIS.map((poi, idx) => (
                <tr key={poi.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-700">#{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{poi.name}</td>
                  <td className="py-3 px-3 text-slate-600">{poi.ward?.name}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{780 - idx * 190}</td>
                  <td className="py-3 px-3 text-slate-600">54 giây</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                      {78 - idx * 6}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
