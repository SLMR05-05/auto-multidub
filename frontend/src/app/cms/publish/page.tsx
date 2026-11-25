'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError, apiUrl } from '@/services/api';
import { clearCmsSession, publishCatalog, readCmsSession, type PublishResult } from '@/services/cms';
import { listAllCmsPois, poiStatusLabels, type CmsPoi } from '@/services/cmsPois';
import { listCmsPackages, retryCmsPackage, type OfflinePackage } from '@/services/cmsPackages';

export default function CmsPublishPage() {
  const router = useRouter();
  const [pois, setPois] = useState<CmsPoi[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [packages, setPackages] = useState<OfflinePackage[]>([]);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packageError, setPackageError] = useState('');
  const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState('UNPUBLISHED');
  const [retrying, setRetrying] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    listAllCmsPois(controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      setPois(items.filter((poi) => poi.status !== 'ARCHIVED'));
      setSelected(new Set(items.filter((poi) => poi.status === 'READY').map((poi) => poi.id)));
      setError('');
    }).catch((failure) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Không tải được POI.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const items = await listCmsPackages(controller.signal);
        if (!controller.signal.aborted) { setPackages(items); setPackageError(''); }
      } catch (failure) {
        if (!controller.signal.aborted) setPackageError(failure instanceof Error ? failure.message : 'Không tải được gói offline.');
      } finally { inFlight = false; }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [revision]);

  async function handlePublish() {
    if (pending || !selected.size) return;
    const session = readCmsSession();
    if (!session) { router.replace('/cms/login'); return; }
    setPending(true); setError(''); setResult(null);
    try {
      const response = await publishCatalog(session.token, [...selected]);
      setResult(response);
      if (!response.issues.length) {
        setSelected(new Set());
        setRevision((value) => value + 1);
      }
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) {
        clearCmsSession(); router.replace('/cms/login');
      } else {
        setError(failure instanceof Error ? failure.message : 'Không thể xuất bản dữ liệu.');
      }
    } finally { setPending(false); }
  }

  const visible = pois.filter((poi) => filter === 'ALL' || (filter === 'UNPUBLISHED'
    ? poi.status === 'DRAFT' || poi.status === 'READY' : poi.status === filter));

  return <div className="max-w-6xl space-y-6">
    <section className="space-y-4 rounded-2xl border bg-white p-6">
      <h1 className="text-xl font-bold">Xuất bản dữ liệu tham quan</h1>
      <p className="text-sm text-slate-600">Chọn POI cần xuất bản. Hệ thống kiểm tra toàn bộ lựa chọn trước khi phát hành một phiên bản dữ liệu và tạo gói offline cho các ngôn ngữ.</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Trạng thái
          <select aria-label="Trạng thái xuất bản" value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-2 rounded border p-2">
            <option value="UNPUBLISHED">Chưa xuất bản</option>
            <option value="READY">Sẵn sàng duyệt</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ALL">Tất cả</option>
          </select>
        </label>
        <button type="button" disabled={pending || loading} onClick={() => setRevision((value) => value + 1)}
          className="rounded border px-3 py-2 text-sm">Tải lại</button>
        <Link href="/cms/poi/editor" className="text-sm text-emerald-700 underline">Tạo POI mới</Link>
      </div>
      {loading ? <p role="status">Đang tải POI…</p> : <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b">
            <th className="p-2"><input type="checkbox" aria-label="Chọn tất cả POI đang hiển thị"
              disabled={pending || !visible.length} checked={Boolean(visible.length) && visible.every((poi) => selected.has(poi.id))}
              onChange={(e) => setSelected((current) => {
                const next = new Set(current);
                visible.forEach((poi) => { if (e.target.checked) next.add(poi.id); else next.delete(poi.id); });
                return next;
              })} /></th><th>POI</th><th>Trạng thái</th><th>Phiên bản</th>
          </tr></thead>
          <tbody>{visible.map((poi) => <tr key={poi.id} className="border-b">
            <td className="p-2"><input type="checkbox" aria-label={`Chọn ${poi.name}`} disabled={pending} checked={selected.has(poi.id)}
              onChange={(e) => setSelected((current) => {
                const next = new Set(current);
                if (e.target.checked) next.add(poi.id); else next.delete(poi.id);
                return next;
              })} /></td>
            <td className="py-3"><Link href={`/cms/poi/editor/${poi.id}`} className="text-emerald-700 underline">{poi.name}</Link><p className="text-xs text-slate-500">{poi.code}</p></td>
            <td>{poiStatusLabels[poi.status]}</td><td>{poi.version}</td>
          </tr>)}</tbody>
        </table>
        {!visible.length && <p className="py-3 text-sm text-slate-500">Không có POI ở trạng thái này.</p>}
      </div>}
      <button type="button" disabled={pending || loading || !selected.size} onClick={() => void handlePublish()}
        className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {pending ? 'Đang xuất bản…' : `Xuất bản ${selected.size} POI đã chọn`}
      </button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {result && <div role={result.issues.length ? 'alert' : 'status'} className="space-y-2 text-sm">
        <p>Phiên bản dữ liệu {result.dataVersion}. Số POI được xuất bản: {result.publishedCount}.</p>
        {result.issues.length ? <ul className="list-disc pl-5 text-red-800">
          {result.issues.map((issue, index) => <li key={`${issue.poiId}-${index}`}>
            <Link href={`/cms/poi/editor/${issue.poiId}`} className="underline">{issue.poiCode}</Link>: {issue.message}
          </li>)}
        </ul> : <p className="text-emerald-800">Đã xuất bản. Các tác vụ tạo gói offline được hiển thị bên dưới.</p>}
      </div>}
    </section>

    <section className="space-y-4 rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-bold">Gói offline</h2>
      <p className="text-sm text-slate-500">Tự cập nhật mỗi 5 giây. Phiên bản của gói là phiên bản snapshot thực tế khi bắt đầu tạo.</p>
      {packageError && <p role="alert" className="text-sm text-red-700">{packageError}</p>}
      {!packages.length && <p className="text-sm">Chưa có gói offline.</p>}
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b"><th className="p-2">Ngôn ngữ / gói</th><th>Version</th><th>Trạng thái</th><th>SHA-256</th><th>Thao tác</th></tr></thead>
          <tbody>{packages.slice(0, 35).map((pkg) => <tr key={pkg.id} className="border-b">
            <td className="p-2"><strong>{pkg.languageCode}</strong><p className="text-xs text-slate-500">{pkg.code} · {pkg.poiCount} POI</p></td>
            <td>{pkg.dataVersion}</td>
            <td>{pkg.status === 'READY' ? 'Sẵn sàng' : pkg.status === 'BUILDING' ? 'Đang tạo' : 'Thất bại'}
              {pkg.errorMessage && <p className="max-w-xs text-xs text-red-700">{pkg.errorMessage}</p>}
            </td>
            <td><code title={pkg.checksumSha256 ?? ''}>{pkg.checksumSha256?.slice(0, 12) ?? '—'}</code></td>
            <td className="py-2">
              {pkg.downloadUrl && <a href={apiUrl(pkg.downloadUrl)} className="text-emerald-700 underline">Tải ZIP ({(pkg.sizeBytes / 1048576).toFixed(1)} MB)</a>}
              {pkg.status === 'FAILED' && <button type="button" disabled={retrying !== null} className="rounded border px-2 py-1"
                onClick={async () => {
                  setRetrying(pkg.id);
                  try { await retryCmsPackage(pkg.id); setRevision((value) => value + 1); }
                  catch (failure) { setPackageError(failure instanceof Error ? failure.message : 'Không thử lại được.'); }
                  finally { setRetrying(null); }
                }}>{retrying === pkg.id ? 'Đang gửi…' : 'Thử tạo lại'}</button>}
            </td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </div>;
}
