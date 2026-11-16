'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  Loader2,
  Pencil,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { apiUrl } from '@/services/api';
import type { CoverageCell, CoverageRow, Translation } from '@/services/cmsPois';

export type CoverageStatus = 'AUDIO' | 'TTS' | 'TEXT' | 'MISSING';

interface TranslationCellDialogProps {
  row: CoverageRow;
  cell: CoverageCell | undefined;
  status: CoverageStatus;
  translation: Translation | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}

const STATUS: Record<CoverageStatus, { label: string; badgeClass: string; icon: LucideIcon }> = {
  AUDIO: {
    label: 'Audio thu sẵn',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: Volume2,
  },
  TTS: {
    label: 'Script TTS',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: FileText,
  },
  TEXT: {
    label: 'Có bản dịch',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
    icon: FileText,
  },
  MISSING: {
    label: 'Thiếu nội dung',
    badgeClass: 'border-red-200 bg-red-50 text-red-600',
    icon: AlertCircle,
  },
};

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return minutes > 0 ? `${minutes} phút ${remaining} giây` : `${remaining} giây`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {text}
    </div>
  );
}

function ErrorBlock({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {text}
    </div>
  );
}

interface ScriptSectionProps {
  script: string | undefined;
  loading: boolean;
  error: string;
  copied: boolean;
  onCopy: () => void;
}

function ScriptSection({ script, loading, error, copied, onCopy }: ScriptSectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <FileText className="h-4 w-4 text-amber-500" />
          Kịch bản đọc TTS
        </h3>
        {script && (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
        )}
      </div>
      {loading ? (
        <LoadingBlock text="Đang tải kịch bản TTS..." />
      ) : error ? (
        <ErrorBlock text={error} />
      ) : script ? (
        <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm leading-6 text-slate-700">
          {script}
        </div>
      ) : (
        <ErrorBlock text="Chưa có script TTS cho ngôn ngữ này." />
      )}
    </section>
  );
}

export default function TranslationCellDialog({
  row,
  cell,
  status,
  translation,
  loading,
  error,
  onClose,
}: TranslationCellDialogProps) {
  const [copied, setCopied] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meta = STATUS[status];
  const StatusIcon = meta.icon;
  const language = cell?.languageCode ?? '';

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  useEffect(() => {
    setAudioError('');
    if (status !== 'AUDIO' || !cell?.audio) return;
    const audio = audioRef.current;
    if (!audio) return;
    const play = () => {
      void audio.play().catch(() => {
        // Autoplay may be blocked by the browser; the native controls still work.
      });
    };
    if (audio.readyState >= 2) play();
    else audio.addEventListener('canplay', play, { once: true });
    return () => {
      audio.removeEventListener('canplay', play);
      audio.pause();
    };
  }, [status, cell?.audio]);

  async function copyScript(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission can be denied; the text is still selectable.
    }
  }

  const description = translation?.description?.trim();
  const script = translation?.ttsScript?.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="translation-cell-title"
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Chi tiết ô bản dịch
            </p>
            <h2 id="translation-cell-title" className="mt-1 truncate text-base font-bold text-slate-900">
              {row.poiName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-slate-500">
                {row.poiCode}
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-bold uppercase text-slate-600">
                {language || '—'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-bold ${meta.badgeClass}`}>
                <StatusIcon className="h-3 w-3" />
                {meta.label}
              </span>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {status === 'AUDIO' && (
            <section className="space-y-3">
              {cell?.audio ? (
                <>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <audio
                      ref={audioRef}
                      key={cell.audio.streamUrl}
                      src={apiUrl(cell.audio.streamUrl)}
                      controls
                      autoPlay
                      preload="auto"
                      className="w-full"
                      onError={() => setAudioError('Không tải được file audio. Kiểm tra file trên máy chủ.')}
                    />
                    {audioError && <p className="mt-2 text-[11px] font-semibold text-red-600">{audioError}</p>}
                  </div>
                  <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-[11px]">
                    <div>
                      <dt className="font-semibold text-slate-400">Tệp</dt>
                      <dd className="mt-0.5 break-all font-medium text-slate-700">{cell.audio.fileName}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-400">Định dạng</dt>
                      <dd className="mt-0.5 font-medium uppercase text-slate-700">{cell.audio.format}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-400">Thời lượng</dt>
                      <dd className="mt-0.5 font-medium text-slate-700">{formatDuration(cell.audio.durationSeconds)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-400">Dung lượng</dt>
                      <dd className="mt-0.5 font-medium text-slate-700">{formatBytes(cell.audio.sizeBytes)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <ErrorBlock text="Ô này được đánh dấu có audio nhưng chưa tìm thấy file trong bảng poi_audios." />
              )}
            </section>
          )}

          {status === 'AUDIO' && (
            <ScriptSection
              script={script}
              loading={loading}
              error={error}
              copied={copied}
              onCopy={() => void copyScript(script ?? '')}
            />
          )}

          {status === 'TTS' && (
            <ScriptSection
              script={script}
              loading={loading}
              error={error}
              copied={copied}
              onCopy={() => void copyScript(script ?? '')}
            />
          )}

          {status === 'TEXT' && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileText className="h-4 w-4 text-sky-500" />
                Nội dung bản dịch
              </h3>
              <div className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 text-xs font-medium text-sky-800">
                Ngôn ngữ này đã có bản dịch nhưng chưa có audio thu sẵn và chưa có script TTS.
              </div>
              {loading ? (
                <LoadingBlock text="Đang tải bản dịch..." />
              ) : error ? (
                <ErrorBlock text={error} />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">{translation?.name || '—'}</p>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-600">
                    {description || 'Chưa có mô tả cho bản dịch này.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {status === 'MISSING' && (
            <section className="space-y-3">
              <div className="flex flex-col items-center rounded-xl border border-dashed border-red-200 bg-red-50/50 px-5 py-7 text-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="mt-2 text-sm font-bold text-red-700">Chưa có nội dung cho ngôn ngữ này</p>
                <p className="mt-1 text-xs text-red-600">
                  POI chưa có bản dịch, audio thu sẵn hoặc script TTS cho {language || 'ngôn ngữ đã chọn'}.
                </p>
              </div>
              {error && <ErrorBlock text={error} />}
            </section>
          )}

          {status !== 'MISSING' && translation && (
            <section className="space-y-1.5 border-t border-slate-100 pt-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bản dịch</h3>
              <p className="text-sm font-semibold text-slate-800">{translation.name}</p>
              {description && (
                <p className="whitespace-pre-wrap text-xs leading-6 text-slate-600">{description}</p>
              )}
            </section>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3">
          <Link
            href={`/cms/poi/editor/${row.poiId}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            Chỉnh sửa POI
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
