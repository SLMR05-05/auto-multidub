'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tour, TourStatus, Poi } from '@/types';
import {
  createCmsTour,
  updateCmsTour,
  setCmsTourPois,
  publishCmsTour,
  archiveCmsTour,
  type TourInput,
} from '@/services/cmsTours';
import {
  X,
  Sparkles,
  Route,
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  Save,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

const TourOsmMap = dynamic(() => import('@/components/cms/TourOsmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-200 dark:border-slate-700">
      Đang tải bản đồ OpenStreetMap...
    </div>
  ),
});

interface TourEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreatingNew: boolean;
  initialTour: Tour | null;
  poiOptions: Poi[];
  onSaveSuccess: (savedTour: Tour) => void;
}

export default function TourEditModal({
  isOpen,
  onClose,
  isCreatingNew,
  initialTour,
  poiOptions,
  onSaveSuccess,
}: TourEditModalProps) {
  const [formData, setFormData] = useState<{
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
    pois: [],
  });

  const [availablePoiToAdd, setAvailablePoiToAdd] = useState<number>(1);
  const [activePoiId, setActivePoiId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form on open
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (isCreatingNew) {
      const newCode = `TOUR_Q4_${Date.now().toString().slice(-4)}`;
      const initialPois: { poi: Poi; orderIndex: number }[] = [];
      if (poiOptions.length > 0) {
        initialPois.push({ poi: poiOptions[0], orderIndex: 1 });
      }
      if (poiOptions.length > 1) {
        initialPois.push({ poi: poiOptions[1], orderIndex: 2 });
      }

      setFormData({
        code: newCode,
        name: 'Tuyến tham quan mới',
        description: 'Mô tả chi tiết tuyến tham quan văn hóa, ẩm thực hoặc lịch sử...',
        estimatedMinutes: 45,
        status: 'DRAFT',
        coverImageUrl:
          'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
        pois: initialPois,
      });
      if (initialPois.length > 0) {
        setActivePoiId(initialPois[0].poi.id);
      }
    } else if (initialTour) {
      setFormData({
        code: initialTour.code || '',
        name: initialTour.name || '',
        description: initialTour.description || '',
        estimatedMinutes: initialTour.estimatedMinutes || 60,
        status: initialTour.status || 'DRAFT',
        coverImageUrl: initialTour.coverImageUrl || '',
        pois: [...(initialTour.pois || [])],
      });
      if (initialTour.pois && initialTour.pois.length > 0) {
        setActivePoiId(initialTour.pois[0].poi.id);
      }
    }

    if (poiOptions.length > 0) {
      setAvailablePoiToAdd(poiOptions[0].id);
    }
  }, [isOpen, isCreatingNew, initialTour, poiOptions]);

  // Keep an active waypoint
  useEffect(() => {
    if (formData.pois.length > 0) {
      if (!activePoiId || !formData.pois.some((p) => p.poi.id === activePoiId)) {
        setActivePoiId(formData.pois[0].poi.id);
      }
    } else {
      setActivePoiId(null);
    }
  }, [formData.pois, activePoiId]);

  if (!isOpen) return null;

  const movePoi = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.pois.length) return;

    const updated = [...formData.pois];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      orderIndex: idx + 1,
    }));

    setFormData({ ...formData, pois: reordered });
  };

  const removePoi = (index: number) => {
    const updated = formData.pois
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({
        ...item,
        orderIndex: idx + 1,
      }));
    setFormData({ ...formData, pois: updated });
  };

  const addPoiToTour = () => {
    const poiObj = poiOptions.find((p) => p.id === availablePoiToAdd);
    if (!poiObj) return;
    if (formData.pois.some((item) => item.poi.id === poiObj.id)) {
      alert('Điểm POI này đã có trong lộ trình tour!');
      return;
    }
    const updated = [
      ...formData.pois,
      { poi: poiObj, orderIndex: formData.pois.length + 1 },
    ];
    setFormData({ ...formData, pois: updated });
    setActivePoiId(poiObj.id);
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!formData.name.trim()) {
      setErrorMsg('Vui lòng nhập tên tour');
      return;
    }
    if (formData.pois.length === 0) {
      setErrorMsg('Tuyến tour phải có ít nhất 1 điểm dừng POI');
      return;
    }

    setSaving(true);
    const input: TourInput = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
    };
    const poiIds = formData.pois.map((item) => item.poi.id);

    try {
      let saved: Tour;
      if (isCreatingNew) {
        saved = await createCmsTour(input);
      } else if (initialTour) {
        saved = await updateCmsTour(initialTour.id, input);
      } else {
        return;
      }
      saved = await setCmsTourPois(saved.id, poiIds);
      if (formData.status === 'PUBLISHED') {
        saved = await publishCmsTour(saved.id);
      } else if (formData.status === 'ARCHIVED') {
        await archiveCmsTour(saved.id);
        saved = { ...saved, status: 'ARCHIVED' };
      }

      saved = {
        ...saved,
        estimatedMinutes: formData.estimatedMinutes,
        coverImageUrl: formData.coverImageUrl || saved.coverImageUrl,
        pois: formData.pois,
      };

      onSaveSuccess(saved);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không lưu được tour. Vui lòng kiểm tra quyền và kết nối.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {isCreatingNew ? 'Tạo Tuyến Tour Mới' : `Chỉnh sửa Tour: ${formData.name}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCreatingNew
                  ? 'Thiết lập thông tin và cấu hình các điểm dừng cho lộ trình du lịch mới'
                  : `Cập nhật thông số lộ trình và sắp xếp thứ tự trạm dừng (${formData.code})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-200">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Mã Tour (Code)
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full text-sm font-mono px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Trạng thái phát hành
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TourStatus })}
                className="w-full text-sm px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="PUBLISHED">Xuất bản công khai (PUBLISHED)</option>
                <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tên Tuyến Tour *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Khám phá Ký ức Lịch sử Bến Vân Đồn..."
                className="w-full text-sm px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Mô tả Lộ trình Tour
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Giới thiệu điểm nổi bật, chủ đề văn hóa ẩm thực hoặc lưu ý di chuyển..."
                className="w-full text-sm px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời lượng dự kiến (phút)
              </label>
              <input
                type="number"
                min="10"
                max="600"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                className="w-full text-sm px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> URL Ảnh bìa
              </label>
              <input
                type="text"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-sm px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Waypoints Sequencer */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Danh sách trạm dừng POI ({formData.pois.length} điểm)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sắp xếp trình tự ghé thăm bằng nút di chuyển Lên / Xuống
                </p>
              </div>

              {/* Add POI control */}
              <div className="flex items-center gap-2">
                <select
                  value={availablePoiToAdd}
                  onChange={(e) => setAvailablePoiToAdd(Number(e.target.value))}
                  className="text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 max-w-[220px] truncate focus:ring-2 focus:ring-emerald-500"
                >
                  {poiOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addPoiToTour}
                  className="px-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm điểm
                </button>
              </div>
            </div>

            {/* List of stops */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {formData.pois.map((item, idx) => {
                const isActive = activePoiId === item.poi.id;
                return (
                  <div
                    key={item.poi.id}
                    onClick={() => setActivePoiId(item.poi.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                      isActive
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-sm ring-1 ring-amber-400'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 transition ${
                          isActive
                            ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                          <span>{item.poi.name}</span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.poi.ward?.name || 'Quận 4'} • Bán kính {item.poi.radiusMeters}m
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => movePoi(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"
                        title="Di chuyển lên trên"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePoi(idx, 'DOWN')}
                        disabled={idx === formData.pois.length - 1}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition"
                        title="Di chuyển xuống dưới"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePoi(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg ml-1 transition"
                        title="Xóa khỏi tour"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {formData.pois.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                  Chưa có điểm POI nào. Hãy chọn điểm từ danh sách trên để thêm vào lộ trình.
                </div>
              )}
            </div>

            {/* Real-time OpenStreetMap preview inside modal */}
            {formData.pois.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Xem trước lộ trình thời gian thực
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Tự động vẽ polyline kết nối các điểm dừng
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <TourOsmMap
                    waypoints={formData.pois}
                    selectedPoiId={activePoiId}
                    onSelectWaypoint={(poiId) => setActivePoiId(poiId)}
                    height="260px"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thông tin Tour
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

