'use client';

import React, { useState } from 'react';
import { MOCK_QR_CODES, MOCK_POIS, MOCK_BUS_STOPS } from '@/services/mockData';
import { QrCode, Poi, BusStop } from '@/types';
import {
  QrCode as QrIcon,
  Plus,
  Search,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart2,
  ToggleLeft,
  ToggleRight,
  X,
  Eye,
  Info
} from 'lucide-react';

export default function CmsQrCodeStudioPage() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>(MOCK_QR_CODES);
  const [search, setSearch] = useState('');
  const [selectedPoiFilter, setSelectedPoiFilter] = useState<number | 'ALL'>('ALL');
  const [selectedQrForPrint, setSelectedQrForPrint] = useState<QrCode | null>(MOCK_QR_CODES[0]);

  // Modal Generator State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPoiId, setNewPoiId] = useState<number>(MOCK_POIS[0]?.id || 1);
  const [newBusStopId, setNewBusStopId] = useState<number | undefined>(MOCK_BUS_STOPS[0]?.id);
  const [newLabel, setNewLabel] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate random Base62 string (length 8)
  const generateBase62 = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'q4';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const openGenerator = () => {
    const code = generateBase62();
    setGeneratedCode(code);
    setNewLabel('Bảng chỉ dẫn mã QR mới tại Quận 4');
    setNewPoiId(MOCK_POIS[0]?.id || 1);
    setNewBusStopId(MOCK_BUS_STOPS[0]?.id);
    setIsModalOpen(true);
  };

  const handleCreateQr = () => {
    if (!generatedCode || generatedCode.length < 8) {
      alert('Mã QR Base62 phải có độ dài ít nhất 8 ký tự!');
      return;
    }
    const poi = MOCK_POIS.find((p) => p.id === newPoiId);
    const busStop = MOCK_BUS_STOPS.find((b) => b.id === newBusStopId);

    const newQr = {
      id: Date.now(),
      code: generatedCode,
      poiId: newPoiId,
      busStopId: newBusStopId,
      label: newLabel || `Biển QR ${poi?.name}`,
      isActive: true,
      scanCount: 0,
      poi: poi,
      busStop: busStop
    };

    setQrCodes([newQr, ...qrCodes]);
    setSelectedQrForPrint(newQr);
    setIsModalOpen(false);
    showNotice(`Đã sinh mã QR "${generatedCode}" thành công!`);
  };

  const toggleQrStatus = (id: number) => {
    const updated = qrCodes.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setQrCodes(updated);
    showNotice('Đã thay đổi trạng thái kích hoạt của mã QR.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotice(`Đã sao chép đường link QR: ${text}`);
  };

  const filteredQrCodes = qrCodes.filter((qr) => {
    const matchesSearch =
      qr.code.toLowerCase().includes(search.toLowerCase()) ||
      (qr.label && qr.label.toLowerCase().includes(search.toLowerCase())) ||
      (qr.poi && qr.poi.name.toLowerCase().includes(search.toLowerCase()));
    const matchesPoi = selectedPoiFilter === 'ALL' || qr.poiId === selectedPoiFilter;
    return matchesSearch && matchesPoi;
  });

  const totalScans = qrCodes.reduce((sum, item) => sum + item.scanCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <QrIcon className="w-7 h-7 text-emerald-600" />
            Xưởng Sinh & Quản lý Mã QR (QR Code Studio)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sinh mã định danh Base62 $\ge 8$ ký tự (`FR-QR-01`), xuất bản in hiện trường chuẩn nhận diện thương hiệu và theo dõi lượt quét (`FR-CMS-16`).
          </p>
        </div>
        <button
          onClick={openGenerator}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Sinh Mã QR Mới (Base62)
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <QrIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{qrCodes.length}</div>
            <div className="text-xs text-slate-500 font-medium">Tổng số điểm đặt mã QR hiện trường</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalScans.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">Tổng lượt du khách quét mã nghe audio</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">100% Offline</div>
            <div className="text-xs text-slate-500 font-medium">Hỗ trợ quét không cần Internet khi đã tải gói</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table & Filters (60%), Right Print Template Preview (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: QR Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã Base62, vị trí, hoặc tên POI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={selectedPoiFilter}
              onChange={(e) => setSelectedPoiFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">Tất cả POI ({qrCodes.length})</option>
              {MOCK_POIS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Mã Base62</th>
                  <th className="py-2.5 px-3">POI Gắn Kết</th>
                  <th className="py-2.5 px-3 text-center">Lượt Quét</th>
                  <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-right">Xem Bản In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQrCodes.map((qr) => {
                  const isSelected = selectedQrForPrint?.id === qr.id;
                  return (
                    <tr
                      key={qr.id}
                      onClick={() => setSelectedQrForPrint(qr)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-emerald-800 bg-emerald-50 inline-block px-1.5 py-0.5 rounded border border-emerald-200">
                          {qr.code}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{qr.label}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 line-clamp-1">{qr.poi?.name}</div>
                        {qr.busStop && (
                          <div className="text-[11px] text-slate-500">Tại: {qr.busStop.name}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {qr.scanCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleQrStatus(qr.id)}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold transition inline-flex items-center gap-1 ${
                            qr.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {qr.isActive ? 'Hoạt động' : 'Đã khóa'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedQrForPrint(qr)}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded transition text-[11px] font-medium"
                        >
                          Mẫu In
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Field Print Template Preview Studio */}
        <div className="lg:col-span-5 space-y-4">
          {selectedQrForPrint ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  Mẫu In Thực Địa Tiêu Chuẩn (Field Signage Template)
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedQrForPrint.code}
                </span>
              </div>

              {/* Printable Card Standee Visualizer */}
              <div
                id="printable-qr-sign"
                className="bg-gradient-to-b from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 text-center space-y-4 shadow-xl border-4 border-emerald-600"
              >
                {/* Header branding */}
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-bold text-emerald-300">
                    ỦY BAN NHÂN DÂN QUẬN 4 • TP. HỒ CHÍ MINH
                  </div>
                  <h4 className="text-base font-extrabold uppercase mt-1 leading-snug">
                    HỆ THỐNG THUYẾT MINH DU LỊCH TỰ ĐỘNG
                  </h4>
                  <p className="text-[11px] text-emerald-200 mt-0.5">
                    Hỗ trợ đa ngôn ngữ • Giọng đọc AI • Trợ lý 2 chiều
                  </p>
                </div>

                {/* QR Code Graphic (SVG High-contrast) */}
                <div className="bg-white p-4 rounded-xl shadow-inner inline-block mx-auto border-2 border-emerald-400">
                  <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100">
                    {/* Simulated High Density Base62 QR Pattern */}
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="26" height="26" fill="#047857" rx="3" />
                    <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="13" y="13" width="10" height="10" fill="#047857" rx="1" />
                    {/* Corner 2 */}
                    <rect x="69" y="5" width="26" height="26" fill="#047857" rx="3" />
                    <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="77" y="13" width="10" height="10" fill="#047857" rx="1" />
                    {/* Corner 3 */}
                    <rect x="5" y="69" width="26" height="26" fill="#047857" rx="3" />
                    <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                    <rect x="13" y="77" width="10" height="10" fill="#047857" rx="1" />
                    {/* Central Grid matrix elements */}
                    <rect x="36" y="8" width="8" height="8" fill="#1e293b" />
                    <rect x="48" y="16" width="14" height="8" fill="#1e293b" />
                    <rect x="8" y="38" width="8" height="14" fill="#1e293b" />
                    <rect x="20" y="44" width="10" height="6" fill="#1e293b" />
                    <rect x="36" y="36" width="28" height="28" fill="#065f46" rx="4" />
                    {/* Center Icon */}
                    <circle cx="50" cy="50" r="10" fill="#ffffff" />
                    <text x="50" y="54" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">
                      Q4
                    </text>
                    <rect x="68" y="38" width="24" height="6" fill="#1e293b" />
                    <rect x="74" y="48" width="18" height="16" fill="#1e293b" />
                    <rect x="38" y="70" width="16" height="10" fill="#1e293b" />
                    <rect x="58" y="76" width="14" height="16" fill="#1e293b" />
                    <rect x="78" y="80" width="14" height="12" fill="#1e293b" />
                  </svg>
                  <div className="mt-2 text-slate-800 font-mono text-xs font-bold tracking-wider">
                    CODE: {selectedQrForPrint.code}
                  </div>
                </div>

                {/* Target POI & Instruction */}
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-300">
                    {selectedQrForPrint.poi?.name}
                  </div>
                  <p className="text-[11px] text-emerald-100 max-w-xs mx-auto">
                    Mở camera điện thoại quét mã để nghe thuyết minh ngay lập tức bằng tiếng Việt, Anh, Trung, Thái, Hàn, Nhật, Hindi.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => copyToClipboard(`https://q4tour.vn/qr?code=${selectedQrForPrint.code}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép Link URL
                </button>
                <button
                  onClick={() => alert(`Đang xuất file in độ phân giải cao 300 DPI (PNG/SVG) cho mã: ${selectedQrForPrint.code}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất File In (SVG/PNG)
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  Quy định kích thước in ấn hiện trường (FR-QR-01):
                </div>
                <div>• Biển đón xe buýt / cột mốc: Khổ A5 (148 x 210 mm), decal chống nước.</div>
                <div>• Biển tại cổng di tích: Khổ A4 (210 x 297 mm), mica cán bóng chống tia UV.</div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white border rounded-xl">
              Chọn một mã QR từ bảng để xem trước bản in thực địa.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Generate Base62 QR Code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Sinh Mã Định Danh QR Mới
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Base62 được sinh ngẫu nhiên ($\ge 8$ ký tự)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    className="flex-1 text-sm font-mono font-bold px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setGeneratedCode(generateBase62())}
                    className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Sinh lại
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gắn với Điểm POI Đích</label>
                <select
                  value={newPoiId}
                  onChange={(e) => setNewPoiId(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {MOCK_POIS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.ward?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gắn với Trạm Xe Buýt (Tùy chọn)</label>
                <select
                  value={newBusStopId || ''}
                  onChange={(e) => setNewBusStopId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Không gắn trạm xe buýt</option>
                  {MOCK_BUS_STOPS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhãn chú thích vị trí gắn biển</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="VD: Cột mốc lối vào cổng số 1..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateQr}
                className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
              >
                Xác nhận Tạo QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
