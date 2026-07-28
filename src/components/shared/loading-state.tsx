import { cn } from '@/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Carregando...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
