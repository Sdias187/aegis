import { X, FileText, Tag, ListTree } from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { JsonViewer } from '@/components/shared';
import { useRecord } from '../hooks/use-record';

interface RecordDetailsDrawerProps {
  recordId: string | null;
  onClose: () => void;
}

export function RecordDetailsDrawer({ recordId, onClose }: RecordDetailsDrawerProps) {
  const { data: record, isLoading } = useRecord(recordId ?? '');
  if (!recordId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg animate-slideInRight border-l border-border bg-surface shadow-xl" role="dialog" aria-modal="true" aria-label="Detalhes da ficha">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{isLoading ? 'Carregando...' : `Ficha #${recordId}`}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        <div className="overflow-y-auto p-6" style={{ height: 'calc(100vh - 64px)' }}>
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i}><Skeleton className="mb-1 h-3 w-20" /><Skeleton className="h-8 w-full" /></div>))}</div>
          ) : record ? (
            <div className="space-y-6">
              <Field icon={Tag} label="Atendimento" value={record.atendimentoPara} />
              <Field icon={FileText} label="Serviço" value={record.servico} />
              <Field icon={FileText} label="Oferta Serviço" value={record.ofertaServico ?? '---'} />
              <Field icon={ListTree} label="Categoria" value={record.categoria ?? '---'} />
              <Field icon={ListTree} label="Subcategoria" value={record.subcategoria ?? '---'} />
              <Field icon={FileText} label="Detalhe da Falha" value={record.detalheFalha ?? '---'} />
              <div><p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dados Completos</p><JsonViewer data={record} /></div>
            </div>
          ) : (<p className="text-sm text-muted-foreground">Registro não encontrado.</p>)}
        </div>
      </div>
    </>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"><Icon className="size-3" />{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
