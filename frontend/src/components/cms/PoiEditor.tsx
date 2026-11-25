'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import {
  getPoiEditor, getCmsPoiEditor, savePoiEditor, markPoiReady, publishCmsPoi, poiStatusLabels,
  uploadPoiImage, uploadPoiAudio, deletePoiImage, deletePoiAudio, deletePoiTranslation,
  reorderPoiImages, setPoiCover, type EditorResponse, type PoiInput, type TranslationInput,
} from '@/services/cmsPois';
import { apiUrl } from '@/services/api';
import { mediaFileError, overlappingPois, prepareTranslations } from '@/utils/poiEditor';
import LocalMediaPreview from './LocalMediaPreview';
import TtsPreviewButton from './TtsPreviewButton';
import PoiLinks from './PoiLinks';

const GeofenceMap = dynamic(() => import('./PoiGeofenceMap'), {
  ssr: false, loading: () => <p className="h-96 p-4" role="status">Đang tải bản đồ…</p>,
});
const emptyTranslation = (): TranslationInput => ({ name: '', description: '', ttsScript: '' });
const inputClass = 'mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
const buttonClass = 'rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50';

export default function PoiEditor({ data }: { data: Awaited<ReturnType<typeof getPoiEditor>> }) {
  const router = useRouter();
  const initial = data.editor;
  const [saved, setSaved] = useState(initial);
  const savedRef = useRef(initial);
  const [form, setForm] = useState({
    code: initial?.poi.code ?? '', name: initial?.poi.name ?? '',
    wardId: String(initial?.poi.wardId ?? ''), busStopId: String(initial?.poi.busStopId ?? ''),
    latitude: String(initial?.poi.latitude ?? 10.7681), longitude: String(initial?.poi.longitude ?? 106.7052),
    radiusMeters: initial?.poi.radiusMeters ?? 50, priority: initial?.poi.priority ?? 3,
    cooldownMinutes: initial ? String(initial.poi.cooldownMinutes ?? '') : '30',
  });
  const [translations, setTranslations] = useState<Record<string, TranslationInput>>(() => ({
    vi: { ...emptyTranslation(), name: initial?.poi.name ?? '' },
    ...Object.fromEntries((initial?.translations ?? []).map((item) => [item.languageCode, {
      name: item.name ?? '', description: item.description ?? '', ttsScript: item.ttsScript ?? '',
    }])),
  }));
  const [language, setLanguage] = useState('vi');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<Record<string, File>>({});
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const archived = saved?.poi.status === 'ARCHIVED';
  const disabled = pending || archived;
  const translation = translations[language] ?? emptyTranslation();
  const languageInfo = data.languages.find((item) => item.code === language);
  const currentAudio = saved?.audios.find((item) => item.languageCode === language);
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const validLocation = form.latitude !== '' && form.longitude !== '' && Number.isFinite(latitude)
    && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  const mapPoint = {
    latitude: validLocation ? latitude : 10.7681,
    longitude: validLocation ? longitude : 106.7052,
    radiusMeters: form.radiusMeters,
  };
  const overlaps = validLocation ? overlappingPois(mapPoint, data.geofences, saved?.poi.id) : [];
  const vi = translations.vi ?? emptyTranslation();
  const hasNarration = Boolean(vi.ttsScript.trim() || audioFiles.vi || saved?.audios.some((audio) => audio.languageCode === 'vi'));

  useEffect(() => {
    if (!dirty && !pending) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, pending]);

  function updateForm<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  function updateTranslation(key: keyof TranslationInput, value: string) {
    setTranslations((current) => ({
      ...current, [language]: { ...(current[language] ?? emptyTranslation()), [key]: value },
    }));
    setDirty(true);
  }

  function remember(value: EditorResponse) {
    savedRef.current = value;
    setSaved(value);
  }

  async function run(action: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true); setNotice(''); setErrors([]);
    try { await action(); } catch (failure) {
      setErrors([failure instanceof Error ? failure.message : 'Không lưu được dữ liệu. Vui lòng thử lại.']);
    } finally {
      busy.current = false; setPending(false);
    }
  }

  async function save(action: 'draft' | 'ready' | 'publish') {
    if (!form.name.trim()) throw new Error('Cần nhập tên địa danh.');
    const poi: PoiInput = {
      code: form.code.trim(), name: form.name.trim(), wardId: Number(form.wardId) || null,
      busStopId: Number(form.busStopId) || null, latitude, longitude,
      radiusMeters: form.radiusMeters, priority: form.priority,
      cooldownMinutes: form.cooldownMinutes === '' ? null : Number(form.cooldownMinutes),
    };
    // One transaction saves every text tab and the basic form before any publish call.
    let snapshot = await savePoiEditor(poi, prepareTranslations(translations, form.name), savedRef.current?.poi.id);
    remember(snapshot);
    setForm((current) => ({ ...current, code: snapshot.poi.code }));
    // Successful uploads leave the queue immediately, so retrying a later failure
    // uses the existing POI id and does not upload completed files again.
    for (const file of imageFiles) {
      const image = await uploadPoiImage(snapshot.poi.id, file);
      snapshot = { ...snapshot, images: [...snapshot.images, image] };
      remember(snapshot);
      setImageFiles((files) => files.filter((item) => item !== file));
    }
    for (const [lang, file] of Object.entries(audioFiles)) {
      const audio = await uploadPoiAudio(snapshot.poi.id, lang, file);
      snapshot = { ...snapshot, audios: [...snapshot.audios.filter((item) => item.languageCode !== lang), audio] };
      remember(snapshot);
      setAudioFiles((files) => { const next = { ...files }; delete next[lang]; return next; });
    }
    setDirty(false);
    setNotice('Đã lưu toàn bộ thông tin, nội dung và media.');
    if (action === 'ready') {
      const result = await markPoiReady(snapshot.poi.id);
      remember({ ...snapshot, poi: result.poi });
      if (result.issues.length) { setErrors(result.issues.map((issue) => issue.message)); return; }
      setNotice('POI đã sẵn sàng duyệt và xuất bản.');
    } else if (action === 'publish') {
      const result = await publishCmsPoi(snapshot.poi.id);
      if (result.issues.length) { setErrors(result.issues.map((issue) => issue.message)); return; }
      remember({ ...snapshot, poi: { ...snapshot.poi, status: 'PUBLISHED', version: result.dataVersion } });
      setNotice(`Đã xuất bản POI ở phiên bản ${result.dataVersion}. Gói offline đang được tạo ở nền.`);
    }
    if (!initial) router.replace(`/cms/poi/editor/${snapshot.poi.id}`);
  }

  function selectFiles(files: File[], kind: 'image' | 'audio') {
    const issues = files.map((file) => mediaFileError(file, kind)).filter((value): value is string => Boolean(value));
    if (issues.length) { setErrors(issues); return; }
    setErrors([]);
    if (kind === 'image') setImageFiles((current) => [...current, ...files]);
    else if (files[0]) setAudioFiles((current) => ({ ...current, [language]: files[0] }));
    if (files.length) setDirty(true);
  }

  function mutateMedia(action: (id: number) => Promise<unknown>) {
    void run(async () => {
      const id = savedRef.current?.poi.id;
      if (!id) return;
      await action(id);
      remember(await getCmsPoiEditor(id));
      setNotice('Đã cập nhật media.');
    });
  }

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link href="/cms/poi" aria-label="Về danh sách POI" className="rounded-xl border bg-white p-2"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-xl font-bold">{saved ? 'Soạn thảo POI' : 'Tạo điểm POI mới'}</h1>
          <p className="text-sm text-slate-500">
            {saved ? `${poiStatusLabels[saved.poi.status]} · #${saved.poi.id} · Version ${saved.poi.version}` : 'Bản nháp mới'}
            {dirty && ' · Có thay đổi chưa lưu'}
          </p>
        </div>
      </div>
      <button type="submit" form="poi-editor-form" value="draft" disabled={disabled}
        className={`${buttonClass} flex items-center gap-2 bg-white`}>
        <Save size={16} />{pending ? 'Đang xử lý…' : 'Lưu toàn bộ'}
      </button>
    </header>
    <div aria-live="polite" className="space-y-2">
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {errors.length > 0 && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
        <p className="font-semibold">Cần kiểm tra:</p>
        <ul className="list-disc pl-5">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
        {saved && <p className="mt-2">POI #{saved.poi.id} đã tồn tại. Bạn có thể sửa và thử lại ngay tại đây.</p>}
      </div>}
    </div>
    <form id="poi-editor-form" className="space-y-6" onSubmit={(event) => {
      event.preventDefault();
      const value = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
      void run(() => save(value === 'publish' || value === 'ready' ? value : 'draft'));
    }}>
      <fieldset disabled={disabled} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-white p-5">
          <h2 className="font-bold">1. Thông tin và vị trí</h2>
          <label htmlFor="poi-code" className="block text-sm">Mã POI (để trống để tự tạo)
            <input id="poi-code" maxLength={120} value={form.code} onChange={(e) => updateForm('code', e.target.value)} className={inputClass} />
          </label>
          <label htmlFor="poi-name" className="block text-sm">Tên địa danh *
            <input id="poi-name" required maxLength={250} value={form.name} onChange={(e) => updateForm('name', e.target.value)} className={inputClass} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label htmlFor="poi-ward" className="text-sm">Phường
              <select id="poi-ward" value={form.wardId} onChange={(e) => updateForm('wardId', e.target.value)} className={inputClass}>
                <option value="">Chưa chọn phường</option>
                {data.wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
              </select>
            </label>
            <label htmlFor="poi-bus-stop" className="text-sm">Trạm xe buýt
              <select id="poi-bus-stop" value={form.busStopId} onChange={(e) => updateForm('busStopId', e.target.value)} className={inputClass}>
                <option value="">Chưa chọn trạm</option>
                {data.stops.map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}
              </select>
            </label>
            <label htmlFor="poi-latitude" className="text-sm">Vĩ độ *
              <input id="poi-latitude" type="number" required min={-90} max={90} step="any" value={form.latitude}
                onChange={(e) => updateForm('latitude', e.target.value)} className={inputClass} />
            </label>
            <label htmlFor="poi-longitude" className="text-sm">Kinh độ *
              <input id="poi-longitude" type="number" required min={-180} max={180} step="any" value={form.longitude}
                onChange={(e) => updateForm('longitude', e.target.value)} className={inputClass} />
            </label>
          </div>
          <h2 className="border-t pt-4 font-bold">2. Cấu hình Geofence</h2>
          <label htmlFor="poi-radius" className="block text-sm">Bán kính kích hoạt: <strong>{form.radiusMeters} m</strong>
            <input id="poi-radius" type="range" min={20} max={300} step={1} value={form.radiusMeters}
              onChange={(e) => updateForm('radiusMeters', Number(e.target.value))} className="mt-2 block w-full accent-emerald-600" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="poi-priority" className="text-sm">Mức ưu tiên
              <select id="poi-priority" value={form.priority} onChange={(e) => updateForm('priority', Number(e.target.value))} className={inputClass}>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}{value === 5 ? ' — cao nhất' : ''}</option>)}
              </select>
            </label>
            <label htmlFor="poi-cooldown" className="text-sm">Cooldown (phút)
              <input id="poi-cooldown" type="number" min={1} max={1440} step={1} placeholder="Theo cấu hình hệ thống"
                value={form.cooldownMinutes} onChange={(e) => updateForm('cooldownMinutes', e.target.value)} className={inputClass} />
            </label>
          </div>
          <p className="text-xs text-slate-500">Bán kính 20–300 m; cooldown 1–1440 phút, để trống để dùng cấu hình hệ thống.</p>
        </div>
        <div className="space-y-3 rounded-2xl border bg-white p-5">
          <h2 className="flex items-center gap-2 font-bold"><MapPin size={18} />Bản đồ và vùng kích hoạt</h2>
          <GeofenceMap id={saved?.poi.id} {...mapPoint} neighbors={data.geofences} disabled={Boolean(disabled)}
            onChange={(lat, lng) => {
              setForm((current) => ({ ...current, latitude: String(lat), longitude: String(lng) }));
              setDirty(true);
            }} />
          {overlaps.length > 0 && <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Chồng lấn với {overlaps.length} POI — kiểm tra bán kính và mức ưu tiên:</p>
            <ul className="list-disc pl-5">{overlaps.map((poi) =>
              <li key={poi.id}>{poi.name} · cách {Math.round(poi.distance)} m · ưu tiên {poi.priority}</li>)}</ul>
          </div>}
        </div>
      </fieldset>

      <fieldset disabled={disabled} className="space-y-4 rounded-2xl border bg-white p-5">
        <legend className="px-2 font-bold">3. Nội dung và âm thanh đa ngôn ngữ</legend>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Ngôn ngữ nội dung">
          {data.languages.map((item) => <button key={item.code} type="button" role="tab" aria-selected={language === item.code}
            onClick={() => setLanguage(item.code)}
            className={`${buttonClass} ${language === item.code ? 'bg-emerald-700 text-white' : 'bg-white'}`}>
            {item.nativeName}{item.code === 'vi' ? ' *' : ''}
          </button>)}
        </div>
        <p className="text-xs text-slate-500">Tiếng Việt bắt buộc khi xuất bản. Các tab ngôn ngữ được lưu cùng một lần.</p>
        <div role="tabpanel" aria-label={`Nội dung ${language}`} className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label htmlFor={`poi-translation-${language}-name`} className="block text-sm">Tiêu đề ({language})
              <input id={`poi-translation-${language}-name`} maxLength={250} value={translation.name} placeholder={language === 'vi' ? 'Mặc định theo tên địa danh' : ''}
                onChange={(e) => updateTranslation('name', e.target.value)} className={inputClass} />
            </label>
            <div className="block text-sm">
              <label htmlFor={`poi-translation-${language}-description`}>Mô tả ({language})</label>
              <textarea id={`poi-translation-${language}-description`} rows={4} value={translation.description} onChange={(e) => updateTranslation('description', e.target.value)} className={inputClass} />
            </div>
            <div className="block text-sm">
              <label htmlFor={`poi-translation-${language}-tts`}>Kịch bản TTS ({language})</label>
              <textarea id={`poi-translation-${language}-tts`} rows={5} value={translation.ttsScript} onChange={(e) => updateTranslation('ttsScript', e.target.value)} className={inputClass} />
            </div>
            <TtsPreviewButton text={translation.ttsScript} language={language} locale={languageInfo?.localeTts ?? language} disabled={Boolean(disabled)} />
            {language !== 'vi' && <button type="button" className="text-sm text-red-700 underline"
              onClick={() => void run(async () => {
                if (savedRef.current?.translations.some((item) => item.languageCode === language)) {
                  await deletePoiTranslation(savedRef.current.poi.id, language);
                  remember(await getCmsPoiEditor(savedRef.current.poi.id));
                }
                setTranslations((current) => ({ ...current, [language]: emptyTranslation() }));
                setDirty(true);
                setNotice(`Đã xóa bản dịch ${language}.`);
              })}>Xóa bản dịch {language}</button>}
          </div>
          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold">Audio thu sẵn ({language})</h3>
            {currentAudio && <div className="space-y-2">
              <p className="break-all text-sm">{currentAudio.fileName} · {currentAudio.durationSeconds}s</p>
              <audio key={currentAudio.streamUrl + currentAudio.checksumSha256} controls preload="metadata"
                src={apiUrl(currentAudio.streamUrl)} className="w-full" />
              <button type="button" onClick={() => mutateMedia((id) => deletePoiAudio(id, language))}
                className="text-sm text-red-700 underline">Xóa audio {language}</button>
            </div>}
            <label htmlFor={`poi-audio-${language}`} className="block text-sm">Chọn audio ({language}) — MP3/M4A/AAC, tối đa 20 MB
              <input id={`poi-audio-${language}`} type="file" accept=".mp3,.m4a,.aac" className="mt-2 block w-full text-sm"
                onChange={(e) => { selectFiles(Array.from(e.target.files ?? []), 'audio'); e.target.value = ''; }} />
            </label>
            {audioFiles[language] && <div className="space-y-2 rounded-lg border border-amber-200 p-3">
              <p className="break-all text-sm">{audioFiles[language].name} · chờ lưu</p>
              <LocalMediaPreview file={audioFiles[language]} kind="audio" />
              <button type="button" className="text-sm underline" onClick={() => {
                setAudioFiles((files) => { const next = { ...files }; delete next[language]; return next; });
              }}>Bỏ file đã chọn</button>
            </div>}
            <p className="text-xs text-slate-500">Audio mới thay thế bản thu cùng ngôn ngữ khi bấm Lưu. Có thể dùng TTS nếu chưa có audio.</p>
            {Object.keys(audioFiles).length > 0 && <p className="text-sm text-amber-800">Audio chờ tải: {Object.keys(audioFiles).join(', ')}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset disabled={disabled} className="space-y-4 rounded-2xl border bg-white p-5">
        <legend className="px-2 font-bold">4. Hình ảnh và ảnh bìa</legend>
        <label htmlFor="poi-images" className="block text-sm">Thêm hình ảnh — JPG/PNG/WebP, tối đa 5 MB/ảnh
          <input id="poi-images" type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="mt-2 block w-full text-sm"
            onChange={(e) => { selectFiles(Array.from(e.target.files ?? []), 'image'); e.target.value = ''; }} />
        </label>
        <p className="text-xs text-slate-500">File mới được tải khi bấm Lưu. Đổi ảnh bìa, thứ tự và xóa ảnh đã tải được lưu ngay.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved?.images.map((image, index) => <div key={image.id} className="space-y-2 rounded-xl border p-3">
            <img src={apiUrl(image.url)} alt={image.fileName} className="h-32 w-full rounded-lg object-cover" />
            <p className="truncate text-xs">{image.fileName}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button type="button" disabled={image.coverImage} className="rounded border px-2 py-1"
                onClick={() => mutateMedia((id) => setPoiCover(id, image.id))}>{image.coverImage ? 'Ảnh bìa' : 'Chọn làm bìa'}</button>
              {([-1, 1] as const).map((direction) => <button key={direction} type="button"
                aria-label={`${direction === -1 ? 'Đưa lên' : 'Đưa xuống'} ${image.fileName}`}
                disabled={index + direction < 0 || index + direction >= saved.images.length} className="rounded border px-2 py-1"
                onClick={() => mutateMedia((id) => {
                  const ids = saved.images.map((item) => item.id);
                  [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
                  return reorderPoiImages(id, ids);
                })}>{direction === -1 ? '↑' : '↓'}</button>)}
              <button type="button" className="text-red-700" onClick={() => mutateMedia((id) => deletePoiImage(id, image.id))}>Xóa ảnh</button>
            </div>
          </div>)}
          {imageFiles.map((file, index) => <div key={`${file.name}-${index}`} className="space-y-2 rounded-xl border border-amber-200 p-3">
            <LocalMediaPreview file={file} kind="image" />
            <p className="truncate text-xs">{file.name} · chờ lưu</p>
            <button type="button" className="text-xs underline" onClick={() => setImageFiles((files) => files.filter((_, i) => i !== index))}>Bỏ ảnh đã chọn</button>
          </div>)}
        </div>
      </fieldset>

      {saved ? <PoiLinks key={saved.poi.id} poi={saved.poi} initialTours={saved.tours} disabled={Boolean(disabled)} />
        : <p className="text-sm text-slate-500">Sau khi lưu nháp, bạn có thể gắn Tour và tạo mã QR cho POI.</p>}

      <section className="space-y-3 rounded-2xl border bg-white p-5">
        <h2 className="font-bold">6. Kiểm tra và xuất bản</h2>
        <ul className="space-y-1 text-sm">
          <li>{validLocation ? '✓' : '○'} Tọa độ hợp lệ</li>
          <li>{(vi.name.trim() || form.name.trim()) && vi.description.trim() ? '✓' : '○'} Tiêu đề và mô tả tiếng Việt</li>
          <li>{hasNarration ? '✓' : '○'} Audio hoặc kịch bản TTS tiếng Việt</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="submit" value="draft" disabled={disabled} className={buttonClass}>
            {saved?.poi.status === 'PUBLISHED' ? 'Lưu thay đổi' : 'Lưu nháp'}
          </button>
          <button type="submit" value="ready" disabled={disabled || saved?.poi.status === 'PUBLISHED'} className={buttonClass}>Lưu và đánh dấu Ready</button>
          <button type="submit" value="publish" disabled={disabled} className={`${buttonClass} bg-emerald-700 text-white`}>Lưu và xuất bản</button>
          <Link href="/cms/publish" className="self-center text-sm text-emerald-700 underline">Xuất bản & gói offline</Link>
        </div>
        {pending && <p role="status" className="text-sm">Đang lưu thông tin và xử lý media…</p>}
      </section>
    </form>
  </div>;
}
