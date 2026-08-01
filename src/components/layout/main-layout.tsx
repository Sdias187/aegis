import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { LoadingState } from '@/components/shared';
import { useSidebarStore } from '@/store';
import { cn } from '@/utils';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function MainLayout() {
  const { isCollapsed } = useSidebarStore();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          !isMobile && (isCollapsed ? 'ml-16' : 'ml-64'),
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto animate-fadeIn px-4 py-4 sm:px-6 sm:py-6">
            <Suspense fallback={<LoadingState message="Carregando..." />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
