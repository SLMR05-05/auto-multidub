'use client';

import { usePathname } from 'next/navigation';
import CmsSidebar from '@/components/cms/CmsSidebar';
import CmsHeader from '@/components/cms/CmsHeader';

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/cms/login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-900">{children}</div>;
  }

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
