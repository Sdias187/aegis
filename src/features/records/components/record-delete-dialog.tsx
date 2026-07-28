import { Dialog } from '@/components/ui';
import { Button } from '@/components/ui';

interface RecordDeleteDialogProps {
  recordId: string | null;
  recordName: string | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RecordDeleteDialog({
  recordId,
  recordName,
  isLoading,
  onConfirm,
  onClose,
}: RecordDeleteDialogProps) {
  if (!recordId) return null;

  return (
    <Dialog open={!!recordId} onClose={onClose} title="Excluir Ficha">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir a ficha{' '}
          <span className="font-medium text-foreground">{recordName}</span>?
        </p>
        <p className="text-xs text-danger">
          Esta ação não pode ser desfeita. Todos os dados associados serão removidos permanentemente.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isLoading}>
            Excluir Permanentemente
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
