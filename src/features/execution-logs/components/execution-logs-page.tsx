import { useState, useCallback, useMemo } from 'react';
import {
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Card, Input, Select } from '@/components/ui';
import { DataTable } from '@/components/data-table';
import { executionLogsApi } from '../services/execution-logs-api';
import type { ExecLog, LogsListParams } from '../types/execution-logs.types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'SUCCESS', label: 'SUCCESS' },
  { value: 'ERROR', label: 'ERROR' },
  { value: 'VALIDATION_ERROR', label: 'VALIDATION_ERROR' },
];

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
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR');
  } catch {
    return dateStr;
  }
}

const columnHelper = createColumnHelper<ExecLog>();

export default function ExecutionLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickPreset, setQuickPreset] = useState(1); // default: ultima hora
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'CREATED_AT', desc: true },
  ]);

  const buildParams = useCallback((): LogsListParams => {
    const params: LogsListParams = {
      page,
      limit: TABLE_PAGE_SIZE,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      sortBy: sorting[0]?.id || 'CREATED_AT',
    };

    if (search) params.search = search;
    if (endpointFilter) params.endpoint = endpointFilter;
    if (statusFilter) params.status = statusFilter;
    if (customDateFrom) params.dateFrom = customDateFrom.replace('T', ' ');
    if (customDateTo) params.dateTo = customDateTo.replace('T', ' ');

    return params;
  }, [page, search, endpointFilter, statusFilter, quickPreset, customDateFrom, customDateTo, sorting]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['execution-logs', buildParams()],
    queryFn: () => executionLogsApi.list(buildParams()),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('endpoint', {
        header: 'Endpoint',
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue()}</span>
        ),
        enableSorting: true,
        id: 'ENDPOINT',
      }),
      columnHelper.accessor('validationName', {
        header: 'Validação',
        cell: (info) => info.getValue() ?? '-',
        enableSorting: true,
        id: 'VALIDATION_NAME',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue();
          const colorMap: Record<string, string> = {
            SUCCESS: 'text-success',
            ERROR: 'text-danger',
            VALIDATION_ERROR: 'text-warning',
          };
          return (
            <span className={`font-medium ${colorMap[s] || 'text-muted-foreground'}`}>
              {s}
            </span>
          );
        },
        enableSorting: true,
        id: 'STATUS',
      }),
      columnHelper.accessor('executionTimeMs', {
        header: 'Tempo',
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground">
            {formatMs(info.getValue())}
          </span>
        ),
        enableSorting: true,
        id: 'EXECUTION_TIME_MS',
      }),
      columnHelper.accessor('createdAt', {
        header: 'Data',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
        ),
        enableSorting: true,
        id: 'CREATED_AT',
      }),
      columnHelper.accessor('result', {
        header: 'Resultado',
        cell: (info) => (
          <span className="max-w-xs truncate block text-sm text-muted-foreground" title={info.getValue()}>
            {info.getValue() ?? '-'}
          </span>
        ),
        enableSorting: false,
      }),
    ],
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
    setEndpointFilter('');
    setStatusFilter('');
    setQuickPreset(1);
    setCustomDateFrom('');
    setCustomDateTo('');
    setPage(1);
  };

  const hasFilters = search || endpointFilter || statusFilter || customDateFrom;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Logs de Execução"
        description="Registros de execução das validações e integrações"
      />

      {/* Filtros */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Linha 1: Busca + Status + Endpoint */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar em endpoint, validação, resultado..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="w-40">
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-60">
              <Input
                placeholder="Endpoint específico..."
                value={endpointFilter}
                onChange={(e) => { setEndpointFilter(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Linha 2: Período */}
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

          {/* Botão limpar filtros */}
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
        emptyMessage="Nenhum log encontrado no período selecionado."
      />
    </div>
  );
}
