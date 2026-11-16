'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  listCmsTours,
  archiveCmsTour,
} from '@/services/cmsTours';
import { listCmsPois, type CmsPoi } from '@/services/cmsPois';
import { Tour, TourStatus, Poi } from '@/types';
import TourEditModal from '@/components/cms/TourEditModal';
import {
  Compass,
  Plus,
  Search,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  Eye,
  Edit,
  Route,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

function cmsPoiToPoi(poi: CmsPoi): Poi {
  return {
    id: poi.id,
    code: poi.code,
    name: poi.name,
    wardId: poi.wardId ?? undefined,
    busStopId: poi.busStopId ?? undefined,
    latitude: poi.latitude,
    longitude: poi.longitude,
    radiusMeters: poi.radiusMeters,
    priority: poi.priority,
    cooldownMinutes: poi.cooldownMinutes ?? undefined,
    status: poi.status,
    version: poi.version,
    isDeleted: false,
    ward: poi.wardName
      ? { id: poi.wardId ?? 0, name: poi.wardName, district: '', city: '' }
      : undefined,
    busStop: poi.busStopName
      ? {
          id: poi.busStopId ?? 0,
          name: poi.busStopName,
          latitude: poi.latitude,
          longitude: poi.longitude,
          isActive: true,
        }
      : undefined,
  } as Poi;
}

const TourOsmMap = dynamic(() => import('@/components/cms/TourOsmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs text-slate-400 animate-pulse border border-slate-200 dark:border-slate-800">
      Đang tải bản đồ OpenStreetMap & Leaflet...
    </div>
  ),
});

