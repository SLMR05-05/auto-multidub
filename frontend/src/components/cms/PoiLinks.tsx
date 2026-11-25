'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CmsPoi, EditorResponse } from '@/services/cmsPois';
import { listCmsTours, addCmsTourPoi } from '@/services/cmsTours';
import { listCmsQrCodes, createCmsQrCode, downloadCmsQrImage } from '@/services/cmsQr';
import type { Tour, QrCode } from '@/types';

export default function PoiLinks({ poi, initialTours, disabled }: {
  poi: CmsPoi; initialTours: EditorResponse['tours']; disabled: boolean;
}) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [memberships, setMemberships] = useState(initialTours);
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [tourId, setTourId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const all: Tour[] = [];
      let page = 0;
      let totalPages = 1;
      do {
        const result = await listCmsTours({ page: page++, size: 100 }, controller.signal);
        all.push(...result.content);
        totalPages = result.totalPages;
      } while (page < totalPages);
      const qr = await listCmsQrCodes(controller.signal);
      if (!controller.signal.aborted) {
        setTours(all.filter((tour) => tour.status !== 'ARCHIVED'));
        setQrCodes(qr.filter((item) => item.poiId === poi.id));
      }
    }
    load().catch((failure) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Không tải được liên kết.');
    });
    return () => controller.abort();
  }, [poi.id]);

  async function run(action: () => Promise<void>) {
    if (pending) return;
    setPending(true); setError(''); setNotice('');
    try { await action(); } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Không lưu được liên kết.');
    } finally { setPending(false); }
  }

  return <fieldset disabled={pending || disabled} className="space-y-4 rounded-2xl border bg-white p-5">
    <legend className="px-2 font-bold">5. Tour và QR (tùy chọn)</legend>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    <div className="flex flex-wrap gap-2">
      <label className="flex-1 text-sm">Thêm POI vào Tour
        <select aria-label="Tour liên kết" value={tourId} onChange={(e) => setTourId(e.target.value)}
          className="mt-1 block w-full rounded-lg border p-2">
          <option value="">Chọn Tour</option>
          {tours.filter((tour) => !memberships.some((item) => item.id === tour.id)).map((tour) =>
            <option key={tour.id} value={tour.id}>{tour.name}</option>)}
        </select>
      </label>
      <button type="button" disabled={!tourId} className="self-end rounded-lg border px-3 py-2 text-sm"
        onClick={() => void run(async () => {
          const tour = await addCmsTourPoi(Number(tourId), poi.id);
          setMemberships((items) => [...items, { id: tour.id, code: tour.code, name: tour.name, orderIndex: 0 }]);
          setTourId('');
          setNotice('Đã thêm POI vào Tour.');
        })}>Gắn Tour</button>
    </div>
    {memberships.length > 0 && <p className="text-sm">Tour đã gắn: {memberships.map((tour) => tour.name).join(', ')}.</p>}
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={qrCodes.some((qr) => qr.isActive)} className="rounded-lg border px-3 py-2 text-sm"
        onClick={() => void run(async () => {
          const qr = await createCmsQrCode({ poiId: poi.id, busStopId: poi.busStopId ?? undefined, label: poi.name });
          setQrCodes((items) => [...items, qr]);
          setNotice('Đã tạo mã QR. Khách có thể mở POI qua QR sau khi xuất bản.');
        })}>Tạo QR cho POI</button>
      <Link href="/cms/qr-codes" className="text-sm text-emerald-700 underline">Quản lý QR</Link>
      <Link href="/cms/tours" className="text-sm text-emerald-700 underline">Quản lý Tour và thứ tự POI</Link>
    </div>
    {qrCodes.map((qr) => <div key={qr.id} className="flex flex-wrap items-center gap-3 text-sm">
      <code>{qr.code}</code>
      <a href={qr.url} target="_blank" rel="noreferrer" className="break-all text-emerald-700 underline">{qr.url}</a>
      <button type="button" className="rounded border px-2 py-1"
        onClick={() => void run(async () => { await downloadCmsQrImage(qr.id, qr.code); })}>Tải ảnh QR</button>
    </div>)}
  </fieldset>;
}
