import { useState, useCallback, useMemo } from 'react';
import { createColumnHelper, type SortingState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Card, Input } from '@/components/ui';
import { DataTable } from '@/components/data-table';
import { monitoringApi } from '../services/monitoring-api';
import type { MonitoringLog, MonitoringListParams } from '../types/monitoring.types';

const QUICK_PRESETS = [
  { label: 'Última hora', minutes: 1 },
  { label: 'Últimas 6h', minutes: 6 },
  { label: 'Últimas 24h', minutes: 24 },
  { label: 'Últimos 7 dias', minutes: 168 },
] as const;

const TABLE_PAGE_SIZE = 20;

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('pt-BR');
  } catch {
    return dateStr;
  }
}

const columnHelper = createColumnHelper<MonitoringLog>();

export default function MonitoringPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [quickPreset, setQuickPreset] = useState(24); // default 24h
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'CREATED_AT', desc: true },
  ]);

  const buildParams = useCallback((): MonitoringListParams => {
    const params: MonitoringListParams = {
      page,
      limit: TABLE_PAGE_SIZE,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      sortBy: sorting[0]?.id || 'CREATED_AT',
    };

    if (search) params.search = search;
    if (customDateFrom) params.dateFrom = customDateFrom.replace('T', ' ');
    if (customDateTo) params.dateTo = customDateTo.replace('T', ' ');

    return params;
  }, [page, search, quickPreset, customDateFrom, customDateTo, sorting]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['monitoring', buildParams()],
    queryFn: () => monitoringApi.list(buildParams()),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('sourceSystem', {
        header: 'Sistema',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        enableSorting: true,
        id: 'SOURCE_SYSTEM',
      }),
      columnHelper.accessor('durationMs', {
        header: 'Duração',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {formatMs(info.getValue())}
          </span>
        ),
        enableSorting: true,
        id: 'DURATION_MS',
      }),
      columnHelper.accessor('remoteAddr', {
        header: 'Origem',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">{info.getValue() ?? '-'}</span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('userAgent', {
        header: 'User-Agent',
        cell: (info) => (
          <span className="text-sm text-muted-foreground max-w-[200px] truncate block" title={info.getValue()}>
            {info.getValue() ?? '-'}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Data',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
        enableSorting: true,
        id: 'CREATED_AT',
      }),
      columnHelper.accessor('requestBody', {
        header: 'Requisição',
        cell: (info) => {
          const body = info.getValue();
          return (
            <span className="max-w-[250px] truncate block text-xs font-mono text-muted-foreground" title={body}>
              {body ?? '-'}
            </span>
          );
        },
        enableSorting: false,
      }),
    ] as any,
    [],
  );

  const handleQuickPreset = (minutes: number) => {
    setQuickPreset(minutes);
    setCustomDateFrom('');
    setCustomDateTo('');
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setQuickPreset(24);
    setCustomDateFrom('');
    setCustomDateTo('');
    setPage(1);
  };

  const hasFilters = search || customDateFrom;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Monitoramento"
        description="Logs dos sistemas de monitoramento que consultam o AEGIS"
      />

      {/* Filtros */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar em sistema, payload, IP..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Período */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Período:</span>
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                onClick={() => handleQuickPreset(preset.minutes)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  quickPreset === preset.minutes && !customDateFrom
                    ? 'bg-primary/10 text-primary-light'
                    : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <input
                type="datetime-local"
                value={customDateFrom}
                onChange={(e) => { setCustomDateFrom(e.target.value); setQuickPreset(0); setPage(1); }}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
              <span className="text-xs text-muted-foreground">até</span>
              <input
                type="datetime-local"
                value={customDateTo}
                onChange={(e) => { setCustomDateTo(e.target.value); setQuickPreset(0); setPage(1); }}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
            >
              <X className="size-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Tabela */}
      <DataTable
        data={data?.data ?? []}
        columns={columns as any}
        totalCount={data?.pagination?.total ?? 0}
        page={page}
        pageSize={TABLE_PAGE_SIZE}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="Nenhum log de monitoramento encontrado no período."
      />
    </div>
  );
}
