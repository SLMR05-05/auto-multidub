import { VisitorCatalogProvider } from '@/components/visitor/VisitorCatalog';
import VisitorHeader from '@/components/visitor/VisitorHeader';
import VisitorNavbar from '@/components/visitor/VisitorNavbar';
import MiniPlayer from '@/components/visitor/MiniPlayer';
import FloatingMic from '@/components/visitor/FloatingMic';

export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <VisitorHeader />
      <main className="flex-1"><VisitorCatalogProvider>{children}</VisitorCatalogProvider></main>
      <MiniPlayer />
      <FloatingMic />
      {/* Mobile-only Bottom Navigation Bar */}
      <div className="md:hidden">
        <VisitorNavbar />
      </div>
    </div>
  );
}
