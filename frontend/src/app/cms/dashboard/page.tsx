'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDashboard } from '@/services/cmsAnalytics';

export default function CmsDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    getDashboard(controller.signal).then((response) => {
      if (!controller.signal.aborted) setData(response);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, []);

  if (error) return <p role="alert">Không tải được báo cáo. Kiểm tra quyền xem báo cáo và kết nối.</p>;
  if (!data) return <p role="status">Đang tải báo cáo…</p>;
  const [summary, { items }] = data;
  const metrics: [string, number][] = [
    ['Phiên tham quan', summary.sessions], ['Lượt nghe', summary.totalListens],
    ['Lượt nghe hợp lệ', summary.validListens], ['Lượt quét QR', summary.qrScans],
    ['Thiết bị', summary.uniqueDevices],
  ];
  const formatNumber = new Intl.NumberFormat('vi-VN');
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Tổng quan tham quan</h1><p>{summary.from} – {summary.to}</p></div>
        <Link className="rounded-lg border bg-white px-4 py-2" href="/cms/analytics/heatmap">Xem bản đồ nhiệt</Link>
      </header>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div className="rounded-xl border bg-white p-4" key={label}>
            <dt className="text-sm text-slate-600">{label}</dt>
            <dd className="text-xl font-bold">{formatNumber.format(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="overflow-x-auto rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-bold">Điểm thuyết minh nổi bật</h2>
        {!items.length ? <p>Chưa có lượt nghe hợp lệ.</p> : (
          <table className="w-full text-left text-sm">
            <thead><tr><th>Điểm</th><th>Lượt nghe hợp lệ</th><th>Thời gian nghe trung bình</th></tr></thead>
            <tbody>{items.map((item) => (
              <tr className="border-t" key={item.poiId}>
                <td className="py-2">{item.poiName}</td>
                <td>{formatNumber.format(item.validListens)}</td>
                <td>{formatNumber.format(Math.round(item.avgListenedSeconds))} giây</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}
