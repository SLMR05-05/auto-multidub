'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, Sparkles } from 'lucide-react';
import { useAssistantStore } from '@/stores/assistantStore';

export default function FloatingMic() {
  const pathname = usePathname();
  const { isSpeaking } = useAssistantStore();

  // Ẩn khi đang ở chính trang Trợ lý AI (/assistant)
  if (pathname === '/assistant') return null;

  return (
    <div className="fixed bottom-36 md:bottom-24 right-4 md:right-8 z-30">
      <Link
        href="/assistant"
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 active:scale-95 transition-all"
        title="Trợ lý Voice AI"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-300 items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-slate-900" />
          </span>
        </span>
        <Mic className={`w-7 h-7 ${isSpeaking ? 'animate-bounce text-yellow-300' : ''}`} />
      </Link>
    </div>
  );
}
