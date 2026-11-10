'use client';

import { useEffect, useState } from 'react';
import { getHeatmap } from '@/services/cmsAnalytics';

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CmsHeatmap() {
  const [days, setDays] = useState(7);
  const [result, setResult] = useState<{ days: number; data: Awaited<ReturnType<typeof getHeatmap>> | null } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    getHeatmap(localDate(start), localDate(end), controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ days, data });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ days, data: null });
    });
    return () => controller.abort();
  }, [days]);

  const data = result?.days === days ? result.data : undefined;
  const cells = data?.[0].cells ?? [];
  const maxCount = Math.max(1, ...cells.map((cell) => cell.deviceCount));
  const minLat = Math.min(...cells.map((cell) => cell.latitude));
  const maxLat = Math.max(...cells.map((cell) => cell.latitude));
  const minLng = Math.min(...cells.map((cell) => cell.longitude));
  const maxLng = Math.max(...cells.map((cell) => cell.longitude));
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Bản đồ nhiệt và luồng di chuyển</h1>
      <label className="block text-sm">Khoảng thời gian{' '}
        <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded border p-2">
          <option value={1}>Hôm nay</option><option value={7}>7 ngày</option><option value={30}>30 ngày</option>
        </select>
      </label>
      {data === undefined && <p role="status">Đang tải dữ liệu…</p>}
      {data === null && <p role="alert">Không tải được bản đồ nhiệt. Kiểm tra quyền và kết nối.</p>}
      {data && (
        <>
          <div className="rounded-xl border bg-white p-4">
            <p className="mb-3 text-sm">Các ô có ít hơn {data[0].minDevices} thiết bị được ẩn.</p>
            {!cells.length ? <p>Chưa có dữ liệu đạt ngưỡng trong khoảng này.</p> : (
              <svg viewBox="0 0 700 360" className="w-full rounded-lg bg-slate-100" role="img" aria-label="Phân bố ô nhiệt theo tọa độ">
                {cells.map((cell) => {
                  const strength = cell.deviceCount / maxCount;
                  const x = maxLng === minLng ? 350 : 45 + 610 * (cell.longitude - minLng) / (maxLng - minLng);
                  const y = maxLat === minLat ? 180 : 315 - 270 * (cell.latitude - minLat) / (maxLat - minLat);
                  return (
                    <circle key={`${cell.latitude}:${cell.longitude}`} cx={x} cy={y} r={10 + 22 * strength}
                      fill="#ea580c" opacity={0.28 + 0.6 * strength}>
                      <title>{cell.latitude}, {cell.longitude}: {cell.deviceCount} thiết bị</title>
                    </circle>
                  );
                })}
              </svg>
            )}
          </div>
          <div className="space-y-2 rounded-xl border bg-white p-4">
            <h2 className="font-bold">Luồng giữa các điểm thuyết minh</h2>
            {!data[1].items.length ? <p>Chưa có luồng di chuyển.</p> : (
              <ul>{data[1].items.map((item) => (
                <li className="border-t py-2" key={`${item.fromPoiId}:${item.toPoiId}`}>
                  {item.fromPoiName} → {item.toPoiName} ({item.count})
                </li>
              ))}</ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
