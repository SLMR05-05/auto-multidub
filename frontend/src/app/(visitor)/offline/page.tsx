'use client';

import { useState } from 'react';
import {
  Download,
  HardDrive,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Wifi,
  ShieldAlert,
  Sparkles,
  Layers,
  Database,
  Check,
} from 'lucide-react';

interface OfflinePkg {
  id: string;
  name: string;
  category: string;
  sizeMb: number;
  isDownloaded: boolean;
  version: number;
}

export default function OfflineCenterPage() {
  const [packages, setPackages] = useState<OfflinePkg[]>([
    {
      id: 'PKG_IMAGES_ALL',
      name: 'Thư viện hình ảnh tư liệu di tích (Toàn bộ Quận 4)',
      category: 'Hình ảnh dùng chung',
      sizeMb: 24.5,
      isDownloaded: true,
      version: 2,
    },
    {
      id: 'PKG_AUDIO_VI',
      name: 'Dữ liệu giọng đọc thuyết minh Tiếng Việt (HD)',
      category: 'Audio (vi-VN)',
      sizeMb: 18.2,
      isDownloaded: true,
      version: 2,
    },
    {
      id: 'PKG_AUDIO_EN',
      name: 'Audio Narration English (US Native Voice)',
      category: 'Audio (en-US)',
      sizeMb: 16.8,
      isDownloaded: false,
      version: 1,
    },
    {
      id: 'PKG_AUDIO_TH',
      name: 'Audio Narration Thai (ไทย เสียงบรรยาย)',
      category: 'Audio (th-TH)',
      sizeMb: 17.1,
      isDownloaded: false,
      version: 1,
    },
    {
      id: 'PKG_AUDIO_ZH',
      name: 'Audio Narration Chinese (简体中文 语音包)',
      category: 'Audio (zh-CN)',
      sizeMb: 19.0,
      isDownloaded: false,
      version: 1,
    },
    {
      id: 'PKG_AUDIO_FR',
      name: 'Audio Narration French (Français)',
      category: 'Audio (fr-FR)',
      sizeMb: 17.5,
      isDownloaded: false,
      version: 1,
    },
  ]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === id ? { ...pkg, isDownloaded: true } : pkg))
      );
      setDownloadingId(null);
    }, 1400);
  };

  const handleDelete = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, isDownloaded: false } : pkg))
    );
  };

  const handleDownloadAllEssential = () => {
    setDownloadingId('ALL');
    setTimeout(() => {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === 'PKG_IMAGES_ALL' || pkg.id === 'PKG_AUDIO_VI' || pkg.id === 'PKG_AUDIO_EN'
            ? { ...pkg, isDownloaded: true }
            : pkg
        )
      );
      setDownloadingId(null);
    }, 2000);
  };

  const totalDownloadedMb = packages
    .filter((p) => p.isDownloaded)
    .reduce((sum, p) => sum + p.sizeMb, 0);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 pt-4 md:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <Database className="w-4 h-4" />
              <span>Chế độ ngoại tuyến không phụ thuộc 4G</span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Trung tâm dữ liệu Offline
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Tải trước gói âm thanh và hình ảnh để trải nghiệm thuyết minh trơn tru khi vào vùng khuất sóng
            </p>
          </div>

          <button
            onClick={handleDownloadAllEssential}
            disabled={downloadingId === 'ALL'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all self-start md:self-auto"
          >
            {downloadingId === 'ALL' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Tải gói cơ bản (Ảnh + VI + EN)</span>
          </button>
        </div>

        {/* Storage Usage Card */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Dung lượng bộ nhớ Offline đã dùng:</span>
                <span className="text-xs text-slate-400">Khuyến nghị tải qua mạng Wi-Fi trước chuyến đi</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-lg md:text-xl font-extrabold text-emerald-600">
                {totalDownloadedMb.toFixed(1)} MB
              </span>
              <span className="text-xs text-slate-400"> / 150 MB (Giới hạn đề xuất)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalDownloadedMb / 150) * 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Bộ nhớ trống thiết bị: ~12.4 GB</span>
            <span>Trạng thái: Hoạt động bình thường</span>
          </div>
        </div>

        {/* Packages List Grid (Mobile: 1 col, Desktop: 2 cols) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Danh mục gói dữ liệu ({packages.length})
            </h2>
            <span className="text-xs text-slate-400">
              Kiểm tra mã băm SHA-256 tự động
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => {
              const isDownloading = downloadingId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {pkg.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Phiên bản v{pkg.version}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 truncate">{pkg.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Dung lượng: {pkg.sizeMb} MB</p>
                  </div>

                  <div>
                    {pkg.isDownloaded ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã tải</span>
                        </span>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Xóa gói để giải phóng dung lượng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(pkg.id)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        {isDownloading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isDownloading ? 'Đang tải...' : 'Tải xuống'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}