import { Menu, Search } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { useSidebarStore } from '@/store';
import { KEYBOARD_SHORTCUTS } from '@/utils';
import { Breadcrumb } from './breadcrumb';

export function Topbar() {
  const { toggle } = useSidebarStore();

  const handleGlobalSearch = useCallback(() => {
    // Será implementado na Fase 2
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === KEYBOARD_SHORTCUTS.GLOBAL_SEARCH) {
        e.preventDefault();
        handleGlobalSearch();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleGlobalSearch]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-xl shadow-sm">
      <button
        onClick={toggle}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-all"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <Breadcrumb />

      <div className="flex-1" />

      <button
        onClick={handleGlobalSearch}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
        aria-label="Buscar (Ctrl+K)"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-xs md:inline-block">
          Ctrl+K
        </kbd>
      </button>
    </header>
  );
}
