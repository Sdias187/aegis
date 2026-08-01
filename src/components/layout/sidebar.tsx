import { useState, useEffect } from 'react';
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
  X,
  Ban,
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
      { label: 'Importação', href: '/import/massivo', icon: Upload },
      { label: 'Badlist', href: '/badlist', icon: Ban },
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
    items: [{ label: 'Siebel', href: '/servicos/siebel', icon: Database }],
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

export function Sidebar() {
  const { isCollapsed, isOpen, collapse, expand } = useSidebarStore();
  const initialExpanded = useInitialExpandedGroups(navGroups);
  const [expandedGroups, setExpandedGroups] = useState(initialExpanded);
  const isMobile = useIsMobile();
  const location = useLocation();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // Auto-collapse on mobile when navigating
  useEffect(() => {
    if (isMobile && isOpen) {
      collapse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

  // Auto-collapse on small screens on mount
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      collapse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleNavClick = () => {
    if (isMobile) {
      collapse();
    }
  };

  // Mobile: render as overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={collapse}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-surface transition-transform duration-300',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          aria-label="Navegação principal"
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-3">
              <Shield className="size-7 text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">AEGIS</span>
            </div>
            <button
              onClick={collapse}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navGroups.map((group) => (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    expandedGroups.has(group.label)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
                  )}
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

                {expandedGroups.has(group.label) && (
                  <div className="ml-2 mt-1 space-y-0.5 border-l border-border pl-3">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/'}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          cn(
                            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary/10 text-primary-light before:absolute before:-left-3 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary-light'
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
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground">AEGIS v1.0.0</p>
          </div>
        </aside>
      </>
    );
  }

  // Desktop: original sidebar behavior
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
      onMouseEnter={() => isCollapsed && expand()}
      onMouseLeave={() => !isCollapsed && collapse()}
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
          <Shield className="size-7 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">AEGIS</span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={collapse}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
            aria-label="Recolher sidebar"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Group Header */}
            {isCollapsed ? (
              <div className="flex justify-center py-2.5 text-muted-foreground">
                <group.icon className="size-5 shrink-0" />
              </div>
            ) : (
              <button
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  expandedGroups.has(group.label)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
                )}
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
              <div className="ml-2 mt-1 space-y-0.5 border-l border-border pl-3">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary-light before:absolute before:-left-3 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary-light'
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
