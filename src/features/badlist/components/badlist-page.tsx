import { useCallback, useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { createColumnHelper, type SortingState, type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/shared';
import { DataTable } from '@/components/data-table';
import { TABLE_PAGE_SIZE } from '@/utils';
import { useBadlist } from '../hooks/use-badlist';
import { useDeleteBadlist } from '../hooks/use-badlist-mutations';
import { BadlistFilters } from './badlist-filters';
import { BadlistFormDialog } from './badlist-form-dialog';
import { BadlistDeleteDialog } from './badlist-delete-dialog';
import type { BadlistEntry } from '../types/badlist.types';

const columnHelper = createColumnHelper<BadlistEntry>();

export default function BadlistPage() {
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [atendimentoPara, setAtendimentoPara] = useState('');
  const [servico, setServico] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<BadlistEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit: TABLE_PAGE_SIZE,
      search: search || undefined,
      atendimentoPara: atendimentoPara || undefined,
      servico: servico || undefined,
      active: activeFilter || undefined,
      sortBy: sorting[0]?.id,
      sortOrder: (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc',
    }),
    [page, search, atendimentoPara, servico, activeFilter, sorting],
  );

  const { data, isLoading, isError, refetch } = useBadlist(queryParams);
  const deleteMutation = useDeleteBadlist();

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('servico', {
          header: 'Serviço',
          enableSorting: true,
          cell: (info) => <span className="font-medium text-foreground">{info.getValue() ?? '---'}</span>,
        }),
        columnHelper.accessor('atendimentoPara', {
          header: 'Atendimento',
          enableSorting: true,
          cell: (info) => <span className="text-foreground">{info.getValue() ?? '---'}</span>,
        }),
        columnHelper.accessor('ofertaServico', {
          header: 'Oferta',
          enableSorting: true,
          cell: (info) => <span className="text-muted-foreground text-sm">{info.getValue() ?? '---'}</span>,
        }),
        columnHelper.accessor('detalheFalha', {
          header: 'Detalhe Falha',
          enableSorting: true,
          cell: (info) => (
            <span className="text-muted-foreground text-sm truncate block max-w-[200px]" title={info.getValue()}>
              {info.getValue() ?? '---'}
            </span>
          ),
        }),
        columnHelper.accessor('words', {
          header: 'Palavras',
          enableSorting: true,
          cell: (info) => (
            <span className="font-mono text-xs text-foreground truncate block max-w-[250px]" title={info.getValue()}>
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor('active', {
          header: 'Ativo',
          enableSorting: true,
          size: 80,
          cell: (info) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              info.getValue() === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {info.getValue() === 1 ? 'Sim' : 'Não'}
            </span>
          ),
        }),
        columnHelper.accessor('id', {
          id: 'actions',
          header: '',
          enableSorting: false,
          size: 100,
          cell: (info) => (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditEntry(info.row.original);
                  setFormDialogOpen(true);
                }}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(info.row.original.id);
                  setDeleteName(info.row.original.servico || info.row.original.id);
                }}
              >
                Excluir
              </Button>
            </div>
          ),
        }),
      ] as ColumnDef<BadlistEntry>[],
    [],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
          setDeleteName(null);
        },
      });
    }
  }, [deleteId, deleteMutation]);

  const resetPageAndSet = useCallback(
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    },
    [],
  );

  return (
    <div>
      <PageHeader
        title="Badlist"
        description="Gerenciamento de palavras bloqueadas por catálogo"
        actions={
          <div className="flex gap-2">
            <Button disabled variant="outline">
              <Upload className="size-4" />
              Importação Massiva
            </Button>
            <Button onClick={() => { setEditEntry(null); setFormDialogOpen(true); }}>
              <Plus className="size-4" />
              Nova Badlist
            </Button>
          </div>
        }
      />
      <div className="space-y-4">
        <BadlistFilters
          search={search}
          onSearchChange={resetPageAndSet(setSearch)}
          atendimentoPara={atendimentoPara}
          onAtendimentoParaChange={resetPageAndSet(setAtendimentoPara)}
          servico={servico}
          onServicoChange={resetPageAndSet(setServico)}
          active={activeFilter}
          onActiveChange={resetPageAndSet(setActiveFilter)}
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
          emptyMessage="Nenhuma badlist encontrada"
        />
      </div>
      <BadlistFormDialog
        open={formDialogOpen}
        editEntry={editEntry}
        onClose={() => { setFormDialogOpen(false); setEditEntry(null); }}
      />
      <BadlistDeleteDialog
        id={deleteId}
        name={deleteName}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => { setDeleteId(null); setDeleteName(null); }}
      />
    </div>
  );
}
