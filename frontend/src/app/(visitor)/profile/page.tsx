'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { MOCK_POIS } from '@/services/mockData';
import {
  User,
  Heart,
  History,
  Shield,
  LogOut,
  MapPin,
  Volume2,
  Trash2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

export default function VisitorProfilePage() {
  const router = useRouter();
  const { user, favorites, toggleFavorite, logout, isAuthenticated } = useAuthStore();
  const { playPoi } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'FAVORITES' | 'HISTORY' | 'ACCOUNTS'>('FAVORITES');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-lg">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa đăng nhập tài khoản</h2>
          <p className="text-xs text-slate-500 mb-6">
            Đăng nhập để xem hồ sơ cá nhân, các điểm di tích đã lưu và quản lý cài đặt tài khoản.
          </p>
          <Link
            href="/login"
            className="block w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const favoritePois = MOCK_POIS.filter((p) => favorites.includes(p.id));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28 pt-4 md:pt-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* User Card Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-4 ring-emerald-50 shadow"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow">
                  {user.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Đang hoạt động">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">{user.fullName}</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Du khách
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span>Phương thức: <strong className="text-slate-600">{user.provider || 'Google'}</strong></span>
                <span>•</span>
                <span>Đã lưu: <strong className="text-emerald-600">{favorites.length} điểm</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors self-end md:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('FAVORITES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'FAVORITES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'FAVORITES' ? 'fill-current' : ''}`} />
            Di tích yêu thích ({favoritePois.length})
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử nghe
          </button>

          <button
            onClick={() => setActiveTab('ACCOUNTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ACCOUNTS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            Tài khoản liên kết
          </button>
        </div>

        {/* Tab 1: Favorite POIs */}
        {activeTab === 'FAVORITES' && (
          <div>
            {favoritePois.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Chưa có địa điểm yêu thích nào</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Bấm vào biểu tượng trái tim tại bất kỳ bài thuyết minh nào để lưu lại danh sách di tích tâm đắc của bạn.
                </p>
                <Link
                  href="/list"
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow"
                >
                  <Compass className="w-4 h-4" />
                  Khám phá di tích ngay
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritePois.map((poi) => (
                  <div
                    key={poi.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-900">
                        {poi.images && poi.images[0] ? (
                          <img
                            src={poi.images[0].imageUrl}
                            alt={poi.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <MapPin className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                          {poi.ward?.name || 'Quận 4'}
                        </span>
                        <button
                          onClick={() => toggleFavorite(poi.id)}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-rose-500 flex items-center justify-center hover:bg-white transition-colors shadow"
                          title="Bỏ thích"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{poi.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {poi.translations?.[0]?.description || 'Địa danh du lịch văn hóa lịch sử.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => playPoi(poi, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe ngay
                      </button>

                      <Link
                        href={`/poi/${poi.id}`}
                        className="flex items-center justify-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Listening History */}
        {activeTab === 'HISTORY' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Lịch sử nghe thuyết minh gần đây</h3>
            <div className="divide-y divide-slate-100">
              {MOCK_POIS.slice(0, 4).map((poi, idx) => (
                <div key={poi.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{poi.name}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Hôm nay • {idx === 0 ? 'Kích hoạt qua GPS' : 'Quét mã QR tại trạm xe buýt'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Đã nghe 100%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Connected Accounts */}
        {activeTab === 'ACCOUNTS' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Phương thức đăng nhập liên kết</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bạn có thể liên kết nhiều tài khoản mạng xã hội để đăng nhập một chạm thuận tiện.
              </p>
            </div>

            <div className="space-y-3">
              {/* Google */}
              <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Google Account</h4>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Đã kết nối
                </span>
              </div>

              {/* Apple ID */}
              <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.64-14.01-6.1-9.46-10.9-20.44-14.41-32.93-3.5-12.5-5.26-24.16-5.26-34.99 0-16.1 4.13-29.28 12.39-39.54 8.27-10.26 18.57-15.48 30.9-15.67 4.79 0 10.36 1.34 16.71 4.02 6.35 2.68 10.22 4.08 11.61 4.2 1.89-.25 5.92-1.68 12.09-4.28 6.17-2.6 11.45-3.83 15.84-3.69 11.97.63 21.64 4.86 29.01 12.69-10.45 6.37-15.54 15.22-15.28 26.54.26 8.79 3.65 16.14 10.17 22.04 6.52 5.9 14.16 9.4 22.92 10.5-2.02 6.04-4.57 12.44-7.65 19.21zM119.22 33.15c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.83-10.42 19.59-12.09.25 1.01.38 2.02.38 3.03 0 7.39-2.78 14.37-8.34 20.93-5.56 6.56-12.14 10.46-19.74 11.7-.12-.96-.18-1.92-.18-2.9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Apple ID</h4>
                    <p className="text-[11px] text-slate-500">Chưa liên kết</p>
                  </div>
                </div>
                <button className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors">
                  Liên kết
                </button>
              </div>

              {/* Facebook */}
              <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Facebook</h4>
                    <p className="text-[11px] text-slate-500">Chưa liên kết</p>
                  </div>
                </div>
                <button className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors">
                  Liên kết
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

