import { format as dateFnsFormat, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy HH:mm'): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(parsed, pattern, { locale: ptBR });
}

export function formatDateShort(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsFormat(parsed, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatRelativeDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true, locale: ptBR });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}
