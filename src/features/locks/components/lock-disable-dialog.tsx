import { useState } from 'react';
import { Dialog, Button } from '@/components/ui';

interface LockDisableDialogProps {
  lockId: string | null;
  isLoading: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export function LockDisableDialog({
  lockId,
  isLoading,
  onConfirm,
  onClose,
}: LockDisableDialogProps) {
  const [reason, setReason] = useState('');

  if (!lockId) return null;

  return (
    <Dialog open={!!lockId} onClose={onClose} title="Desativar Trava">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja desativar a trava <span className="font-medium text-foreground">#{lockId}</span>?
        </p>

        <div>
          <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-foreground">
            Motivo da desativação <span className="text-muted-foreground">(opcional)</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Explique o motivo da desativação..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(reason || undefined)}
            loading={isLoading}
          >
            Desativar Trava
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
