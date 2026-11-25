'use client';

import { useEffect, useRef, useState } from 'react';

export default function TtsPreviewButton({ text, language, locale, disabled = false }: {
  text: string; language: string; locale: string; disabled?: boolean;
}) {
  const active = useRef<{ controller?: AbortController; audio?: HTMLAudioElement; url?: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  function stop() {
    active.current?.controller?.abort();
    active.current?.audio?.pause();
    if (active.current?.url) URL.revokeObjectURL(active.current.url);
    active.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  useEffect(() => {
    stop();
    setPlaying(false);
    setError('');
    return stop;
  }, [text, language]);

  async function play() {
    if (playing) { stop(); setPlaying(false); return; }
    setError('');
    const preview: NonNullable<typeof active.current> = {};
    active.current = preview;
    const finish = (message = '') => {
      if (active.current !== preview) return;
      stop();
      setPlaying(false);
      setError(message);
    };
    setPlaying(true);
    try {
      if (language === 'vi') {
        preview.controller = new AbortController();
        const response = await fetch('/api/tts-vi', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }), signal: preview.controller.signal,
        });
        if (!response.ok) throw new Error('Không tạo được giọng Piper tiếng Việt. Kiểm tra dịch vụ TTS.');
        const blob = await response.blob();
        if (active.current !== preview) return;
        preview.url = URL.createObjectURL(blob);
        preview.audio = new Audio(preview.url);
        preview.audio.onended = () => finish();
        preview.audio.onerror = () => finish('Không phát được bản nghe thử.');
        await preview.audio.play();
      } else {
        if (!('speechSynthesis' in window)) throw new Error('Trình duyệt không hỗ trợ đọc TTS.');
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase())
          ?? voices.find((v) => v.lang.split('-')[0] === locale.split('-')[0]);
        if (!voice) throw new Error(`Thiết bị chưa có giọng đọc ${locale}.`);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = locale;
        utterance.onend = () => finish();
        utterance.onerror = () => finish('Không phát được giọng TTS.');
        window.speechSynthesis.speak(utterance);
      }
    } catch (failure) {
      finish(failure instanceof Error ? failure.message : 'Không phát được TTS.');
    }
  }

  return <div className="space-y-1">
    <button type="button" disabled={disabled || !text.trim()} onClick={() => void play()}
      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">
      {playing ? 'Dừng nghe thử' : 'Nghe thử TTS'}
    </button>
    {error && <p role="alert" className="text-sm text-amber-800">{error}</p>}
  </div>;
}
