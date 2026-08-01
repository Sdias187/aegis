import { useState, useCallback, useMemo } from 'react';
import { createColumnHelper, type SortingState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Card, Input, Select } from '@/components/ui';
import { DataTable } from '@/components/data-table';
import { siebelApi } from '../services/siebel-api';
import type { SiebelService, SiebelListParams } from '../types/siebel.types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'ERRO', label: 'Erro' },
  { value: 'INATIVO', label: 'Inativo' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'Consulta', label: 'Consulta' },
  { value: 'CRUD', label: 'CRUD' },
  { value: 'Relatório', label: 'Relatório' },
];

const TABLE_PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('pt-BR');
  } catch {
    return dateStr;
  }
}

const columnHelper = createColumnHelper<SiebelService>();

export default function SiebelPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'serviceName', desc: false }]);

  const buildParams = useCallback((): SiebelListParams => {
    const params: SiebelListParams = {
      page,
      limit: TABLE_PAGE_SIZE,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      sortBy: sorting[0]?.id || 'serviceName',
    };

    if (search) params.search = search;
    if (status) params.status = status;
    if (serviceType) params.serviceType = serviceType;

    return params;
  }, [page, search, status, serviceType, sorting]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['siebel-services', buildParams()],
    queryFn: () => siebelApi.list(buildParams()),
  });

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('serviceName', {
          header: 'Serviço',
          cell: (info) => <span className="font-medium">{info.getValue()}</span>,
          enableSorting: true,
        }),
        columnHelper.accessor('serviceType', {
          header: 'Tipo',
          cell: (info) => {
            const value = info.getValue();
            return (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  value === 'CRUD'
                    ? 'bg-blue-100 text-blue-800'
                    : value === 'Relatório'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value}
              </span>
            );
          },
          enableSorting: true,
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          cell: (info) => {
            const value = info.getValue();
            return (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  value === 'ATIVO'
                    ? 'bg-green-100 text-green-800'
                    : value === 'ERRO'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value}
              </span>
            );
          },
          enableSorting: true,
        }),
        columnHelper.accessor('endpoint', {
          header: 'Endpoint',
          cell: (info) => (
            <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
          ),
          enableSorting: false,
        }),
        columnHelper.accessor('lastSync', {
          header: 'Último Sync',
          cell: (info) => (
            <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
          ),
          enableSorting: true,
        }),
        columnHelper.accessor('errorMessage', {
          header: 'Erro',
          cell: (info) => {
            const value = info.getValue();
            return value ? (
              <span className="text-xs text-danger max-w-[200px] truncate block" title={value}>
                {value}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            );
          },
          enableSorting: false,
        }),
      ] as any,
    [],
  );

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setServiceType('');
    setPage(1);
  };

  const hasFilters = search || status || serviceType;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Serviços - Siebel"
        description="Gerenciamento e monitoramento de serviços Siebel"
      />

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, tipo, endpoint..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="w-[140px]">
              <Select
                options={TYPE_OPTIONS}
                value={serviceType}
                onChange={(e) => {
                  setServiceType(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-[130px]">
              <Select
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
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
        emptyMessage="Nenhum serviço Siebel encontrado."
      />
    </div>
  );
}
