'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Smartphone,
  Globe,
  Laptop,
  Search,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Headphones,
  Compass,
  Clock,
  Eye,
  X,
  Filter,
  Radio,
} from 'lucide-react';
import { getAdminDevices, deleteAdminDevice, AdminDeviceSummary, AdminDeviceItem } from '@/services/cmsDevices';

export default function CmsDevicesPage() {
  const [data, setData] = useState<AdminDeviceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [osFilter, setOsFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal
  const [selectedDevice, setSelectedDevice] = useState<AdminDeviceItem | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmDevice, setDeleteConfirmDevice] = useState<AdminDeviceItem | null>(null);

  const fetchDevices = useCallback(() => {
    setLoading(true);
    setError(false);
    getAdminDevices({ search, type: typeFilter, os: osFilter })
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, typeFilter, osFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchDevices]);

  // Auto-refresh every 30 seconds to update online status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDevices();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteConfirmDevice) return;
    setDeletingId(deleteConfirmDevice.deviceId);
    try {
      await deleteAdminDevice(deleteConfirmDevice.deviceId);
      setDeleteConfirmDevice(null);
      if (selectedDevice?.deviceId === deleteConfirmDevice.deviceId) {
        setSelectedDevice(null);
      }
      fetchDevices();
    } catch {
      alert('Không thể xóa dữ liệu thiết bị. Vui lòng kiểm tra quyền Admin.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa rõ';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatNumber = new Intl.NumberFormat('vi-VN');

  const displayedItems = (data?.items || []).filter((item) => {
    if (statusFilter === 'ONLINE') return item.online;
    if (statusFilter === 'OFFLINE') return !item.online;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            Quản lý Thiết bị Truy cập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách thiết bị du khách tham quan, nhận diện trực tuyến thời gian thực và thực thi quyền riêng tư (NFR-PRV-03)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDevices}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </header>

      {/* KPI Cards (Clickable for fast filter) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          onClick={() => {
            setStatusFilter('ALL');
            setTypeFilter('ALL');
          }}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:border-purple-300 ${
            statusFilter === 'ALL' && typeFilter === 'ALL'
              ? 'border-purple-500 bg-purple-50/30 ring-2 ring-purple-500/20'
              : 'border-slate-200/80 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tổng thiết bị</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {data ? formatNumber.format(data.totalDevices) : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Bấm để xem tất cả</p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'ONLINE' ? 'ALL' : 'ONLINE')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:border-emerald-300 ${
            statusFilter === 'ONLINE'
              ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800">Đang trực tuyến</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {data ? formatNumber.format(data.onlineDevices) : '—'}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {statusFilter === 'ONLINE' ? '✓ Đang lọc trực tuyến' : 'Bấm để lọc thiết bị online'}
          </p>
        </div>

        <div
          onClick={() => setTypeFilter(typeFilter === 'WEB' ? 'ALL' : 'WEB')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:border-blue-300 ${
            typeFilter === 'WEB'
              ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
              : 'border-slate-200/80 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Truy cập Web Browser</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {data ? formatNumber.format(data.webDevices) : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Bấm để lọc Web</p>
        </div>

        <div
          onClick={() => setTypeFilter(typeFilter === 'APP' ? 'ALL' : 'APP')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition hover:border-indigo-300 ${
            typeFilter === 'APP'
              ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Cài App / PWA</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {data ? formatNumber.format(data.appDevices) : '—'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Bấm để lọc App</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        {/* Quick Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({data?.totalDevices || 0})
          </button>
          <button
            onClick={() => setStatusFilter('ONLINE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'ONLINE'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Đang trực tuyến ({data?.onlineDevices || 0})
          </button>
          <button
            onClick={() => setStatusFilter('OFFLINE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'OFFLINE'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Ngoại tuyến ({data ? data.totalDevices - data.onlineDevices : 0})
          </button>
        </div>

        {/* Detailed inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo Device ID, OS, ngôn ngữ..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Platform filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Nền tảng:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả nền tảng</option>
              <option value="WEB">Web Browser</option>
              <option value="APP">Mobile App / PWA</option>
            </select>
          </div>

          {/* OS filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Hệ điều hành:</span>
            <select
              value={osFilter}
              onChange={(e) => setOsFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả OS</option>
              <option value="ios">iOS (iPhone/iPad)</option>
              <option value="android">Android</option>
              <option value="windows">Windows</option>
              <option value="mac">macOS</option>
              <option value="linux">Linux</option>
            </select>
          </div>

          {(search || typeFilter !== 'ALL' || osFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('ALL');
                setOsFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Devices List Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600 text-sm">
            Không tải được danh sách thiết bị. Vui lòng kiểm tra quyền Admin hoặc kết nối.
          </div>
        ) : !data || loading ? (
          <div className="p-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            Đang tải dữ liệu thiết bị…
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Không tìm thấy thiết bị nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã Thiết bị (Device ID)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Nền tảng</th>
                  <th className="py-3 px-4">Dòng máy & Hệ điều hành</th>
                  <th className="py-3 px-4">Trình duyệt / App</th>
                  <th className="py-3 px-4">Ngôn ngữ</th>
                  <th className="py-3 px-4 text-center">Lượt nghe</th>
                  <th className="py-3 px-4 text-center">Phiên GPS</th>
                  <th className="py-3 px-4">Hoạt động gần nhất</th>
                  <th className="py-3 px-4">Telemetry</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedItems.map((device) => {
                  const isApp = device.deviceType?.toUpperCase() === 'APP' || device.deviceType?.toUpperCase() === 'MOBILE_APP';
                  return (
                    <tr key={device.deviceId} className="hover:bg-slate-50/70 transition">
                      {/* Device ID */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800" title={device.deviceId}>
                            {device.deviceId.length > 18
                              ? `${device.deviceId.substring(0, 10)}...${device.deviceId.substring(device.deviceId.length - 6)}`
                              : device.deviceId}
                          </span>
                          <button
                            onClick={() => handleCopy(device.deviceId)}
                            title="Sao chép Device ID"
                            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                          >
                            {copiedId === device.deviceId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Online status Badge */}
                      <td className="py-3 px-4 text-center">
                        {device.online ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold shadow-sm shadow-emerald-500/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Trực tuyến
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Ngoại tuyến
                          </span>
                        )}
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-[11px] ${
                            isApp
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                          }`}
                        >
                          {isApp ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          {isApp ? 'Mobile App' : 'Web'}
                        </span>
                      </td>

                      {/* OS & Device Model */}
                      <td className="py-3 px-4 text-slate-800 font-semibold">
                        {device.osVersion || <span className="text-slate-400 italic">Chưa rõ</span>}
                      </td>

                      {/* Browser / App */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200/60">
                          {device.appVersion || 'Web Browser'}
                        </span>
                      </td>

                      {/* Language */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                          {device.preferredLanguage || 'vi'}
                        </span>
                      </td>

                      {/* Playbacks */}
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        <div className="inline-flex items-center gap-1 text-slate-700">
                          <Headphones className="w-3 h-3 text-slate-400" />
                          {formatNumber.format(device.totalPlaybacks)}
                        </div>
                      </td>

                      {/* Tracking Sessions */}
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        <div className="inline-flex items-center gap-1 text-slate-700">
                          <Compass className="w-3 h-3 text-slate-400" />
                          {formatNumber.format(device.totalSessions)}
                        </div>
                      </td>

                      {/* Last Seen */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatDateTime(device.lastSeenAt)}</span>
                        </div>
                      </td>

                      {/* Consent status */}
                      <td className="py-3 px-4">
                        {device.analyticsConsent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-100">
                            <ShieldCheck className="w-3 h-3" /> Cho phép
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                            <ShieldAlert className="w-3 h-3" /> Ẩn danh
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDevice(device)}
                            title="Xem chi tiết thiết bị"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmDevice(device)}
                            title="Xóa dữ liệu thiết bị (Privacy NFR-PRV-03)"
                            className="p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
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
        )}
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Chi tiết Thiết bị Du khách
              </h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Mã định danh duy nhất (Device ID):</span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 break-all">
                  <span className="flex-1">{selectedDevice.deviceId}</span>
                  <button
                    onClick={() => handleCopy(selectedDevice.deviceId)}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600"
                    title="Sao chép"
                  >
                    {copiedId === selectedDevice.deviceId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Nền tảng</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDevice.deviceType?.toUpperCase() === 'APP' ? 'Mobile App / PWA' : 'Web Browser'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Dòng máy & Hệ điều hành</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDevice.osVersion || 'Chưa rõ'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Trình duyệt / Ứng dụng</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDevice.appVersion || 'Web Browser'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Ngôn ngữ mặc định</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {selectedDevice.preferredLanguage || 'vi'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Trạng thái</span>
                  <span className={`font-semibold ${selectedDevice.online ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {selectedDevice.online ? '🟢 Đang trực tuyến' : '⚪ Ngoại tuyến'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Tổng lượt nghe audio</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatNumber.format(selectedDevice.totalPlaybacks)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Phiên định vị GPS</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatNumber.format(selectedDevice.totalSessions)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-slate-600">
                <p>
                  <span className="text-slate-400">Đăng ký lần đầu:</span> {formatDateTime(selectedDevice.createdAt)}
                </p>
                <p>
                  <span className="text-slate-400">Hoạt động gần nhất:</span> {formatDateTime(selectedDevice.lastSeenAt)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Xóa dữ liệu thiết bị (NFR-PRV-03)?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Thao tác này sẽ xóa vĩnh viễn toàn bộ nhật ký nghe thuyết minh, lịch sử tọa độ GPS và thông tin của thiết bị{' '}
              <span className="font-mono font-bold text-slate-900">{deleteConfirmDevice.deviceId}</span> khỏi hệ thống.
            </p>

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirmDevice(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {deletingId ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xóa…
                  </>
                ) : (
                  'Xác nhận xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
