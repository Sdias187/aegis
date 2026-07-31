import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { LoadingState } from '@/components/shared';
import { useSidebarStore } from '@/store';
import { cn } from '@/utils';

export function MainLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto animate-fadeIn p-6">
            <Suspense fallback={<LoadingState message="Carregando..." />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
