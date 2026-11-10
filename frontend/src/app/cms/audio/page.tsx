'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, Upload, Play, Pause, Sparkles, FileAudio, CheckCircle } from 'lucide-react';
import { listCmsPois, type CmsPoi } from '@/services/cmsPois';
import { useLanguageStore } from '@/stores/languageStore';

const ttsSamples: Record<string, string> = {
  vi: 'Chào mừng quý khách đến với Thành phố Hồ Chí Minh. Mời quý khách cùng khám phá các di tích lịch sử.',
  en: 'Welcome to Ho Chi Minh City. Join us as we explore its historic landmarks.',
  'zh-CN': '欢迎来到胡志明市。让我们一起探索这里的历史遗迹。',
  th: 'ยินดีต้อนรับสู่เมืองโฮจิมินห์ ขอเชิญทุกท่านร่วมสำรวจสถานที่สำคัญทางประวัติศาสตร์',
  hi: 'हो ची मिन्ह शहर में आपका स्वागत है। आइए, यहाँ के ऐतिहासिक स्थलों को देखें।',
  ko: '호찌민시에 오신 것을 환영합니다. 함께 이곳의 역사 유적을 둘러보겠습니다.',
  ja: 'ホーチミン市へようこそ。この街の史跡を一緒に巡りましょう。',
  fr: 'Bienvenue à Hô Chi Minh-Ville. Partons à la découverte de ses sites historiques.',
};

export default function CmsAudioPage() {
  const { getActiveLanguages } = useLanguageStore();
  const languages = getActiveLanguages();

  const [poiList, setPoiList] = useState<CmsPoi[] | null>(null);
  const [poiLoadFailed, setPoiLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPois() {
      const pois: CmsPoi[] = [];
      let page = 0;
      let totalPages: number;
      do {
        const query = new URLSearchParams({ page: String(page) });
        const result = await listCmsPois(query, controller.signal);
        pois.push(...result.content);
        totalPages = result.totalPages;
        page += 1;
      } while (page < totalPages && !controller.signal.aborted);

      if (!controller.signal.aborted) setPoiList(pois);
    }

    loadPois().catch(() => {
      if (!controller.signal.aborted) setPoiLoadFailed(true);
    });
    return () => controller.abort();
  }, []);

  const [ttsLang, setTtsLang] = useState('vi');
  const [ttsDrafts, setTtsDrafts] = useState<Partial<Record<string, string>>>({});
  const ttsText = ttsDrafts[ttsLang] ?? ttsSamples[ttsLang] ?? '';
  const [ttsError, setTtsError] = useState('');
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  const piper = useRef<{ request: AbortController; audio?: HTMLAudioElement; url?: string } | null>(null);

  function stopPiper() {
    const preview = piper.current;
    if (!preview) return;
    piper.current = null;
    preview.request.abort();
    preview.audio?.pause();
    if (preview.url) URL.revokeObjectURL(preview.url);
  }

  useEffect(() => stopPiper, []);

  async function playVietnamese() {
    const preview: NonNullable<typeof piper.current> = { request: new AbortController() };
    piper.current = preview;
    setTtsError('');
    setIsPlayingTts(true);
    const finish = (error = '') => {
      if (piper.current !== preview) return;
      stopPiper();
      setIsPlayingTts(false);
      setTtsError(error);
    };
    try {
      const response = await fetch('/api/tts-vi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText }),
        signal: preview.request.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Không gọi được Piper.');
      }
      const audioFile = await response.blob();
      if (piper.current !== preview) return;
      preview.url = URL.createObjectURL(audioFile);
      preview.audio = new Audio(preview.url);
      preview.audio.onended = () => finish();
      preview.audio.onerror = () => finish('Không phát được âm thanh tiếng Việt.');
      await preview.audio.play();
    } catch (error) {
      finish(error instanceof Error ? error.message : 'Không phát được giọng tiếng Việt.');
    }
  }

  const handleTestTts = () => {
    if (ttsLang === 'vi') {
      if (piper.current) {
        stopPiper();
        setIsPlayingTts(false);
      } else {
        void playVietnamese();
      }
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingTts) {
        setIsPlayingTts(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(ttsText);
      const locale = languages.find((language) => language.code === ttsLang)?.localeTts ?? ttsLang;
      const normalize = (tag: string) => tag.replace(/_/g, '-').toLowerCase();
      const target = normalize(locale);
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((item) => normalize(item.lang) === target)
        ?? voices.find((item) => normalize(item.lang).split('-')[0] === target.split('-')[0]);

      if (!voice) {
        setIsPlayingTts(false);
        setTtsError('Trình duyệt chưa có giọng đọc phù hợp (' + locale + '). Hãy kiểm tra giọng nói trên thiết bị hoặc thử lại sau khi danh sách giọng đã tải.');
        return;
      }

      setTtsError('');
      u.voice = voice;
      u.lang = voice.lang;
      setIsPlayingTts(true);
      u.onend = () => setIsPlayingTts(false);
      u.onerror = () => setIsPlayingTts(false);
      window.speechSynthesis.speak(u);
    } else {
      alert('Trình duyệt không hỗ trợ Web Speech Synthesis.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-600" />
          Kho Audio Thu Sẵn & Thử Nghiệm TTS (FR-CMS-11, FR-CMS-12)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý tập tin âm thanh hướng dẫn viên và kiểm tra giọng đọc nhân tạo đa ngôn ngữ
        </p>
      </div>

      {/* Grid: Left = Pre-recorded audio, Right = TTS Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Audio File */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-emerald-600" />
              Tải lên Audio thu âm chất lượng cao
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Max 20MB / MP3, M4A, AAC</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Gắn cho điểm POI</label>
              <select disabled={!poiList?.length} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none">
                {!poiList?.length && (
                  <option value="">
                    {poiLoadFailed ? 'Không tải được danh sách POI' : poiList ? 'Chưa có điểm POI' : 'Đang tải danh sách POI…'}
                  </option>
                )}
                {poiList?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Ngôn ngữ của bản thu âm</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none">
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-colors bg-slate-50/50 cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">Kéo thả file âm thanh hoặc bấm để chọn</p>
              <p className="text-[11px] text-slate-400 mt-1">Định dạng hỗ trợ: MP3, M4A, AAC, WAV (≤ 20 MB)</p>
            </div>

            <button
              disabled={!poiList?.length}
              onClick={() => alert('Đã upload và gắn file âm thanh thành công vào POI!')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-98 transition-all"
            >
              Lưu & Tự động trích xuất thời lượng
            </button>
          </div>
        </div>

        {/* TTS Playground */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Sân chơi Thử giọng TTS (TTS Playground)
            </h2>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Piper / Web Speech
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Chọn ngôn ngữ thử nghiệm</label>
              <select
                value={ttsLang}
                onChange={(e) => {
                  stopPiper();
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsPlayingTts(false);
                  setTtsError('');
                  setTtsLang(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} - Locale: {l.localeTts}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nội dung kịch bản văn bản</label>
              <textarea
                rows={4}
                value={ttsText}
                onChange={(e) => setTtsDrafts({ ...ttsDrafts, [ttsLang]: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
              ></textarea>
            </div>

            {ttsError && <p role="alert" className="text-xs text-red-700">{ttsError}</p>}
            <button
              onClick={handleTestTts}
              disabled={!isPlayingTts && !ttsText.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {isPlayingTts ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlayingTts ? 'Dừng đọc' : 'Nghe thử giọng đọc nhân tạo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
