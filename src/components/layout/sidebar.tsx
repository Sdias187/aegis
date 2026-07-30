import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Lock,
  Upload,
  ScrollText,
  Activity,
  ChevronLeft,
  ChevronDown,
  Shield,
  Search,
  Server,
  MapPin,
  Radio,
  Database,
} from 'lucide-react';
import { cn } from '@/utils';
import { useSidebarStore } from '@/store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Travas',
    icon: Shield,
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Fichas', href: '/records', icon: FileText },
      { label: 'Travas', href: '/locks', icon: Lock },
      { label: 'Importação', href: '/import', icon: Upload },
      { label: 'Logs de Execução', href: '/logs/execution', icon: ScrollText },
      { label: 'Monitoramento', href: '/monitoring', icon: Activity },
    ],
  },
  {
    label: 'Consulta de Logs',
    icon: Search,
    items: [
      { label: 'GPS', href: '/consulta-logs/gps', icon: MapPin },
      { label: 'VIVO 360', href: '/consulta-logs/vivo-360', icon: Radio },
    ],
  },
  {
    label: 'Serviços',
    icon: Server,
    items: [
      { label: 'Siebel', href: '/servicos/siebel', icon: Database },
    ],
  },
];

function useInitialExpandedGroups(groups: NavGroup[]): Set<string> {
  const location = useLocation();
  const expanded = new Set<string>();

  for (const group of groups) {
    const isActive = group.items.some((item) => {
      if (item.href === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.href);
    });
    if (isActive) expanded.add(group.label);
  }

  return expanded;
}

export function Sidebar() {
  const { isCollapsed, isOpen, collapse, expand } = useSidebarStore();
  const [expandedGroups, setExpandedGroups] = useState(() => useInitialExpandedGroups(navGroups));

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

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
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Group Header */}
            {isCollapsed ? (
              <div className="flex justify-center py-2 text-muted-foreground">
                <group.icon className="size-5 shrink-0" />
              </div>
            ) : (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
              >
                <group.icon className="size-5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform duration-200',
                    expandedGroups.has(group.label) && 'rotate-0',
                    !expandedGroups.has(group.label) && '-rotate-90',
                  )}
                />
              </button>
            )}

            {/* Group Items */}
            {expandedGroups.has(group.label) && !isCollapsed && (
              <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
                {group.items.map((item) => (
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
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
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
