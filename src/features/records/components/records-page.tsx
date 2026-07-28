import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { createColumnHelper, type SortingState, type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/shared';
import { DataTable } from '@/components/data-table';
import { TABLE_PAGE_SIZE } from '@/utils';
import { useRecords } from '../hooks/use-records';
import { useDeleteRecord } from '../hooks/use-record-mutations';
import { RecordsFilters } from './records-filters';
import { RecordDetailsDrawer } from './record-details-drawer';
import { RecordDeleteDialog } from './record-delete-dialog';
import type { Ficha } from '../types/records.types';

const columnHelper = createColumnHelper<Ficha>();

export default function RecordsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [search, setSearch] = useState('');
  const [atendimentoPara, setAtendimentoPara] = useState('');
  const [servico, setServico] = useState('');
  const [ofertaServico, setOfertaServico] = useState('');
  const [detalheFalha, setDetalheFalha] = useState('');

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit: TABLE_PAGE_SIZE,
      search: search || undefined,
      atendimentoPara: atendimentoPara || undefined,
      servico: servico || undefined,
      ofertaServico: ofertaServico || undefined,
      detalheFalha: detalheFalha || undefined,
      sortBy: sorting[0]?.id,
      sortOrder: (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc',
    }),
    [page, search, atendimentoPara, servico, ofertaServico, detalheFalha, sorting],
  );

  const { data, isLoading, isError, refetch } = useRecords(queryParams);
  const deleteMutation = useDeleteRecord();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('atendimentoPara', {
          header: 'Atendimento',
          enableSorting: true,
          cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
        }),
        columnHelper.accessor('servico', {
          header: 'Serviço',
          enableSorting: true,
          cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
        }),
        columnHelper.accessor('ofertaServico', {
          header: 'Oferta',
          enableSorting: true,
          cell: (info) => <span className="text-muted-foreground">{info.getValue() ?? '---'}</span>,
        }),
        columnHelper.accessor('detalheFalha', {
          header: 'Detalhe Falha',
          enableSorting: true,
          cell: (info) => (
            <span className="text-muted-foreground text-sm truncate block max-w-xs">{info.getValue() ?? '---'}</span>
          ),
        }),
        columnHelper.accessor('id', {
          id: 'actions',
          header: '',
          enableSorting: false,
          cell: (info) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/records/${info.getValue()}/edit`); }}>
                Editar
              </Button>
              <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); setDeleteRecordId(info.row.original.id); }}>
                Excluir
              </Button>
            </div>
          ),
        }),
      ] as ColumnDef<Ficha>[],
    [navigate],
  );

  const handleRowClick = useCallback((row: Ficha) => setSelectedRecordId(row.id), []);
  const handleDeleteConfirm = useCallback(() => {
    if (deleteRecordId) deleteMutation.mutate(deleteRecordId, { onSuccess: () => setDeleteRecordId(null) });
  }, [deleteRecordId, deleteMutation]);

  const resetPageAndSet = useCallback((setter: (v: string) => void) => (value: string) => { setter(value); setPage(1); }, []);

  return (
    <div>
      <PageHeader
        title="Fichas"
        description="Registros da tabela AEGIS_FICHAS"
        actions={<Button onClick={() => navigate('/records/new')}><Plus className="size-4" />Nova Ficha</Button>}
      />
      <div className="space-y-4">
        <RecordsFilters
          search={search}
          onSearchChange={resetPageAndSet(setSearch)}
          atendimentoPara={atendimentoPara}
          onAtendimentoParaChange={resetPageAndSet(setAtendimentoPara)}
          servico={servico}
          onServicoChange={resetPageAndSet(setServico)}
          ofertaServico={ofertaServico}
          onOfertaServicoChange={resetPageAndSet(setOfertaServico)}
          detalheFalha={detalheFalha}
          onDetalheFalhaChange={resetPageAndSet(setDetalheFalha)}
        />
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          totalCount={data?.pagination?.total ?? 0}
          page={page}
          pageSize={TABLE_PAGE_SIZE}
          onPageChange={setPage}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onRowClick={handleRowClick}
          emptyMessage="Nenhuma ficha encontrada"
        />
      </div>
      <RecordDetailsDrawer recordId={selectedRecordId} onClose={() => setSelectedRecordId(null)} />
      <RecordDeleteDialog recordId={deleteRecordId} recordName={deleteRecordId ? `#${deleteRecordId}` : null} isLoading={deleteMutation.isPending} onConfirm={handleDeleteConfirm} onClose={() => setDeleteRecordId(null)} />
    </div>
  );
}
