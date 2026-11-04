'use client';

import { useState } from 'react';
import { Languages, Download, Upload, CheckCircle2, AlertCircle, FileText, Volume2 } from 'lucide-react';
import { MOCK_POIS } from '@/services/mockData';
import { useLanguageStore } from '@/stores/languageStore';

export default function CmsTranslationMatrixPage() {
  const { getActiveLanguages } = useLanguageStore();
  const languages = getActiveLanguages();

  // Kiểm tra độ phủ nội dung
  const getCellStatus = (poiId: number, langCode: string) => {
    if (poiId === 1 && (langCode === 'vi' || langCode === 'en')) {
      return { type: 'AUDIO', label: 'Audio thu sẵn', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (langCode === 'vi') {
      return { type: 'TTS', label: 'Script TTS', color: 'bg-amber-50 text-amber-700 border-amber-200' };
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
            Tổng quan tình trạng biên dịch và audio của {MOCK_POIS.length} điểm POI trên {languages.length} ngôn ngữ đang kích hoạt
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
      <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs">
        <span className="font-bold text-slate-700">Chú thích trạng thái:</span>
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Audio thu sẵn của HDV
        </span>
        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-amber-400"></span> Kịch bản đọc TTS
        </span>
        <span className="flex items-center gap-1.5 text-red-600 font-medium">
          <span className="w-3 h-3 rounded-full bg-red-400"></span> Thiếu nội dung
        </span>
      </div>

      {/* The Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 min-w-[220px]">Điểm POI</th>
              <th className="py-3 px-3 text-center">Tiến độ</th>
              {languages.map((l) => (
                <th key={l.code} className="py-3 px-3 text-center font-mono uppercase">
                  {l.code} ({l.nativeName})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_POIS.map((poi) => {
              return (
                <tr key={poi.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{poi.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{poi.code}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                    {poi.id === 1 ? '2/7' : '1/7'}
                  </td>
                  {languages.map((l) => {
                    const status = getCellStatus(poi.id, l.code);
                    return (
                      <td key={l.code} className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold border ${status.color}`}
                        >
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
