import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Erro ao carregar dados',
  description = 'Ocorreu um erro inesperado. Tente novamente.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 text-danger">
        <AlertTriangle className="size-12" />
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
