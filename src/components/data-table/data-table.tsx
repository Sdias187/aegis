import { useRef } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/shared';
import { cn } from '@/utils';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSizeOptions?: number[];
  estimatedRowHeight?: number;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSortingChange,
  isLoading,
  isError,
  onRetry,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  pageSizeOptions = [10, 20, 50, 100],
  estimatedRowHeight = 48,
}: DataTableProps<T>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: { pageIndex: page - 1, pageSize },
    },
    onSortingChange: onSortingChange,
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const totalPages = Math.ceil(totalCount / pageSize);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });

  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar dados"
        description="Não foi possível carregar os registros. Verifique a conexão e tente novamente."
        onRetry={onRetry}
      />
    );
  }

  // Empty state
  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div>
      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div
          ref={tableContainerRef}
          className="overflow-auto max-h-[calc(100vh-280px)]"
        >
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 z-10 bg-surface">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                        'border-b border-border',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                      )}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      aria-sort={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="inline-flex">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="size-3.5" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="size-3.5" />
                            ) : (
                              <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      'hover:bg-surface-elevated/50',
                      onRowClick && 'cursor-pointer',
                    )}
                    style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start - virtualRow.index * virtualRow.size}px)` }}
                    onClick={() => onRowClick?.(row.original)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && onRowClick) {
                        onRowClick(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 px-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages}
          </span>
          <span className="text-muted-foreground/50">—</span>
          <span>{totalCount} registros</span>

          {onPageSizeChange && (
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="ml-2 rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
              aria-label="Registros por página"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / pág
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {getPageNumbers(page, totalPages).map((pageNum, i) =>
            pageNum === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                className="min-w-9"
              >
                {pageNum}
              </Button>
            ),
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
}
