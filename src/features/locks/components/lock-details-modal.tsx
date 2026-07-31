import { FileText, Globe, Terminal } from 'lucide-react';
import { Dialog, Badge, Skeleton } from '@/components/ui';
import { useLock } from '../hooks/use-locks';

interface LockDetailsModalProps {
  lockId: string | null;
  onClose: () => void;
}

export function LockDetailsModal({ lockId, onClose }: LockDetailsModalProps) {
  const { data: lock, isLoading } = useLock(lockId ?? '');

  return (
    <Dialog open={!!lockId} onClose={onClose} title="Detalhes da Trava">
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i}><Skeleton className="mb-1 h-3 w-20" /><Skeleton className="h-6 w-full" /></div>))}</div>
      ) : lock ? (
        <div className="space-y-4">
          <Badge variant={lock.ativo ? 'warning' : 'neutral'}>{lock.ativo ? 'Ativa' : 'Desativada'}</Badge>
          <Field icon={FileText} label="Nome" value={lock.nome} />
          <Field icon={FileText} label="Descrição" value={lock.descricao ?? '---'} />
          <Field icon={Globe} label="Endpoint" value={lock.endpoint} />
          <Field icon={Terminal} label="Método" value={lock.metodo} />
        </div>
      ) : (<p className="text-sm text-muted-foreground">Trava não encontrada.</p>)}
    </Dialog>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"><Icon className="size-3" />{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
