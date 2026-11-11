'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MOCK_TOURS, MOCK_POIS } from '@/services/mockData';
import { Tour, TourStatus, Poi } from '@/types';
import {
  Compass,
  Plus,
  Search,
  Clock,
  MapPin,
  MoveUp,
  MoveDown,
  Trash2,
  CheckCircle2,
  Eye,
  Edit,
  Route,
  Layers,
  Sparkles,
  Save,
  X
} from 'lucide-react';

const TourOsmMap = dynamic(() => import('@/components/cms/TourOsmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-200 dark:border-slate-800">
      Đang tải bản đồ OpenStreetMap & Leaflet...
    </div>
  ),
});

export default function CmsTourPlannerPage() {
  const [tours, setTours] = useState<Tour[]>(MOCK_TOURS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TourStatus>('ALL');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(MOCK_TOURS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activePoiId, setActivePoiId] = useState<number | null>(
    MOCK_TOURS[0]?.pois?.[0]?.poi?.id || 1
  );

  // Form edit state
  const [editForm, setEditForm] = useState<{
    code: string;
    name: string;
    description: string;
    estimatedMinutes: number;
    status: TourStatus;
    coverImageUrl: string;
    pois: { poi: Poi; orderIndex: number }[];
  }>({
    code: '',
    name: '',
    description: '',
    estimatedMinutes: 60,
    status: 'DRAFT',
    coverImageUrl: '',
    pois: []
  });

  const [availablePoiToAdd, setAvailablePoiToAdd] = useState<number>(MOCK_POIS[0]?.id || 1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-activate the first waypoint when opening or switching tour
  React.useEffect(() => {
    if (selectedTour?.pois && selectedTour.pois.length > 0) {
      setActivePoiId(selectedTour.pois[0].poi.id);
    } else {
      setActivePoiId(null);
    }
  }, [selectedTour?.id]);

  // Keep an active POI when adding/removing in editing mode
  React.useEffect(() => {
    if (isEditing && editForm.pois.length > 0) {
      if (!activePoiId || !editForm.pois.some((p) => p.poi.id === activePoiId)) {
        setActivePoiId(editForm.pois[0].poi.id);
      }
    }
  }, [isEditing, editForm.pois, activePoiId]);

  // Filtered tours
  const filteredTours = tours.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setEditForm({
      code: tour.code,
      name: tour.name,
      description: tour.description || '',
      estimatedMinutes: tour.estimatedMinutes,
      status: tour.status,
      coverImageUrl: tour.coverImageUrl || '',
      pois: [...(tour.pois || [])]
    });
    setIsEditing(true);
    setIsCreatingNew(false);
  };

  const startNew = () => {
    const newCode = `TOUR_Q4_${Date.now().toString().slice(-4)}`;
    setEditForm({
      code: newCode,
      name: 'Tuyến tham quan mới',
      description: 'Mô tả chi tiết tuyến tham quan văn hóa, ẩm thực hoặc lịch sử...',
      estimatedMinutes: 45,
      status: 'DRAFT',
      coverImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
      pois: [
        { poi: MOCK_POIS[0], orderIndex: 1 },
        { poi: MOCK_POIS[1], orderIndex: 2 }
      ]
    });
    setSelectedTour(null);
    setIsCreatingNew(true);
    setIsEditing(true);
  };

  const movePoi = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editForm.pois.length) return;

    const updated = [...editForm.pois];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign orderIndex
    const reordered = updated.map((item, idx) => ({
      ...item,
      orderIndex: idx + 1
    }));

    setEditForm({ ...editForm, pois: reordered });
  };

  const removePoi = (index: number) => {
    const updated = editForm.pois.filter((_, idx) => idx !== index).map((item, idx) => ({
      ...item,
      orderIndex: idx + 1
    }));
    setEditForm({ ...editForm, pois: updated });
  };

  const addPoiToTour = () => {
    const poiObj = MOCK_POIS.find((p) => p.id === availablePoiToAdd);
    if (!poiObj) return;
    if (editForm.pois.some((item) => item.poi.id === poiObj.id)) {
      alert('Điểm POI này đã có trong lộ trình tour!');
      return;
    }
    const updated = [
      ...editForm.pois,
      { poi: poiObj, orderIndex: editForm.pois.length + 1 }
    ];
    setEditForm({ ...editForm, pois: updated });
  };

  const handleSave = () => {
    if (!editForm.name.trim()) {
      alert('Vui lòng nhập tên tour');
      return;
    }
    if (editForm.pois.length === 0) {
      alert('Tuyến tour phải có ít nhất 1 điểm dừng POI');
      return;
    }

    if (isCreatingNew) {
      const newTour: Tour = {
        id: Date.now(),
        code: editForm.code,
        name: editForm.name,
        description: editForm.description,
        estimatedMinutes: editForm.estimatedMinutes,
        status: editForm.status,
        version: 1,
        coverImageUrl: editForm.coverImageUrl,
        pois: editForm.pois
      };
      setTours([newTour, ...tours]);
      setSelectedTour(newTour);
    } else if (selectedTour) {
      const updatedList = tours.map((t) => {
        if (t.id === selectedTour.id) {
          return {
            ...t,
            code: editForm.code,
            name: editForm.name,
            description: editForm.description,
            estimatedMinutes: editForm.estimatedMinutes,
            status: editForm.status,
            coverImageUrl: editForm.coverImageUrl,
            pois: editForm.pois,
            version: t.version + 1
          };
        }
        return t;
      });
      setTours(updatedList);
      setSelectedTour(updatedList.find((t) => t.id === selectedTour.id) || null);
    }

    setIsEditing(false);
    setIsCreatingNew(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const deleteTour = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tuyến tour này khỏi hệ thống?')) {
      const updated = tours.filter((t) => t.id !== id);
      setTours(updated);
      if (selectedTour?.id === id) {
        setSelectedTour(updated[0] || null);
        setIsEditing(false);
      }
    }
  };

  const currentDisplayPois = isEditing ? editForm.pois : (selectedTour?.pois || []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-7 h-7 text-emerald-600" />
            Quản lý Tuyến Tour Tham quan (Tour Planner)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết kế lộ trình du lịch chuyên đề, sắp xếp thứ tự điểm dừng POI (`FR-CMS-14`) và xem trước liên kết tuyến (`FR-MAP-08`).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tours"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Xem giao diện khách
          </Link>
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tạo Tour Mới
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Đã lưu thông tin tuyến tour thành công! Sẵn sàng đồng bộ cho du khách.
        </div>
      )}

      {/* Main Grid: Left List (40%), Right Planner & Route Map (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tour List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            {/* Search & Status Filters */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã tour..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-1.5 text-xs">
              {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'Tất cả' : st === 'PUBLISHED' ? 'Đã xuất bản' : st === 'DRAFT' ? 'Nháp' : 'Lưu trữ'}
                </button>
              ))}
            </div>
          </div>

          {/* Tour Cards */}
          <div className="space-y-3">
            {filteredTours.map((tour) => {
              const isSelected = selectedTour?.id === tour.id && !isCreatingNew;
              return (
                <div
                  key={tour.id}
                  onClick={() => {
                    setSelectedTour(tour);
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tour.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tour.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tour.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tour.status === 'PUBLISHED' ? 'Xuất bản' : tour.status === 'DRAFT' ? 'Bản nháp' : 'Lưu trữ'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mt-1.5 line-clamp-1">{tour.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tour.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {tour.estimatedMinutes} phút
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {tour.pois?.length || 0} điểm POI
                      </span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => startEdit(tour)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Chỉnh sửa tour"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTour(tour.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Xóa tour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tour Editor or Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {isEditing ? (
            /* Editing / Creating Mode */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-800 text-lg">
                    {isCreatingNew ? 'Thiết lập Tuyến Tour Mới' : `Chỉnh sửa Tour: ${editForm.name}`}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Tour (Code)</label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full text-sm font-mono px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái phát hành</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TourStatus })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="DRAFT">Bản nháp (DRAFT)</option>
                    <option value="PUBLISHED">Xuất bản công khai (PUBLISHED)</option>
                    <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Tuyến Tour</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="VD: Ký ức Lịch sử Bến cảng Khánh Hội..."
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả Tour</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian dự kiến (phút)</label>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={editForm.estimatedMinutes}
                    onChange={(e) => setEditForm({ ...editForm, estimatedMinutes: Number(e.target.value) })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ảnh bìa (Cover Image URL)</label>
                  <input
                    type="text"
                    value={editForm.coverImageUrl}
                    onChange={(e) => setEditForm({ ...editForm, coverImageUrl: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Waypoints Sequencer */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Route className="w-4 h-4 text-emerald-600" />
                      Lộ trình điểm dừng POI ({editForm.pois.length} điểm)
                    </h3>
                    <p className="text-xs text-slate-500">Sắp xếp thứ tự tham quan theo trình tự logic</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={availablePoiToAdd}
                      onChange={(e) => setAvailablePoiToAdd(Number(e.target.value))}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      {MOCK_POIS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addPoiToTour}
                      className="px-2.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm điểm
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {editForm.pois.map((item, idx) => {
                    const isActive = activePoiId === item.poi.id;
                    return (
                      <div
                        key={item.poi.id}
                        onClick={() => setActivePoiId(item.poi.id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                          isActive
                            ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-400/40'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 transition-transform ${
                              isActive
                                ? 'bg-amber-500 text-white ring-2 ring-amber-300 scale-105'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                              {item.poi.name}
                              {isActive && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.poi.ward?.name} • Bán kính Geofence: {item.poi.radiusMeters}m
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => movePoi(idx, 'UP')}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded disabled:opacity-30"
                            title="Di chuyển lên trên"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePoi(idx, 'DOWN')}
                            disabled={idx === editForm.pois.length - 1}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded disabled:opacity-30"
                            title="Di chuyển xuống dưới"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePoi(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded ml-1"
                            title="Xóa khỏi tour"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {editForm.pois.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-lg">
                      Chưa có điểm POI nào. Chọn điểm từ danh sách trên để thêm vào lộ trình.
                    </div>
                  )}
                </div>

                {/* Real-time OpenStreetMap preview while editing */}
                {editForm.pois.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Xem trước lộ trình thời gian thực (OpenStreetMap & Leaflet)
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Tự động cập nhật khi thêm / bớt / đổi thứ tự POI
                      </span>
                    </div>

                    <TourOsmMap
                      waypoints={editForm.pois}
                      selectedPoiId={activePoiId}
                      onSelectWaypoint={(poiId) => setActivePoiId(poiId)}
                      height="300px"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  <Save className="w-4 h-4" /> Lưu thông tin Tour
                </button>
              </div>
            </div>
          ) : selectedTour ? (
            /* Selected Tour Overview & SVG Route Map Preview */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedTour.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        selectedTour.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedTour.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {selectedTour.status === 'PUBLISHED' ? 'Đã Xuất Bản' : selectedTour.status === 'DRAFT' ? 'Bản Nháp' : 'Lưu Trữ'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedTour.name}</h2>
                  <p className="text-sm text-slate-600 mt-1">{selectedTour.description}</p>
                </div>
                <button
                  onClick={() => startEdit(selectedTour)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg"
                >
                  <Edit className="w-4 h-4" /> Chỉnh sửa
                </button>
              </div>

              {/* Interactive Open-Source Leaflet & OpenStreetMap Route Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Bản đồ Lộ trình Tuyến Tour Thực địa (OpenStreetMap & Leaflet)
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Mã nguồn mở 100% • Tự động nối tuyến tuần tự
                  </span>
                </div>

                <TourOsmMap
                  waypoints={currentDisplayPois}
                  selectedPoiId={activePoiId}
                  onSelectWaypoint={(poiId) => setActivePoiId(poiId)}
                  height="380px"
                />
              </div>

              {/* Waypoint Sequence Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Danh sách các trạm dừng tuần tự ({currentDisplayPois.length} điểm)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Bấm vào trạm để phóng to và xem trên bản đồ
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDisplayPois.map((item, idx) => {
                    const isActive = activePoiId === item.poi.id;
                    return (
                      <div
                        key={item.poi.id}
                        onClick={() => setActivePoiId(item.poi.id)}
                        className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-all border ${
                          isActive
                            ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform ${
                            isActive
                              ? 'bg-amber-500 text-white ring-2 ring-amber-300 scale-110'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {item.poi.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white flex-shrink-0">
                                Đang xem
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.poi.ward?.name} • Bán kính {item.poi.radiusMeters}m
                          </div>
                          {item.poi.busStop && (
                            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Gần: {item.poi.busStop.name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white border rounded-xl">
              Chọn một tour ở danh sách bên trái hoặc tạo tour mới để xem chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
