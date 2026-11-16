'use client';

import React, { useEffect, useState } from 'react';
import {
  listCmsQrCodes,
  createCmsQrCode,
  setCmsQrActive,
  deleteCmsQrCode,
  fetchCmsQrImageBlob,
  downloadCmsQrImage,
} from '@/services/cmsQr';
import { listCmsPois, type CmsPoi } from '@/services/cmsPois';
import { listCmsBusStops } from '@/services/cmsGeography';
import { QrCode, BusStop } from '@/types';
import {
  QrCode as QrIcon,
  Plus,
  Search,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  BarChart2,
  X,
  Info,
  LayoutGrid,
  List,
  Trash2,
  Bus,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function CmsQrCodeStudioPage() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [pois, setPois] = useState<CmsPoi[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View, Filter & Sort States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedPoiFilter, setSelectedPoiFilter] = useState<number | 'ALL'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [selectedBusStopFilter, setSelectedBusStopFilter] = useState<'ALL' | 'HAS_BUS' | 'NO_BUS'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'SCANS_DESC' | 'CODE_ASC' | 'POI_ASC'>('NEWEST');

  // Selected QR for Details Inspector
  const [selectedQr, setSelectedQr] = useState<QrCode | null>(null);
  const [qrImageBlobUrl, setQrImageBlobUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Modal Generator State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPoiId, setNewPoiId] = useState<number>(1);
  const [newBusStopId, setNewBusStopId] = useState<number | undefined>(undefined);
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
    setNewPoiId(pois[0]?.id || 1);
    setNewBusStopId(busStops[0]?.id);
    setIsModalOpen(true);
  };

  const handleCreateQr = async () => {
    if (!generatedCode || generatedCode.length < 8) {
      alert('Mã QR Base62 phải có độ dài ít nhất 8 ký tự!');
      return;
    }
    try {
      const created = await createCmsQrCode({ poiId: newPoiId, busStopId: newBusStopId, label: newLabel });
      const enrichedCreated: QrCode = {
        ...created,
        poi: pois.find((p) => p.id === newPoiId) as any,
        busStop: busStops.find((b) => b.id === newBusStopId),
      };
      setQrCodes([enrichedCreated, ...qrCodes]);
      setSelectedQr(enrichedCreated);
      setIsModalOpen(false);
      showNotice(`Đã tạo mã QR "${created.code}" thành công!`);
    } catch {
      alert('Không tạo được mã QR. Kiểm tra quyền CMS và kết nối.');
    }
  };

  const toggleQrStatus = async (id: number) => {
    const current = qrCodes.find((item) => item.id === id);
    if (!current) return;
    try {
      const updatedItem = await setCmsQrActive(id, !current.isActive);
      setQrCodes(qrCodes.map((item) => (item.id === id ? { ...item, isActive: updatedItem.isActive } : item)));
      if (selectedQr?.id === id) {
        setSelectedQr({ ...selectedQr, isActive: updatedItem.isActive });
      }
      showNotice(`Đã chuyển trạng thái mã sang: ${updatedItem.isActive ? 'Hoạt động' : 'Đã khóa'}`);
    } catch {
      alert('Không đổi được trạng thái mã QR.');
    }
  };

  const handleDeleteQr = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã QR "${code}" khỏi hệ thống?`)) return;
    try {
      await deleteCmsQrCode(id);
      const updated = qrCodes.filter((item) => item.id !== id);
      setQrCodes(updated);
      if (selectedQr?.id === id) {
        setSelectedQr(updated[0] || null);
      }
      showNotice(`Đã xóa mã QR "${code}" thành công.`);
    } catch {
      alert('Không xóa được mã QR. Kiểm tra quyền CMS và kết nối.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotice(`Đã sao chép liên kết: ${text}`);
  };

  // Fetch real QR image blob when selected QR changes
  useEffect(() => {
    if (!selectedQr?.id) {
      setQrImageBlobUrl(null);
      return;
    }
    let active = true;
    fetchCmsQrImageBlob(selectedQr.id, 'svg', 400)
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        setQrImageBlobUrl(url);
      })
      .catch(() => {
        if (!active) return;
        setQrImageBlobUrl(null);
      });

    return () => {
      active = false;
    };
  }, [selectedQr?.id]);

  // Initial Load
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      listCmsQrCodes(controller.signal),
      (async () => {
        const items: CmsPoi[] = [];
        let page = 0;
        let totalPages = 1;
        do {
          const query = new URLSearchParams({ page: String(page), size: '100' });
          const result = await listCmsPois(query, controller.signal);
          items.push(...result.content);
          totalPages = result.totalPages;
          page += 1;
        } while (page < totalPages);
        return items;
      })(),
      listCmsBusStops('ALL', controller.signal),
    ])
      .then(([qrData, poiData, stopData]) => {
        if (controller.signal.aborted) return;
        const poiMap = new Map(poiData.map((p) => [p.id, p]));
        const stopMap = new Map(stopData.map((s) => [s.id, s]));

        const enrichedQrData: QrCode[] = qrData.map((qr) => ({
          ...qr,
          poi: qr.poi || (poiMap.get(qr.poiId) as any),
          busStop: qr.busStop || (qr.busStopId ? stopMap.get(qr.busStopId) : undefined),
        }));

        setQrCodes(enrichedQrData);
        setSelectedQr(enrichedQrData[0] ?? null);
        setPois(poiData);
        setBusStops(stopData);
        setNewPoiId(poiData[0]?.id ?? 1);
        setNewBusStopId(stopData[0]?.id);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Không tải được dữ liệu mã QR từ máy chủ.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Filter & Sort Pipeline
  const filteredQrCodes = qrCodes
    .filter((qr) => {
      const q = search.toLowerCase();
      const matchesSearch =
        qr.code.toLowerCase().includes(q) ||
        (qr.label && qr.label.toLowerCase().includes(q)) ||
        (qr.poi && qr.poi.name.toLowerCase().includes(q)) ||
        (qr.busStop && qr.busStop.name.toLowerCase().includes(q));

      const matchesPoi = selectedPoiFilter === 'ALL' || qr.poiId === selectedPoiFilter;
      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'ACTIVE' && qr.isActive) ||
        (selectedStatusFilter === 'LOCKED' && !qr.isActive);
      const matchesBusStop =
        selectedBusStopFilter === 'ALL' ||
        (selectedBusStopFilter === 'HAS_BUS' && qr.busStopId) ||
        (selectedBusStopFilter === 'NO_BUS' && !qr.busStopId);

      return matchesSearch && matchesPoi && matchesStatus && matchesBusStop;
    })
    .sort((a, b) => {
      if (sortBy === 'SCANS_DESC') return b.scanCount - a.scanCount;
      if (sortBy === 'CODE_ASC') return a.code.localeCompare(b.code);
      if (sortBy === 'POI_ASC') return (a.poi?.name || '').localeCompare(b.poi?.name || '');
      return b.id - a.id;
    });

  const totalScans = qrCodes.reduce((sum, item) => sum + item.scanCount, 0);

  // Download Handlers
  const handleDownloadPng = async () => {
    if (!selectedQr) return;
    try {
      setIsExporting(true);
      await downloadCmsQrImage(selectedQr.id, selectedQr.code, 'png', 1024);
      showNotice('Đã tải ảnh PNG độ phân giải cao thành công!');
    } catch {
      alert('Không tải được ảnh PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = async () => {
    if (!selectedQr) return;
    try {
      setIsExporting(true);
      await downloadCmsQrImage(selectedQr.id, selectedQr.code, 'svg', 512);
      showNotice('Đã tải file vector SVG thành công!');
    } catch {
      alert('Không tải được file SVG.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <QrIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Quản lý Mã QR
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tạo và quản lý mã QR điểm tham quan du lịch tại Quận 4.
          </p>
        </div>
        <button
          onClick={openGenerator}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Tạo Mã QR Mới
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <QrIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{qrCodes.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng số mã QR</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalScans.toLocaleString()}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng lượt quét</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">100% Offline</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hỗ trợ quét ngoại tuyến</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left List/Grid (60-65%), Right QR Details Inspector (35-40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QR Management, Filters & Switcher */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Enhanced Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
            {/* Top row: Search input & View switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mã QR, địa điểm, trạm buýt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* View Switcher Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Chế độ lưới"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lưới thẻ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Chế độ danh sách"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>
            </div>

            {/* Bottom row: Multi-dimensional Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <select
                  value={selectedPoiFilter}
                  onChange={(e) => setSelectedPoiFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none truncate"
                >
                  <option value="ALL">Tất cả POI ({qrCodes.length})</option>
                  {pois.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedBusStopFilter}
                  onChange={(e) => setSelectedBusStopFilter(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="ALL">Mọi vị trí trạm</option>
                  <option value="HAS_BUS">Có gắn Trạm Buýt</option>
                  <option value="NO_BUS">Không gắn Trạm</option>
                </select>
              </div>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="NEWEST">Mới tạo nhất</option>
                  <option value="SCANS_DESC">Lượt quét nhiều nhất</option>
                  <option value="CODE_ASC">Mã QR (A-Z)</option>
                  <option value="POI_ASC">Tên POI (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>
                Tìm thấy <strong className="text-slate-700 dark:text-slate-200 font-semibold">{filteredQrCodes.length}</strong> / {qrCodes.length} mã QR
              </span>
            </div>
          </div>

          {/* Scrollable Container for List or Grid */}
          <div className="max-h-[calc(100vh-270px)] lg:max-h-[660px] overflow-y-auto pr-1">
            {loading && (
              <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Đang tải dữ liệu mã QR...
              </div>
            )}

            {!loading && filteredQrCodes.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Không tìm thấy mã QR nào khớp với bộ lọc hiện tại.
              </div>
            )}

            {/* CHẾ ĐỘ 1: LƯỚI THẺ (GRID CARD VIEW) */}
            {viewMode === 'grid' && !loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredQrCodes.map((qr) => {
                  const isSelected = selectedQr?.id === qr.id;
                  return (
                    <div
                      key={qr.id}
                      onClick={() => setSelectedQr(qr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Card Header: Code & Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {qr.code}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleQrStatus(qr.id);
                            }}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                              qr.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {qr.isActive ? 'Hoạt động' : 'Đã khóa'}
                          </button>
                        </div>

                        {/* Card Body: QR Icon, POI Name & Location */}
                        <div className="flex items-start gap-3 mt-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0 shadow-xs">
                            <QrIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate" title={qr.poi?.name}>
                              {qr.poi?.name || 'Chưa gắn POI'}
                            </h3>
                            {qr.busStop && (
                              <div className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 truncate">
                                <Bus className="w-3 h-3 flex-shrink-0" />
                                <span>{qr.busStop.name}</span>
                              </div>
                            )}
                            {qr.label && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                                <span>{qr.label}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Scans & Action Buttons */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                          {qr.scanCount.toLocaleString()} lượt
                        </span>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`https://q4tour.vn/qr?code=${qr.code}`)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Sao chép link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedQr(qr)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            Chi tiết
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQr(qr.id, qr.code)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            title="Xóa mã QR"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CHẾ ĐỘ 2: BẢNG DANH SÁCH (TABLE VIEW) */}
            {viewMode === 'table' && !loading && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3 px-3.5">Mã QR</th>
                        <th className="py-3 px-3.5">Điểm tham quan (POI)</th>
                        <th className="py-3 px-3.5">Trạm buýt</th>
                        <th className="py-3 px-3.5 text-center">Lượt Quét</th>
                        <th className="py-3 px-3.5 text-center">Trạng Thái</th>
                        <th className="py-3 px-3.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredQrCodes.map((qr) => {
                        const isSelected = selectedQr?.id === qr.id;
                        return (
                          <tr
                            key={qr.id}
                            onClick={() => setSelectedQr(qr)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-medium'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-3.5">
                              <div className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 inline-block px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                {qr.code}
                              </div>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{qr.poi?.name || 'Chưa gắn'}</div>
                              {qr.label && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{qr.label}</div>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              {qr.busStop ? (
                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                                  <Bus className="w-3 h-3" />
                                  {qr.busStop.name}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                              {qr.scanCount.toLocaleString()}
                            </td>
                            <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleQrStatus(qr.id)}
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition inline-flex items-center gap-1 ${
                                  qr.isActive
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {qr.isActive ? 'Hoạt động' : 'Đã khóa'}
                              </button>
                            </td>
                            <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(`https://q4tour.vn/qr?code=${qr.code}`)}
                                  className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                  title="Sao chép link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQr(qr)}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 rounded transition text-[11px] font-medium"
                                >
                                  Chi tiết
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQr(qr.id, qr.code)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                                  title="Xóa mã QR"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Clean QR Details Inspector & Downloads */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {selectedQr ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                  <QrIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Chi tiết Mã QR
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedQr.code}
                </span>
              </div>

              {/* QR Code Center Display */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="bg-white p-3.5 rounded-xl shadow-xs inline-block mx-auto border border-slate-200 dark:border-slate-700">
                  {qrImageBlobUrl ? (
                    <img
                      src={qrImageBlobUrl}
                      alt={`Mã QR ${selectedQr.code}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-slate-50 text-slate-400 text-xs animate-pulse">
                      Đang tải ảnh mã QR...
                    </div>
                  )}
                  <div className="mt-2 text-slate-800 font-mono text-xs font-bold tracking-wider">
                    {selectedQr.code}
                  </div>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Điểm tham quan:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-right max-w-[200px] truncate">
                    {selectedQr.poi?.name || 'Chưa gắn'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Trạm xe buýt:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-right max-w-[200px] truncate">
                    {selectedQr.busStop?.name || 'Không gắn'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Vị trí đặt:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-[200px] truncate">
                    {selectedQr.label || 'Không có'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Lượt quét:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedQr.scanCount.toLocaleString()} lượt
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Trạng thái:</span>
                  <button
                    type="button"
                    onClick={() => toggleQrStatus(selectedQr.id)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition ${
                      selectedQr.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {selectedQr.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Download & Copy */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Tải PNG (1024px)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    Tải Vector (SVG)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(`https://q4tour.vn/qr?code=${selectedQr.code}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép liên kết du khách
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteQr(selectedQr.id, selectedQr.code)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa mã QR này
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              Chọn một mã QR từ danh sách để xem chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Create New QR Code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Tạo Mã QR Mới
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã định danh (Tự động tạo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    className="flex-1 text-sm font-mono font-bold px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setGeneratedCode(generateBase62())}
                    className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl"
                  >
                    Sinh lại
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Điểm tham quan (POI) *</label>
                <select
                  value={newPoiId}
                  onChange={(e) => setNewPoiId(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                >
                  {pois.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.wardName ? `(${p.wardName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Trạm xe buýt (Tùy chọn)</label>
                <select
                  value={newBusStopId || ''}
                  onChange={(e) => setNewBusStopId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                >
                  <option value="">Không gắn trạm xe buýt</option>
                  {busStops.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vị trí đặt biển (Tùy chọn)</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="VD: Cổng số 1, Trụ chờ xe buýt..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateQr}
                className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition"
              >
                Tạo mã QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
