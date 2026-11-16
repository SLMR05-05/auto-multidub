'use client';

import React, { useEffect, useState } from 'react';
import { listCmsPois, type CmsPoi } from '@/services/cmsPois';
import { listCmsWards, listCmsBusStops, createCmsBusStop, updateCmsBusStop, deleteCmsBusStop, type BusStopInput } from '@/services/cmsGeography';
import { BusStop, Ward } from '@/types';
import {
  Bus,
  MapPin,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  X,
  Save
} from 'lucide-react';

export default function CmsBusStopsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [pois, setPois] = useState<CmsPoi[]>([]);
  const [selectedWardFilter, setSelectedWardFilter] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    wardId: number;
    latitude: number;
    longitude: number;
    address: string;
    isActive: boolean;
  }>({
    name: '',
    code: '',
    wardId: 1,
    latitude: 10.7681,
    longitude: 106.7052,
    address: '',
    isActive: true
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [wardData, stopData] = await Promise.all([listCmsWards(), listCmsBusStops()]);
      setWards(wardData);
      setBusStops(stopData);
      // Load POIs for linked-POI display and ward counts.
      const poiPages: CmsPoi[] = [];
      let page = 0;
      let totalPages = 1;
      do {
        const query = new URLSearchParams({ page: String(page), size: '100' });
        const result = await listCmsPois(query, new AbortController().signal);
        poiPages.push(...result.content);
        totalPages = result.totalPages;
        page += 1;
      } while (page < totalPages);
      setPois(poiPages);
    } catch {
      setError('Không tải được dữ liệu trạm dừng từ Backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

  const filteredBusStops = busStops.filter((stop) => {
    const matchesWard = selectedWardFilter === 'ALL' || stop.wardId === selectedWardFilter;
    const matchesSearch =
      stop.name.toLowerCase().includes(search.toLowerCase()) ||
      (stop.code && stop.code.toLowerCase().includes(search.toLowerCase())) ||
      (stop.address && stop.address.toLowerCase().includes(search.toLowerCase()));
    return matchesWard && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingStop(null);
    setFormData({
      name: '',
      code: `BS-Q4-${(busStops.length + 1).toString().padStart(2, '0')}`,
      wardId: wards[0]?.id ?? 1,
      latitude: 10.765,
      longitude: 106.703,
      address: 'Đường Đoàn Như Hài, Phường Khánh Hội, Quận 4',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (stop: BusStop) => {
    setEditingStop(stop);
    setFormData({
      name: stop.name,
      code: stop.code || '',
      wardId: stop.wardId || wards[0]?.id || 1,
      latitude: stop.latitude,
      longitude: stop.longitude,
      address: stop.address || '',
      isActive: stop.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Vui lòng nhập tên trạm và mã trạm');
      return;
    }
    const input: BusStopInput = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      wardId: formData.wardId || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address.trim(),
    };
    try {
      if (editingStop) {
        await updateCmsBusStop(editingStop.id, input);
        showNotice(`Đã cập nhật trạm "${formData.name}" thành công!`);
      } else {
        await createCmsBusStop(input);
        showNotice(`Đã thêm trạm "${formData.name}" mới vào hệ thống!`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch {
      alert('Không lưu được trạm dừng. Kiểm tra quyền CMS và kết nối.');
    }
  };

  const deleteStop = async (id: number) => {
    const associatedPoi = pois.find((p) => p.busStopId === id);
    if (associatedPoi) {
      alert(`Không thể xóa trạm này vì đang được liên kết với điểm POI: "${associatedPoi.name}".`);
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa trạm dừng xe buýt này?')) return;
    try {
      await deleteCmsBusStop(id);
      showNotice('Đã xóa trạm dừng xe buýt.');
      await loadData();
    } catch {
      alert('Không xóa được trạm dừng. Kiểm tra quyền CMS và kết nối.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bus className="w-7 h-7 text-emerald-600" />
            Quản lý Phường & Trạm dừng Xe buýt 
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Đăng ký và quản lý các trạm đón trả khách du lịch, tọa độ GPS và liên kết với các điểm POI 
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Thêm Trạm Xe Buýt Mới
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {loading && <p role="status">Đang tải dữ liệu từ Backend…</p>}

      {/* 3 Wards Summary Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wards.map((ward) => {
            const count = busStops.filter((s) => s.wardId === ward.id).length;
            const poiCount = pois.filter((p) => p.wardId === ward.id).length;
            const isFilterActive = selectedWardFilter === ward.id;

            return (
              <div
                key={ward.id}
                onClick={() => setSelectedWardFilter(isFilterActive ? 'ALL' : ward.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isFilterActive
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Phường {ward.name}</h3>
                      <p className="text-xs text-slate-500">{ward.district}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {count} trạm
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Điểm di tích (POI): <strong className="text-emerald-700">{poiCount}</strong></span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {isFilterActive ? 'Đang lọc' : 'Click để lọc'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter and Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo tên trạm, mã trạm, địa chỉ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Lọc theo phường:</span>
            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
            >
              <option value="ALL">Tất cả các phường ({busStops.length})</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  Phường {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bus Stops Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã Trạm</th>
                <th className="py-3 px-4">Tên Trạm & Địa chỉ</th>
                <th className="py-3 px-4">Phường Trực Thuộc</th>
                <th className="py-3 px-4">Tọa độ GPS</th>
                <th className="py-3 px-4">POI Liên Kết</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && filteredBusStops.map((stop) => {
                const ward = wards.find((w) => w.id === stop.wardId);
                const linkedPoi = pois.find((p) => p.busStopId === stop.id);

                return (
                  <tr key={stop.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-700">
                      {stop.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{stop.name}</div>
                      <div className="text-xs text-slate-500">{stop.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                        Phường {ward?.name || 'Khác'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {linkedPoi ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{linkedPoi.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa liên kết</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(stop)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded"
                          title="Chỉnh sửa trạm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStop(stop.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Xóa trạm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredBusStops.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    Không tìm thấy trạm dừng xe buýt nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Bus Stop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-600" />
                {editingStop ? 'Chỉnh sửa Trạm Dừng Xe Buýt' : 'Đăng ký Trạm Dừng Mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã trạm (Code)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thuộc Phường</label>
                  <select
                    value={formData.wardId}
                    onChange={(e) => setFormData({ ...formData, wardId: Number(e.target.value) })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        Phường {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Trạm Dừng</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Trạm Bến Nhà Rồng (02)..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: Nguyễn Tất Thành, Phường Khánh Hội..."
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
              >
                <Save className="w-4 h-4" /> Lưu thông tin Trạm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}