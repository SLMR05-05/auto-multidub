'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { archiveCmsPoi, listCmsPois, listCmsWards, type CmsPoi } from '@/services/cmsPois';
import { MapPin, Plus, Search, Edit3, Trash2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export default function CmsPoiListPage() {
  const [pois, setPois] = useState<CmsPoi[]>([]);
  const [wards, setWards] = useState<Awaited<ReturnType<typeof listCmsWards>>>([]);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    listCmsWards(controller.signal).then(setWards).catch(() => {
      if (!controller.signal.aborted) setError('Không tải được danh sách phường.');
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ page: String(page), size: '20' });
    if (search.trim()) query.set('search', search.trim());
    if (wardFilter) query.set('wardId', wardFilter);
    listCmsPois(query, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setPois(data.content);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPois([]);
          setTotalPages(0);
          setError('Không tải được danh sách POI. Kiểm tra phiên CMS hoặc kết nối.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, wardFilter, page, revision]);

  async function handleDelete(id: number) {
    if (archiving !== null || !window.confirm('Lưu trữ điểm thuyết minh này?')) return;
    setArchiving(id);
    setError('');
    try {
      await archiveCmsPoi(id);
      setRevision((value) => value + 1);
    } catch {
      setError('Không lưu trữ được POI. Kiểm tra quyền và các liên kết đang sử dụng điểm này.');
    } finally {
      setArchiving(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Quản lý Điểm thuyết minh (POI Registry)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mạng lưới tọa độ GPS, bán kính kích hoạt Geofence và dữ liệu thuyết minh hiện trường
          </p>
        </div>

        <Link
          href="/cms/poi/editor"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          Tạo điểm POI mới
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Tìm theo tên POI hoặc mã định danh..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 shrink-0">Lọc theo phường:</span>
          <select
            value={wardFilter}
            onChange={(e) => { setWardFilter(e.target.value); setPage(0); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-medium"
          >
            <option value="">Tất cả</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                P. {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {loading && <p role="status">Đang tải POI…</p>}
      {!loading && !error && !pois.length && <p>Không có POI phù hợp.</p>}

      {/* POI Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Mã POI</th>
              <th className="py-3 px-4">Tên địa danh</th>
              <th className="py-3 px-4">Địa bàn / Trạm buýt</th>
              <th className="py-3 px-4">Tọa độ GPS</th>
              <th className="py-3 px-4">Bán kính Geofence</th>
              <th className="py-3 px-4">Độ ưu tiên</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && pois.map((poi) => (
              <tr key={poi.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-700">{poi.code}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">{poi.name}</p>
                  <span className="text-[10px] text-slate-400">Version {poi.version}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-700 block">P. {poi.wardName}</span>
                  <span className="text-[10px] text-slate-500">{poi.busStopName}</span>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                  {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                    {poi.radiusMeters} mét
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-800">Mức {poi.priority}/5</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    {poi.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/cms/poi/editor/${poi.id}`}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Sửa POI & Geofence"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(poi.id)}
                      disabled={archiving !== null || poi.status === 'ARCHIVED'}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa mềm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav aria-label="Phân trang POI" className="flex items-center gap-4">
          <button disabled={loading || page === 0} onClick={() => setPage(page - 1)}>Trang trước</button>
          <span>{page + 1} / {totalPages}</span>
          <button disabled={loading || page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Trang sau</button>
        </nav>
      )}
    </div>
  );
}
