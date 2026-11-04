'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Camera,
  Flashlight,
  Volume2,
  ShieldCheck,
  MapPin,
  Upload,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { MOCK_POIS } from '@/services/mockData';

export default function QrScannerPage() {
  const router = useRouter();
  const [flashlight, setFlashlight] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const { playPoi } = usePlayerStore();

  const handleSimulateScan = (poiId: number) => {
    setIsScanning(false);
    const poi = MOCK_POIS.find((p) => p.id === poiId) || MOCK_POIS[0];

    // Phát âm thanh ngay (ngắt bài cũ, bỏ qua Cooldown theo FR-QR-05)
    playPoi(poi, true);

    // Mở trang chi tiết POI
    router.push(`/poi/${poi.id}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    // Phân tích mã
    const code = manualCode.toUpperCase().trim();
    if (code.includes('NR') || code.includes('1863') || code.includes('RONG')) {
      handleSimulateScan(1);
    } else if (code.includes('XC') || code.includes('CHIEU') || code.includes('200')) {
      handleSimulateScan(2);
    } else if (code.includes('VH') || code.includes('VINH')) {
      handleSimulateScan(3);
    } else {
      // Mặc định mở POI 1
      handleSimulateScan(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-28 pt-4 md:pt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-2 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <QrCode className="w-4 h-4" />
              <span>Thuyết minh tức thời hiện trường</span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
              Quét mã QR trạm dừng & di tích
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Hướng camera vào bảng mã QR gắn tại nhà chờ xe buýt hoặc bia di tích để nghe thuyết minh trong $\le 5$s
            </p>
          </div>

          <button
            onClick={() => setFlashlight(!flashlight)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              flashlight
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Bật/Tắt đèn Flash"
          >
            <Flashlight className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Split on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Viewfinder (7 cols) */}
          <div className="md:col-span-6 lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 md:p-8 border border-slate-800 flex flex-col items-center justify-center shadow-xl">
            {/* Viewfinder Frame */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-emerald-500/70 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center overflow-hidden shadow-2xl shadow-emerald-500/10">
              {/* Animated Scanning Laser Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce"></div>

              {/* Corner Markers */}
              <div className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>

              <Camera className="w-14 h-14 text-slate-600 animate-pulse" />
            </div>

            <p className="text-xs text-slate-400 text-center mt-5 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Phát âm thanh tức thì độc lập, không yêu cầu GPS hay tải app</span>
            </p>

            {/* Upload QR Image button for desktop testing */}
            <label className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Tải ảnh mã QR từ máy tính để quét</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={() => handleSimulateScan(1)}
              />
            </label>
          </div>

          {/* Right Column: Manual Code Input & Test QR Codes (5 cols) */}
          <div className="md:col-span-6 lg:col-span-5 space-y-5">
            {/* Manual Code Input Form */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Nhập mã QR thủ công
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nếu camera không nhận diện được, du khách có thể nhập mã số in dưới mã QR:
              </p>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ví dụ: NR1863BS..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Mở</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Simulated QR Triggers */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                🧪 Thử nghiệm giả lập quét mã QR mẫu:
              </span>

              <div className="space-y-2">
                <button
                  onClick={() => handleSimulateScan(1)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 active:scale-98 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Trạm buýt 02: Bến Nhà Rồng
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        multidub.travel/q/NR1863BS
                      </p>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>

                <button
                  onClick={() => handleSimulateScan(2)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 active:scale-98 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Trạm buýt 03: Chợ Xóm Chiếu
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        multidub.travel/q/XC200FOO
                      </p>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>

                <button
                  onClick={() => handleSimulateScan(3)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 active:scale-98 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Nhà thờ Vĩnh Hội (Khánh Hội)
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        multidub.travel/q/VH1902CH
                      </p>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* How it works info */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                <Info className="w-3.5 h-3.5 text-emerald-400" /> Tiêu chuẩn QR Code hiện trường:
              </p>
              <p className="text-[11px] leading-relaxed">
                Mã QR được in kích thước chuẩn A5/A6 dán tại trạm xe buýt, hỗ trợ nhận diện cự ly 20-50 cm ngay cả trong điều kiện thiếu sáng hoặc phản quang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}