export interface DateRange {
  from: string | Date;
  to: string | Date;
}

export interface SelectOption {
  label: string;
  value: string;
}

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
  children?: NavItem[];
}
