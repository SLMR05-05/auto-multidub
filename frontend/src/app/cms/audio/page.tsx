'use client';

import { useState } from 'react';
import { Volume2, Upload, Play, Pause, Sparkles, FileAudio, CheckCircle } from 'lucide-react';
import { MOCK_POIS } from '@/services/mockData';
import { useLanguageStore } from '@/stores/languageStore';

export default function CmsAudioPage() {
  const { getActiveLanguages } = useLanguageStore();
  const languages = getActiveLanguages();

  const [ttsLang, setTtsLang] = useState('vi');
  const [ttsText, setTtsText] = useState(
    'Chào mừng quý khách đến với Thành phố Hồ Chí Minh. Đây là bản thuyết minh giọng đọc AI thử nghiệm.'
  );
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  const handleTestTts = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(ttsText);
      const found = languages.find((l) => l.code === ttsLang);
      u.lang = found?.localeTts || 'vi-VN';
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
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none">
                {MOCK_POIS.map((p) => (
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
              Live Web Speech API
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Chọn ngôn ngữ thử nghiệm</label>
              <select
                value={ttsLang}
                onChange={(e) => setTtsLang(e.target.value)}
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
                onChange={(e) => setTtsText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
              ></textarea>
            </div>

            <button
              onClick={handleTestTts}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {isPlayingTts ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlayingTts ? 'Đang đọc âm thanh...' : 'Nghe thử giọng đọc nhân tạo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
