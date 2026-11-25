'use client';

import { useEffect, useState } from 'react';

export default function LocalMediaPreview({ file, kind }: { file: File; kind: 'image' | 'audio' }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  if (!url) return null;
  return kind === 'image'
    ? <img src={url} alt={file.name} className="h-32 w-full rounded-lg object-cover" />
    : <audio controls preload="metadata" src={url} className="w-full" />;
}
