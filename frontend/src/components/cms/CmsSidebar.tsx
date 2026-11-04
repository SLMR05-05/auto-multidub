'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flame,
  MapPin,
  Globe,
  Languages,
  Volume2,
  Compass,
  Bus,
  QrCode,
  Send,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function CmsSidebar() {
  const pathname = usePathname();

  const menuSections = [
    {
      title: 'TỔNG QUAN & BÁO CÁO',
      items: [
        { label: 'Bảng điều khiển (Dashboard)', href: '/cms/dashboard', icon: LayoutDashboard },
        { label: 'Bản đồ nhiệt (Heatmap)', href: '/cms/analytics/heatmap', icon: Flame },
      ],
    },
    {
      title: 'QUẢN TRỊ NỘI DUNG POI',
      items: [
        { label: 'Điểm thuyết minh (POI)', href: '/cms/poi', icon: MapPin },
        { label: 'Danh mục Ngôn ngữ', href: '/cms/languages', icon: Globe, highlight: true },
        { label: 'Ma trận bản dịch', href: '/cms/translations/matrix', icon: Languages },
        { label: 'Kho Audio & TTS', href: '/cms/audio', icon: Volume2 },
        { label: 'Tuyến Tour tham quan', href: '/cms/tours', icon: Compass },
      ],
    },
    {
      title: 'HIỆN TRƯỜNG & VẬN HÀNH',
      items: [
        { label: 'Phường & Trạm xe buýt', href: '/cms/bus-stops', icon: Bus },
        { label: 'Mã QR hiện trường', href: '/cms/qr-codes', icon: QrCode },
        { label: 'Xuất bản & Gói Offline', href: '/cms/publish', icon: Send },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { label: 'Tài khoản & Audit Log', href: '/cms/users', icon: Users },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
          AD
        </div>
        <div>
          <h1 className="font-bold text-sm text-white leading-tight">Auto-Narration</h1>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
            CMS Portal 2.0
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider px-3 uppercase block mb-1.5">
              {section.title}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Current User Card & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Administrator</p>
              <span className="text-[10px] text-emerald-400 font-mono">ROLE_ADMIN</span>
            </div>
          </div>

          <Link
            href="/cms/login"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
