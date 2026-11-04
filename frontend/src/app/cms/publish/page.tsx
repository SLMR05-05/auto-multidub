'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';
import { MOCK_POIS } from '@/services/mockData';

export default function CmsPublishPage() {
  const [dataVersion, setDataVersion] = useState(2);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setDataVersion((v) => v + 1);
      setIsPublishing(false);
      setPublishedSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-600" />
          Cổng Kiểm Duyệt Xuất Bản & Đóng Gói Offline (FR-CMS-18, FR-CMS-19)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tăng phiên bản dữ liệu toàn hệ thống để kích hoạt đồng bộ vi sai (Delta Sync) về thiết bị du khách
        </p>
      </div>

      {publishedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Đã xuất bản phiên bản dữ liệu v{dataVersion} thành công!</p>
            <p className="font-normal text-emerald-700 mt-0.5">
              Hệ thống đã ghi nhận vào Audit Log. Toàn bộ thiết bị di động của du khách khi kết nối mạng sẽ tự động kéo bản cập nhật vi sai mới nhất.
            </p>
          </div>
        </div>
      )}

      {/* Publish Gate Checks Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Điều kiện kiểm duyệt xuất bản (Publish Gate Validation)
          </h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Phiên bản hiện tại: v{dataVersion}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              100% POI đã có tọa độ GPS hợp lệ và bán kính Geofence
            </span>
            <span className="font-bold text-emerald-600">Đạt ({MOCK_POIS.length}/{MOCK_POIS.length})</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Nội dung gốc Tiếng Việt bắt buộc đã đầy đủ mô tả
            </span>
            <span className="font-bold text-emerald-600">Đạt ({MOCK_POIS.length}/{MOCK_POIS.length})</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Đã tạo mã QR hiện trường liên kết với trạm xe buýt
            </span>
            <span className="font-bold text-emerald-600">Sẵn sàng</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isPublishing ? 'Đang đóng gói và tăng version dữ liệu...' : `Xuất bản phiên bản mới (Lên v${dataVersion + 1})`}
          </button>
        </div>
      </div>
    </div>
  );
}
