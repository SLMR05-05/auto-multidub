'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/services/api';
import { clearCmsSession, publishCatalog, readCmsSession, type PublishResult } from '@/services/cms';

export default function CmsPublishPage() {
  const router = useRouter();
  const [result, setResult] = useState<PublishResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handlePublish() {
    if (pending) return;
    const session = readCmsSession();
    if (!session) {
      router.replace('/cms/login');
      return;
    }
    if (session.role === 'ANALYST') {
      setError('Tài khoản chỉ có quyền xem báo cáo.');
      return;
    }
    setPending(true);
    setError('');
    setResult(null);
    try {
      setResult(await publishCatalog(session.token));
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) {
        clearCmsSession();
        router.replace('/cms/login');
      } else {
        setError(failure instanceof ApiError && failure.status === 403
          ? 'Phiên không còn hợp lệ hoặc tài khoản thiếu quyền xuất bản.'
          : 'Không thể xuất bản dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold">Xuất bản dữ liệu tham quan</h1>
      <p className="text-sm text-slate-600">Máy chủ kiểm tra điều kiện xuất bản và trả về phiên bản dữ liệu cùng các lỗi cần xử lý.</p>
      <button type="button" disabled={pending} onClick={handlePublish}
        className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? 'Đang xuất bản…' : 'Xuất bản phiên bản mới'}
      </button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {result && (
        <div role="status" className="space-y-2 text-sm">
          <p>Phiên bản dữ liệu {result.dataVersion}. Số POI được xuất bản {result.publishedCount}.</p>
          {result.issues.length > 0 && (
            <ul className="list-disc pl-5 text-amber-800">
              {result.issues.map((issue, index) => (
                <li key={`${issue.poiId}-${index}`}>{issue.poiCode}: {issue.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
