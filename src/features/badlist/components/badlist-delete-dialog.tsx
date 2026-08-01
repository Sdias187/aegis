import { Dialog, Button } from '@/components/ui';

interface BadlistDeleteDialogProps {
  id: string | null;
  name: string | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function BadlistDeleteDialog({
  id,
  name,
  isLoading,
  onConfirm,
  onClose,
}: BadlistDeleteDialogProps) {
  if (!id) return null;

  return (
    <Dialog open={!!id} onClose={onClose} title="Excluir Badlist">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir a badlist do catálogo{' '}
          <span className="font-medium text-foreground">{name}</span>?
        </p>
        <p className="text-xs text-danger">
          Esta ação não pode ser desfeita. As palavras serão removidas permanentemente.
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
