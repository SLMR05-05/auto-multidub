'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { ApiError } from '@/services/api';
import { resolveVisitorQr } from '@/services/visitorCatalog';
import { useLanguageStore } from '@/stores/languageStore';
import { usePlayerStore } from '@/stores/playerStore';

export default function VisitorQrForm({ initialCode = '' }: { initialCode?: string }) {
  const router = useRouter();
  const [input, setInput] = useState(initialCode);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const language = useLanguageStore((state) => state.currentLang);
  const playPoi = usePlayerStore((state) => state.playPoi);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const value = input.trim();
    const code = value.match(/\/q\/([A-Za-z0-9]+)\/?(?:[?#].*)?$/)?.[1] ?? value;
    if (!/^[A-Za-z0-9]{1,120}$/.test(code)) {
      setError('Hãy nhập mã hoặc liên kết QR hợp lệ.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const poi = await resolveVisitorQr(code, language);
      playPoi(poi, true);
      router.push(`/poi/${poi.id}`);
    } catch (failure) {
      setError(failure instanceof ApiError && [404, 410].includes(failure.status)
        ? 'Mã QR không tồn tại hoặc đã ngừng hoạt động.'
        : 'Không mở được mã QR. Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-lg space-y-4 rounded-3xl bg-slate-900 p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold"><QrCode /> Mở điểm thuyết minh bằng mã QR</h1>
        <p className="text-sm text-slate-300">Nhập mã trên bảng hướng dẫn hoặc dán liên kết đã quét bằng camera điện thoại.</p>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <label htmlFor="qr-code" className="sr-only">Mã hoặc liên kết QR</label>
          <input id="qr-code" required value={input} onChange={(event) => setInput(event.target.value)}
            className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2" placeholder="Mã hoặc liên kết QR" />
          <button disabled={pending} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold disabled:opacity-60">
            {pending ? 'Đang tra mã…' : 'Mở'}
          </button>
        </form>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      </section>
    </div>
  );
}
