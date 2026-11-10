'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin, Sliders, AlertTriangle, Check, Layers } from 'lucide-react';
import { getPoiEditor, publishCmsPoi, saveCmsPoi, saveVietnamese } from '@/services/cmsPois';

type EditorData = Awaited<ReturnType<typeof getPoiEditor>>;

export default function CmsPoiEditorPage() {
  const id = useParams<{ id?: string[] }>().id?.[0];
  const [result, setResult] = useState<{ id?: string; data: EditorData | null } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPoiEditor(id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ id, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ id, data: null });
      });
    return () => controller.abort();
  }, [id]);

  if (!result || result.id !== id) return <p role="status">Đang tải dữ liệu POI…</p>;
  if (!result.data) return <p role="alert">Không tải được POI hoặc dữ liệu địa bàn.</p>;
  return <PoiEditor key={id ?? 'new'} {...result.data} />;
}

function PoiEditor({ poi, wards, stops, vietnamese }: EditorData) {
  const router = useRouter();
  const [code, setCode] = useState(poi?.code ?? '');
  const [name, setName] = useState(poi?.name ?? '');
  const [wardId, setWardId] = useState(poi?.wardId ?? 0);
  const [busStopId, setBusStopId] = useState(poi?.busStopId ?? 0);
  const [latitude, setLatitude] = useState(poi?.latitude ?? 10.7681);
  const [longitude, setLongitude] = useState(poi?.longitude ?? 106.7052);
  const [radiusMeters, setRadiusMeters] = useState(poi?.radiusMeters ?? 50);
  const [priority, setPriority] = useState(poi?.priority ?? 3);
  const [cooldownMinutes, setCooldownMinutes] = useState(poi?.cooldownMinutes ?? 30);
  const [translationName, setTranslationName] = useState(vietnamese?.name ?? poi?.name ?? '');
  const [description, setDescription] = useState(vietnamese?.description ?? '');
  const [ttsScript, setTtsScript] = useState(vietnamese?.ttsScript ?? '');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function runAction(action: () => Promise<void>) {
    if (pending) return;
    setPending(true);
    setNotice('');
    setError('');
    try {
      await action();
    } catch {
      setError('Không thực hiện được thao tác. Kiểm tra dữ liệu, quyền CMS và kết nối.');
    } finally {
      setPending(false);
    }
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAction(async () => {
      const saved = await saveCmsPoi({ code, name, wardId: wardId || null, busStopId: busStopId || null,
        latitude, longitude, radiusMeters, priority, cooldownMinutes }, poi?.id);
      setCode(saved.code);
      setNotice('Đã lưu thông tin POI.');
      if (!poi) router.replace(`/cms/poi/editor/${saved.id}`);
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cms/poi"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Soạn thảo POI & Cấu hình Geofence</h1>
            <p className="text-xs text-slate-500 mt-0.5">Thiết lập tọa độ, bán kính kích hoạt và mức ưu tiên phát âm thanh</p>
          </div>
        </div>

        <button
          type="submit"
          form="poi-form"
          disabled={pending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          Lưu thông tin POI
        </button>
      </div>

      {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {/* Editor Grid: Left = Form, Right = Interactive Geofence Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form */}
        <form id="poi-form" onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            1. Thông tin cơ bản & Phân cấp hành chính
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mã POI (Unique code)</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tên địa danh (Tiếng Việt)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phường trực thuộc</label>
              <select
                value={wardId}
                onChange={(e) => setWardId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value={0}>Chưa chọn phường</option>
                  {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    P. {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Trạm xe buýt gần nhất</label>
              <select
                value={busStopId}
                onChange={(e) => setBusStopId(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value={0}>Chưa chọn trạm</option>
                  {stops.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-2">
            2. Tọa độ GPS & Tham số Geofence (P1 - P5)
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Kinh độ (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Slider Bán kính Geofence */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Bán kính kích hoạt Geofence (PRD P1: 20m – 300m):
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {radiusMeters} mét
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              step="5"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>20m (Tối thiểu)</span>
              <span>50m (Mặc định chuẩn)</span>
              <span>300m (Trục đại lộ)</span>
            </div>
          </div>

          {/* Priority & Cooldown Override */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mức ưu tiên (Priority 1-5)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={5}>5 (Cao nhất - Di tích biểu tượng)</option>
                <option value={4}>4 (Cao)</option>
                <option value={3}>3 (Trung bình - Mặc định)</option>
                <option value={2}>2 (Thấp)</option>
                <option value={1}>1 (Rất thấp)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Thời gian Cooldown (Phút)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Right Map Canvas (Live Radius Preview) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Mô phỏng Vùng phủ Geofence trực quan
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Bản đồ vệ tinh/phố</span>
            </div>

            {/* Simulated Live Map Canvas */}
            <div className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center select-none">
              <div className="absolute inset-0 bg-[#0f172a] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px]"></div>

              {/* Dynamic Geofence Circle based on radiusMeters slider */}
              <div
                className="rounded-full border-2 border-emerald-400 bg-emerald-500/20 transition-all duration-200 flex items-center justify-center relative shadow-lg shadow-emerald-500/20"
                style={{
                  width: `${Math.min(260, Math.max(70, radiusMeters * 1.4))}px`,
                  height: `${Math.min(260, Math.max(70, radiusMeters * 1.4))}px`,
                }}
              >
                {/* Center Pin */}
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-300/40">
                  <MapPin className="w-5 h-5 fill-current" />
                </div>

                {/* Radius label */}
                <span className="absolute -bottom-6 bg-slate-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                  R = {radiusMeters}m
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-800 mt-4 flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              Bán kính xem trước <strong>{radiusMeters} mét</strong>.
            </span>
          </div>
        </div>
      </div>
      {poi && (
        <form className="space-y-3 rounded-xl border bg-white p-5" onSubmit={(event) => {
          event.preventDefault();
          const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'publish';
          void runAction(async () => {
            await saveVietnamese(poi.id, { name: translationName.trim(), description: description.trim(), ttsScript: ttsScript.trim() });
            setNotice('Đã lưu nội dung tiếng Việt.');
            if (publish) {
              const result = await publishCmsPoi(poi.id);
              if (result.issues.length) setError(result.issues.map((issue) => issue.message).join(' · '));
              else setNotice(`Đã xuất bản POI ở phiên bản ${result.dataVersion}.`);
            }
          });
        }}>
          <h2 className="font-bold">Nội dung tiếng Việt</h2>
          <label className="block">Tiêu đề
            <input required maxLength={250} value={translationName} onChange={(e) => setTranslationName(e.target.value)}
              className="block w-full rounded border p-2" />
          </label>
          <label className="block">Mô tả
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded border p-2" />
          </label>
          <label className="block">Kịch bản thuyết minh TTS
            <textarea value={ttsScript} onChange={(e) => setTtsScript(e.target.value)}
              className="block w-full rounded border p-2" />
          </label>
          <div className="flex flex-wrap gap-3">
            <button disabled={pending} className="rounded border px-4 py-2" type="submit">Lưu nội dung tiếng Việt</button>
            <button disabled={pending} className="rounded bg-emerald-700 px-4 py-2 text-white" type="submit" value="publish">
              Lưu nội dung và xuất bản
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

