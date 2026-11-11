'use client';

import { useEffect, useState } from 'react';
import { Languages, Download, Upload, CheckCircle2, AlertCircle, FileText, Volume2 } from 'lucide-react';
import { getCoverageMatrix, type CoverageCell, type CoverageRow } from '@/services/cmsPois';

export default function CmsTranslationMatrixPage() {
  const [rows, setRows] = useState<CoverageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getCoverageMatrix(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setRows(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRows([]);
          setError('Không tải được ma trận độ phủ. Kiểm tra phiên CMS hoặc kết nối backend.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const languages = rows[0]?.languages.map((cell) => cell.languageCode) ?? [];
  const completeCount = rows.filter((row) =>
    row.languages.every((cell) => cell.hasTranslation && cell.hasTtsScript),
  ).length;

  const getCellStatus = (cell: CoverageCell | undefined) => {
    if (cell?.hasAudio) {
      return { type: 'AUDIO', label: 'Audio thu sẵn', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (cell?.hasTtsScript) {
      return { type: 'TTS', label: 'Script TTS', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (cell?.hasTranslation) {
      return { type: 'TEXT', label: 'Có bản dịch', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
    return { type: 'MISSING', label: 'Thiếu nội dung', color: 'bg-red-50 text-red-600 border-red-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Languages className="w-5 h-5 text-emerald-600" />
            Ma trận độ phủ Ngôn ngữ & Bản dịch (FR-CMS-13)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng quan tình trạng biên dịch và audio của {rows.length} điểm POI trên {languages.length} ngôn ngữ đang kích hoạt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã xuất file Excel mẫu ma trận bản dịch đa ngữ!')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Xuất Excel
          </button>
          <button
            onClick={() => alert('Mở hộp thoại chọn file CSV/Excel bản dịch đa ngữ để import hàng loạt!')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Nhập file bản dịch
          </button>
        </div>
      </div>

      {/* Legend status indicators */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs">
        <span className="font-bold text-slate-700">Chú thích trạng thái:</span>
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Audio thu sẵn của HDV
        </span>
        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-amber-400"></span> Kịch bản đọc TTS
        </span>
        <span className="flex items-center gap-1.5 text-sky-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-sky-400"></span> Có bản dịch
        </span>
        <span className="flex items-center gap-1.5 text-red-600 font-medium">
          <span className="w-3 h-3 rounded-full bg-red-400"></span> Thiếu nội dung
        </span>
        {!loading && !error && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completeCount}/{rows.length} POI đủ bản dịch & TTS
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* The Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 min-w-[220px]">Điểm POI</th>
              <th className="py-3 px-3 text-center">Tiến độ</th>
              {languages.map((code) => (
                <th key={code} className="py-3 px-3 text-center font-mono uppercase">
                  {code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={Math.max(2, languages.length + 2)} className="py-10 text-center text-slate-500">
                  Đang tải ma trận độ phủ...
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={2} className="py-10 text-center text-slate-500">
                  Chưa có điểm POI nào để hiển thị.
                </td>
              </tr>
            )}
            {!loading && rows.map((row) => {
              const cells = new Map(row.languages.map((cell) => [cell.languageCode, cell]));
              return (
                <tr key={row.poiId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{row.poiName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{row.poiCode}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                    {row.translationCount}/{row.languages.length}
                  </td>
                  {languages.map((code) => {
                    const status = getCellStatus(cells.get(code));
                    return (
                      <td key={code} className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${status.color}`}
                        >
                          {status.type === 'AUDIO' && <Volume2 className="w-3 h-3" />}
                          {status.type === 'TTS' && <FileText className="w-3 h-3" />}
                          {status.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
