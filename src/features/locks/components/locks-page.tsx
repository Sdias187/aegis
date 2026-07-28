import { useCallback, useMemo, useState } from 'react';
import { createColumnHelper, type SortingState, type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui';
import { PageHeader } from '@/components/shared';
import { DataTable } from '@/components/data-table';
import { TABLE_PAGE_SIZE } from '@/utils';
import { useLocks } from '../hooks/use-locks';
import { useDisableLock } from '../hooks/use-lock-mutations';
import { LocksFilters } from './locks-filters';
import { LockDetailsModal } from './lock-details-modal';
import { LockDisableDialog } from './lock-disable-dialog';
import type { Trava } from '../types/locks.types';

const columnHelper = createColumnHelper<Trava>();

export default function LocksPage() {
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [nome, setNome] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [selectedLockId, setSelectedLockId] = useState<string | null>(null);
  const [disableLockId, setDisableLockId] = useState<string | null>(null);

  const queryParams = useMemo(() => ({
    page, limit: TABLE_PAGE_SIZE, search: search || undefined, nome: nome || undefined, endpoint: endpoint || undefined,
    sortBy: sorting[0]?.id, sortOrder: (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc',
  }), [page, search, nome, endpoint, sorting]);

  const { data, isLoading, isError, refetch } = useLocks(queryParams);
  const disableMutation = useDisableLock();

  const columns = useMemo(() =>
    [
      columnHelper.accessor('nome', { header: 'Nome', enableSorting: true, cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span> }),
      columnHelper.accessor('endpoint', { header: 'Endpoint', enableSorting: true, cell: (info) => <span className="text-xs font-mono text-muted-foreground truncate block max-w-xs">{info.getValue()}</span> }),
      columnHelper.accessor('metodo', { header: 'Método', enableSorting: true, cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span> }),
      columnHelper.accessor('ativo', { header: 'Status', enableSorting: true, cell: (info) => <Badge variant={info.getValue() ? 'warning' : 'neutral'}>{info.getValue() ? 'Ativa' : 'Desativada'}</Badge> }),
      columnHelper.accessor('id', { id: 'actions', header: '', enableSorting: false, cell: (info) =>
        info.row.original.ativo ? (
          <button className="text-xs font-medium text-danger hover:underline" onClick={(e) => { e.stopPropagation(); setDisableLockId(info.row.original.id); }}>Desativar</button>
        ) : null
      }),
    ] as ColumnDef<Trava>[],
  []);

  const handleRowClick = useCallback((row: Trava) => setSelectedLockId(row.id), []);
  const handleDisableConfirm = useCallback((reason?: string) => {
    if (disableLockId) disableMutation.mutate({ id: disableLockId, reason }, { onSuccess: () => setDisableLockId(null) });
  }, [disableLockId, disableMutation]);

  const resetP = useCallback((setter: (v: string) => void) => (value: string) => { setter(value); setPage(1); }, []);

  return (
    <div>
      <PageHeader title="Travas" description="Registros da tabela AEGIS_TRAVAS — NOME, DESCRIÇÃO, ENDPOINT, MÉTODO" />
      <div className="space-y-4">
        <LocksFilters search={search} onSearchChange={resetP(setSearch)} nome={nome} onNomeChange={resetP(setNome)} endpoint={endpoint} onEndpointChange={resetP(setEndpoint)} />
        <DataTable data={data?.data ?? []} columns={columns} totalCount={data?.pagination?.total ?? 0} page={page} pageSize={TABLE_PAGE_SIZE}
          onPageChange={setPage} sorting={sorting} onSortingChange={setSorting} isLoading={isLoading} isError={isError} onRetry={() => refetch()} onRowClick={handleRowClick}
          emptyMessage="Nenhuma trava encontrada" />
      </div>
      <LockDetailsModal lockId={selectedLockId} onClose={() => setSelectedLockId(null)} />
      <LockDisableDialog lockId={disableLockId} isLoading={disableMutation.isPending} onConfirm={handleDisableConfirm} onClose={() => setDisableLockId(null)} />
    </div>
  );
}
