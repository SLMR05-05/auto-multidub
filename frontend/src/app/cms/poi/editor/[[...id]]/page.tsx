'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPoiEditor } from '@/services/cmsPois';
import PoiEditor from '@/components/cms/PoiEditor';

type EditorData = Awaited<ReturnType<typeof getPoiEditor>>;

export default function CmsPoiEditorPage() {
  const id = useParams<{ id?: string[] }>().id?.[0];
  const [result, setResult] = useState<{ id?: string; data?: EditorData; error?: string } | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    getPoiEditor(id, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ id, data });
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ id, error: failure instanceof Error ? failure.message : 'Không tải được POI.' });
    });
    return () => controller.abort();
  }, [id, revision]);

  if (!result || result.id !== id) return <p role="status">Đang tải dữ liệu POI…</p>;
  if (!result.data) return <div className="space-y-3">
    <p role="alert" className="text-red-700">{result.error}</p>
    <button onClick={() => setRevision((value) => value + 1)} className="rounded border px-4 py-2">Thử tải lại</button>
  </div>;
  return <PoiEditor key={id ?? 'new'} data={result.data} />;
}
