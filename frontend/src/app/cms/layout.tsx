'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { readCmsSession } from '@/services/cms';
import CmsSidebar from '@/components/cms/CmsSidebar';
import CmsHeader from '@/components/cms/CmsHeader';

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/cms/login';
  const [mounted, setMounted] = useState(false);
  const hasSession = mounted && !isLoginPage && Boolean(readCmsSession());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoginPage && !hasSession) {
      router.replace('/cms/login');
    }
  }, [mounted, isLoginPage, hasSession, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

  if (!hasSession) return <p role="status" className="p-6">Đang kiểm tra phiên CMS…</p>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <CmsSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CmsHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
