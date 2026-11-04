'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, List, QrCode, Sparkles, Compass, Settings } from 'lucide-react';

export default function VisitorNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Bản đồ', href: '/', icon: Map },
    { label: 'Địa điểm', href: '/list', icon: List },
    { label: 'Quét QR', href: '/qr', icon: QrCode, highlight: true },
    { label: 'Trợ lý AI', href: '/assistant', icon: Sparkles },
    { label: 'Tours', href: '/tours', icon: Compass },
    { label: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg py-2 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div className="w-13 h-13 p-3.5 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
