import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Lock,
  Upload,
  ScrollText,
  Activity,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { cn } from '@/utils';
import { useSidebarStore } from '@/store';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Fichas', href: '/records', icon: FileText },
  { label: 'Travas', href: '/locks', icon: Lock },
  { label: 'Importação', href: '/import', icon: Upload },
  { label: 'Logs de Execução', href: '/logs/execution', icon: ScrollText },
  { label: 'Monitoramento', href: '/monitoring', icon: Activity },
];

export function Sidebar() {
  const { isCollapsed, isOpen, collapse, expand } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        !isOpen && '-translate-x-full',
        isOpen && 'translate-x-0',
      )}
      onMouseEnter={() => isCollapsed && expand()}
      onMouseLeave={() => !isCollapsed && collapse()}
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
          <Shield className="size-8 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold text-foreground">AEGIS</span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={collapse}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Recolher sidebar"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary-light'
                  : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
                isCollapsed && 'justify-center px-2',
              )
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="size-5 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">AEGIS v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
