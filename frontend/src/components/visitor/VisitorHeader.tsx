'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguageStore } from '@/stores/languageStore';
import {
  Compass,
  Map,
  List,
  QrCode,
  Sparkles,
  Settings,
  Download,
  ChevronDown,
  Globe,
  Radio,
  Layers,
} from 'lucide-react';

export default function VisitorHeader() {
  const pathname = usePathname();
  const { currentLang, languages, setLanguage } = useLanguageStore();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Bản đồ', href: '/', icon: Map },
    { label: 'Điểm thuyết minh', href: '/list', icon: List },
    { label: 'Tuyến Tour', href: '/tours', icon: Compass },
    { label: 'Trợ lý Voice AI', href: '/assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Quét QR', href: '/qr', icon: QrCode },
    { label: 'Tải Offline', href: '/offline', icon: Download },
    { label: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  const currentLangObj = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500 transition-colors">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">Auto-Narration</span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  v2.1
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Quận 4: Khánh Hội - Vĩnh Hội - Xóm Chiếu</p>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Visible on md+) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white ml-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              title="Đổi ngôn ngữ thuyết minh"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{currentLangObj?.nativeName || 'Tiếng Việt'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ngôn ngữ hỗ trợ (PRD)
                </div>
                {languages
                  .filter((l) => l.isActive)
                  .map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentLang === lang.code ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
