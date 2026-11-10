'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearCmsSession } from '@/services/cms';
import { Bell, ExternalLink, Send, ShieldCheck } from 'lucide-react';

export default function CmsHeader() {
  const router = useRouter();
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Hệ thống Thuyết minh & AI Voice Assistant v2.0
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick link to Visitor Web App */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          Mở giao diện Du khách
        </Link>

        {/* Quick Publish Gate CTA */}
        <Link
          href="/cms/publish"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Xuất bản dữ liệu
        </Link>

        <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
          onClick={() => { clearCmsSession(); router.replace('/cms/login'); }}>
          Đăng xuất
        </button>

        {/* Notification bell */}
        <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
      </div>
    </header>
  );
}
