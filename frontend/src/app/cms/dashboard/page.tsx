'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getDashboard } from '@/services/cmsAnalytics';
import {
  Globe,
  Smartphone,
  Laptop,
  Radio,
  QrCode,
  Headphones,
  Compass,
  CheckCircle2,
  Layers,
  MapPin,
  Flame,
} from 'lucide-react';

export default function CmsDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getDashboard(controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setData(response);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700" role="alert">
        <h3 className="font-semibold text-lg mb-1">Không tải được báo cáo</h3>
        <p className="text-sm">Kiểm tra kết nối backend hoặc quyền truy cập của tài khoản CMS.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500" role="status">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p>Đang tải dữ liệu tổng quan…</p>
        </div>
      </div>
    );
  }

  const [summary, { items }] = data;
  const formatNumber = new Intl.NumberFormat('vi-VN');

  const metrics = [
    { label: 'Phiên tham quan', value: summary.sessions, icon: Compass, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Tổng lượt nghe', value: summary.totalListens, icon: Headphones, color: 'text-blue-600 bg-blue-50' },
    { label: 'Lượt nghe hợp lệ', value: summary.validListens, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lượt quét QR', value: summary.qrScans, icon: QrCode, color: 'text-amber-600 bg-amber-50' },
    { label: 'Tổng thiết bị', value: summary.uniqueDevices, icon: Smartphone, color: 'text-purple-600 bg-purple-50' },
  ];

  // Nền tảng (Web vs Mobile App)
  const platforms = summary.platformDistribution || {};
  const webCount = platforms['Web (Trình duyệt)'] || 0;
  const appCount = platforms['App (Ứng dụng di động)'] || 0;
  const totalPlatforms = (webCount + appCount) || 1;
  const webPercent = Math.round((webCount / totalPlatforms) * 100);
  const appPercent = Math.round((appCount / totalPlatforms) * 100);

  // Hệ điều hành (OS Breakdown)
  const osData = Object.entries(summary.osDistribution || {}).sort((a, b) => b[1] - a[1]);
  const totalOsDevices = osData.reduce((acc, [, val]) => acc + val, 0) || 1;

  // Phương thức kích hoạt (Triggers)
  const triggers = summary.triggerDistribution || {};
  const triggerLabels: Record<string, string> = {
    GPS: 'Tự động GPS',
    AUTO_GEO: 'Tự động GPS',
    QR: 'Quét mã QR',
    MANUAL: 'Bấm nghe thủ công',
  };
  const triggerList = Object.entries(triggers).map(([k, v]) => ({
    key: k,
    label: triggerLabels[k] || k,
    count: v,
  })).sort((a, b) => b.count - a.count);
  const totalTriggers = triggerList.reduce((acc, t) => acc + t.count, 0) || 1;

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan tham quan</h1>
          <p className="text-sm text-slate-500">
            Khoảng thời gian: <span className="font-medium text-slate-700">{summary.from}</span> – <span className="font-medium text-slate-700">{summary.to}</span>
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
          href="/cms/analytics/heatmap"
        >
          <Flame className="h-4 w-4" />
          Xem bản đồ nhiệt
        </Link>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <div className={`p-1.5 rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <dd className="text-2xl font-bold text-slate-900">{formatNumber.format(value)}</dd>
          </div>
        ))}
      </div>

      {/* Section: Thống kê Thiết bị & Nền tảng truy cập */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card 1: Web vs App */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="h-5 w-5 text-indigo-600" />
              Nền tảng truy cập
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Web vs App
            </span>
          </div>

          {/* Ratio bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <Globe className="h-3.5 w-3.5" /> Web ({webPercent}%)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Smartphone className="h-3.5 w-3.5" /> App di động ({appPercent}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="bg-indigo-600 transition-all duration-500"
                style={{ width: `${webPercent}%` }}
                title={`Web: ${webCount}`}
              />
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${appPercent}%` }}
                title={`App: ${appCount}`}
              />
            </div>
          </div>

          {/* Breakdown items */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/50">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">Web Browser</span>
              </div>
              <p className="text-xl font-bold text-indigo-900">{formatNumber.format(webCount)}</p>
              <p className="text-[11px] text-slate-500">Người dùng qua Web</p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-slate-700">Mobile App</span>
              </div>
              <p className="text-xl font-bold text-emerald-900">{formatNumber.format(appCount)}</p>
              <p className="text-[11px] text-slate-500">Cài đặt App / PWA</p>
            </div>
          </div>
        </div>

        {/* Card 2: Hệ điều hành (OS) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Hệ điều hành thiết bị
            </h2>
            <span className="text-xs text-slate-500">
              {osData.length} hệ điều hành
            </span>
          </div>

          <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
            {osData.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Chưa có dữ liệu hệ điều hành</p>
            ) : (
              osData.map(([os, count]) => {
                const percent = Math.round((count / totalOsDevices) * 100);
                return (
                  <div key={os} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{os}</span>
                      <span className="text-slate-500">{formatNumber.format(count)} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card 3: Phương thức kích hoạt (Triggers) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Radio className="h-5 w-5 text-indigo-600" />
              Phương thức kích hoạt
            </h2>
            <span className="text-xs text-slate-500">
              {formatNumber.format(summary.totalListens)} lượt
            </span>
          </div>

          <div className="space-y-2.5">
            {triggerList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Chưa có dữ liệu kích hoạt</p>
            ) : (
              triggerList.map((t) => {
                const percent = Math.round((t.count / totalTriggers) * 100);
                return (
                  <div key={t.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{t.label}</span>
                      <span className="text-slate-500">{formatNumber.format(t.count)} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top POIs Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            Điểm thuyết minh nổi bật
          </h2>
          <span className="text-xs text-slate-500">Xếp hạng theo lượt nghe hợp lệ</span>
        </div>

        {!items.length ? (
          <p className="text-sm text-slate-500 py-6 text-center">Chưa có lượt nghe hợp lệ nào được ghi nhận.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Hạng</th>
                <th className="py-2.5 px-3">Điểm tham quan</th>
                <th className="py-2.5 px-3 text-right">Lượt nghe hợp lệ</th>
                <th className="py-2.5 px-3 text-right">Thời gian nghe TB</th>
                <th className="py-2.5 px-3 text-right">Tỉ lệ nghe hết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr className="hover:bg-slate-50/80 transition" key={item.poiId}>
                  <td className="py-3 px-3 font-medium">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' :
                      idx === 1 ? 'bg-slate-200 text-slate-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' :
                      'text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{item.poiName}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">{formatNumber.format(item.validListens)}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{formatNumber.format(Math.round(item.avgListenedSeconds))}s</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {Math.round((item.completionRate || 0) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}