export default function CmsTourPlannerPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [pois, setPois] = useState<CmsPoi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TourStatus>('ALL');

  // Selected tour & active POI for map
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [expandedTourId, setExpandedTourId] = useState<number | null>(null);
  const [activePoiId, setActivePoiId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Tours & POIs
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([
      listCmsTours({ page: 0, size: 100 }, controller.signal),
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
    ])
      .then(([tourResult, poiResult]) => {
        if (controller.signal.aborted) return;
        const poiMap = new Map(poiResult.map((poi) => [poi.id, poi]));
        const enrichedTours = tourResult.content.map((tour) => ({
          ...tour,
          pois: tour.pois?.map((item) => {
            const cmsPoi = poiMap.get(item.poi.id);
            return cmsPoi ? { poi: cmsPoiToPoi(cmsPoi), orderIndex: item.orderIndex } : item;
          }),
        }));
        setTours(enrichedTours);
        setPois(poiResult);

        if (enrichedTours.length > 0) {
          const firstTour = enrichedTours[0];
          setSelectedTour(firstTour);
          setExpandedTourId(firstTour.id);
          if (firstTour.pois && firstTour.pois.length > 0) {
            setActivePoiId(firstTour.pois[0].poi.id);
          }
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Không tải được dữ liệu tour từ Backend.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Update activePoiId when selected tour changes
  useEffect(() => {
    if (selectedTour?.pois && selectedTour.pois.length > 0) {
      setActivePoiId(selectedTour.pois[0].poi.id);
    } else {
      setActivePoiId(null);
    }
  }, [selectedTour?.id]);

  const poiOptions = pois.map(cmsPoiToPoi);

  // Filtered tours
  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTourClick = (tour: Tour) => {
    if (selectedTour?.id === tour.id) {
      // Toggle accordion if already selected
      setExpandedTourId((prev) => (prev === tour.id ? null : tour.id));
    } else {
      // Select new tour and expand its accordion
      setSelectedTour(tour);
      setExpandedTourId(tour.id);
      if (tour.pois && tour.pois.length > 0) {
        setActivePoiId(tour.pois[0].poi.id);
      } else {
        setActivePoiId(null);
      }
    }
  };

  const openCreateModal = () => {
    setIsCreatingNew(true);
    setIsModalOpen(true);
  };

  const openEditModal = (tour: Tour) => {
    setSelectedTour(tour);
    setIsCreatingNew(false);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = (saved: Tour) => {
    const exists = tours.some((t) => t.id === saved.id);
    const updatedList = exists
      ? tours.map((t) => (t.id === saved.id ? saved : t))
      : [saved, ...tours];

    setTours(updatedList);
    setSelectedTour(saved);
    setExpandedTourId(saved.id);
    if (saved.pois && saved.pois.length > 0) {
      setActivePoiId(saved.pois[0].poi.id);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const deleteTour = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tuyến tour này khỏi hệ thống?')) return;
    try {
      await archiveCmsTour(id);
      const updated = tours.filter((t) => t.id !== id);
      setTours(updated);
      if (selectedTour?.id === id) {
        const nextTour = updated[0] || null;
        setSelectedTour(nextTour);
        setExpandedTourId(nextTour?.id || null);
        setActivePoiId(nextTour?.pois?.[0]?.poi.id || null);
      }
    } catch {
      alert('Không xóa được tour. Kiểm tra quyền CMS và kết nối.');
    }
  };

  const currentDisplayPois = selectedTour?.pois || [];
  const activePoi = currentDisplayPois.find((p) => p.poi.id === activePoiId)?.poi;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Quản lý Tuyến Tour Tham quan 
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết kế lộ trình du lịch chuyên đề, sắp xếp thứ tự trạm dừng và xem trực quan trên bản đồ OpenStreetMap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tours"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl shadow-sm transition"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Xem giao diện khách
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tạo Tour Mới
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Đã cập nhật dữ liệu tour thành công! Lộ trình đã sẵn sàng đồng bộ cho du khách.</span>
        </div>
      )}

      {/* Main Layout:
          LEFT COLUMN: Large Interactive Map (takes full width of left side)
          RIGHT COLUMN: Compact Tour List with Accordion Stops
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Map & Active Tour Overview (65% on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Map Top Bar: Active Tour Info & Quick Edit Button */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
              {selectedTour ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold">
                    <Route className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {selectedTour.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedTour.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : selectedTour.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {selectedTour.status === 'PUBLISHED'
                          ? 'Đã Xuất Bản'
                          : selectedTour.status === 'DRAFT'
                          ? 'Bản Nháp'
                          : 'Lưu Trữ'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {selectedTour.estimatedMinutes} phút
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {currentDisplayPois.length} trạm dừng
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate mt-0.5">
                      {selectedTour.name}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-500">
                  Chưa chọn tuyến tour nào
                </div>
              )}

              {selectedTour && (
                <button
                  type="button"
                  onClick={() => openEditModal(selectedTour)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition ml-auto"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Chỉnh sửa tour
                </button>
              )}
            </div>

            {/* The Full Map Component */}
            <div className="relative">
              <TourOsmMap
                waypoints={currentDisplayPois}
                selectedPoiId={activePoiId}
                onSelectWaypoint={(poiId) => setActivePoiId(poiId)}
                height="620px"
              />

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Compact Tour List with Accordion Waypoints (35% on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Search & Filter Card */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã tour..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-1 text-[11px] overflow-x-auto pb-0.5">
              {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'ALL'
                    ? 'Tất cả'
                    : st === 'PUBLISHED'
                    ? 'Xuất bản'
                    : st === 'DRAFT'
                    ? 'Nháp'
                    : 'Lưu trữ'}
                </button>
              ))}
            </div>
          </div>

          {/* Tour Compact List with Scroll */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
            <span>Danh sách ({filteredTours.length})</span>
            <span className="text-[11px] text-slate-400">Cuộn để xem thêm</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-250px)] lg:max-h-[580px] overflow-y-auto pr-1.5">
            {loading && (
              <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Đang tải danh sách tuyến tour...
              </div>
            )}

            {!loading && filteredTours.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Không tìm thấy tuyến tour phù hợp.
              </div>
            )}

            {filteredTours.map((tour) => {
              const isSelected = selectedTour?.id === tour.id;
              const isExpanded = expandedTourId === tour.id;
              const poiCount = tour.pois?.length || 0;

              return (
                <div
                  key={tour.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* Tour Item Compact Header (Click to Select & Expand Accordion) */}
                  <div
                    onClick={() => handleTourClick(tour)}
                    className="p-3 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {tour.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            tour.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : tour.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {tour.status === 'PUBLISHED'
                            ? 'Xuất bản'
                            : tour.status === 'DRAFT'
                            ? 'Bản nháp'
                            : 'Lưu trữ'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {tour.estimatedMinutes}p
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-180 text-emerald-600' : ''
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Tour Name & Stops summary */}
                    <div className="mt-1.5 flex items-baseline justify-between gap-2">
                      <h3
                        className={`text-xs font-bold line-clamp-1 ${
                          isSelected
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {tour.name}
                      </h3>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 flex-shrink-0">
                        <MapPin className="w-3 h-3" />
                        {poiCount} trạm
                      </span>
                    </div>
                  </div>

                  {/* Accordion Dropdown: Stops List & Tour Actions */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/30 p-3 space-y-3 animate-fadeIn">
                      {tour.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {tour.description}
                        </p>
                      )}

                      {/* Stops Sequencer List */}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-600" />
                          Lộ trình {poiCount} trạm dừng:
                        </div>

                        {poiCount === 0 ? (
                          <div className="p-3 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                            Tuyến tour chưa có trạm dừng nào
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {tour.pois?.map((item, idx) => {
                              const isPointActive = activePoiId === item.poi.id;
                              return (
                                <div
                                  key={item.poi.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTour(tour);
                                    setActivePoiId(item.poi.id);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs border ${
                                    isPointActive
                                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/60 shadow-xs ring-1 ring-amber-300'
                                      : 'bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                                        isPointActive
                                          ? 'bg-amber-500 text-white'
                                          : 'bg-emerald-600 text-white'
                                      }`}
                                    >
                                      {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-slate-800 dark:text-slate-100 truncate text-[11px]">
                                        {item.poi.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {item.poi.ward?.name || 'Quận 4'} • {item.poi.radiusMeters}m
                                      </div>
                                    </div>
                                  </div>

                                  {isPointActive && (
                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500 text-white flex-shrink-0">
                                      Xem
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Action buttons inside expanded tour */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTour(tour.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                          title="Xóa tour"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(tour);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa tour</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Standalone Edit Form Modal Component */}
      <TourEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCreatingNew={isCreatingNew}
        initialTour={selectedTour}
        poiOptions={poiOptions}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
