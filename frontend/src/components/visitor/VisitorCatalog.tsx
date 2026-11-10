'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { getVisitorCatalog, type VisitorCatalog } from '@/services/visitorCatalog';

type CatalogResult = { language: string } & (
  | { status: 'ready'; catalog: VisitorCatalog }
  | { status: 'error' }
);

const CatalogContext = createContext<CatalogResult | null>(null);

export function VisitorCatalogProvider({ children }: { children: ReactNode }) {
  const language = useLanguageStore((state) => state.currentLang);
  const [result, setResult] = useState<CatalogResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getVisitorCatalog(language, controller.signal)
      .then((catalog) => {
        if (!controller.signal.aborted) setResult({ language, status: 'ready', catalog });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ language, status: 'error' });
      });
    return () => controller.abort();
  }, [language]);

  return (
    <CatalogContext.Provider value={result?.language === language ? result : null}>
      {children}
    </CatalogContext.Provider>
  );
}

export function VisitorCatalogContent({ children }: { children: (catalog: VisitorCatalog) => ReactNode }) {
  const result = useContext(CatalogContext);
  if (!result) return <p role="status" className="p-6">Đang tải dữ liệu tham quan…</p>;
  if (result.status === 'error') {
    return <p role="alert" className="p-6">Không tải được dữ liệu tham quan. Kiểm tra kết nối và tải lại trang.</p>;
  }
  return <>{children(result.catalog)}</>;
}
