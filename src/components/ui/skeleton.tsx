import { cn } from '@/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-surface via-surface-elevated to-surface bg-[length:200%_100%]',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circular' && 'h-10 w-10 rounded-full',
        variant === 'rectangular' && 'h-24 w-full rounded-lg',
        className,
      )}
      {...props}
    />
  );
}
