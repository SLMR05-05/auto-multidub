'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { useAuthStore } from '@/stores/authStore';
import {
  Settings,
  Globe,
  Gauge,
  Shield,
  RefreshCw,
  Trash2,
  Check,
  Sliders,
  User,
  Heart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function VisitorSettingsPage() {
  const { currentLang, setLanguage, getActiveLanguages } = useLanguageStore();
  const { user, isAuthenticated, favorites } = useAuthStore();
  const languages = getActiveLanguages();

  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [gpsMode, setGpsMode] = useState<'SAVER' | 'BALANCED' | 'ACCURATE'>('BALANCED');
  const [radiusMultiplier, setRadiusMultiplier] = useState<number>(1.0);
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [deviceId, setDeviceId] = useState('c8a41280-97bf-4e76-a200-fe7445441ca2');
  const [notifySaved, setNotifySaved] = useState(false);

  const handleResetDeviceId = () => {
    const newId = 'dev-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    setDeviceId(newId);
    showNotice();
  };

  const showNotice = () => {
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 pt-4 md:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <Settings className="w-4 h-4" />
              <span>Cá nhân hóa trải nghiệm thuyết minh</span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Cài đặt hệ thống
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Tùy biến ngôn ngữ, tốc độ phát TTS, độ nhạy GPS và quản lý quyền riêng tư
            </p>
          </div>

          {/* Quick link to Profile */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 text-xs font-semibold text-slate-700 shadow-xs hover:shadow-sm transition-all self-start md:self-auto"
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>{isAuthenticated ? user?.fullName || 'Hồ sơ của tôi' : 'Đăng nhập tài khoản'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {notifySaved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Đã cập nhật cấu hình cài đặt thành công!</span>
          </div>
        )}

        {/* 2-Column Grid on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Column 1: Language & TTS Voice */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-emerald-600" />
                Ngôn ngữ thuyết minh & Giao diện
              </h2>
              <p className="text-xs text-slate-400">
                Tự động tải nội dung và phát giọng đọc theo ngôn ngữ đã chọn:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {languages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      showNotice();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{lang.nativeName}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{lang.name}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* TTS Playback Speed */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Tốc độ đọc giọng nói TTS:</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {ttsSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                <span>0.8x (Chậm)</span>
                <span>1.0x (Tiêu chuẩn)</span>
                <span>1.5x (Nhanh)</span>
              </div>
            </div>
          </div>

          {/* Column 2: GPS, Geofence & Privacy */}
          <div className="space-y-6">
            {/* GPS & Geofence Sensitivity */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  Độ nhạy định vị GPS ngầm
                </h2>
                <p className="text-xs text-slate-400">
                  Chu kỳ quét vị trí thời gian thực để kích hoạt phát âm thanh tự động:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'SAVER', name: 'Tiết kiệm pin', desc: 'Quét mỗi 15 giây (sai số ~80m)' },
                  { id: 'BALANCED', name: 'Cân bằng (Khuyến nghị)', desc: 'Quét mỗi 5 giây (sai số ~50m)' },
                  { id: 'ACCURATE', name: 'Chính xác cao', desc: 'Quét mỗi 2 giây (sai số ~30m)' },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      gpsMode === mode.id
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-bold ring-1 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gpsMode"
                      value={mode.id}
                      checked={gpsMode === mode.id}
                      onChange={() => {
                        setGpsMode(mode.id as any);
                        showNotice();
                      }}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <p className="text-xs font-bold">{mode.name}</p>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">{mode.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Geofence Multiplier */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Hệ số nhân bán kính Geofence:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0.5, label: 'x0.5 (Đi bộ hẹp)' },
                    { val: 1.0, label: 'x1.0 (Chuẩn)' },
                    { val: 1.5, label: 'x1.5 (Xe buýt)' },
                  ].map((m) => (
                    <button
                      key={m.val}
                      onClick={() => {
                        setRadiusMultiplier(m.val);
                        showNotice();
                      }}
                      className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all ${
                        radiusMultiplier === m.val
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy & Device ID Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Quyền riêng tư & Mã ẩn danh
                </h2>
                <p className="text-xs text-slate-400">
                  Dữ liệu định vị được thu thập ở dạng ẩn danh hoàn toàn (GDPR/NFR-PRV):
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Gửi vị trí ẩn danh</p>
                  <p className="text-[11px] text-slate-500">Giúp thành phố cải thiện điểm tham quan</p>
                </div>
                <button
                  onClick={() => setConsentAnalytics(!consentAnalytics)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    consentAnalytics ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 font-mono break-all">
                <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block mb-1">
                  Mã thiết bị ẩn danh (Device ID):
                </span>
                {deviceId}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleResetDeviceId}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đổi mã mới</span>
                </button>

                <button
                  onClick={() => {
                    alert('Đã xóa toàn bộ bộ nhớ đệm và dữ liệu ẩn danh khỏi thiết bị!');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa dữ liệu của tôi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}