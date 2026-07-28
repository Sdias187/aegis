import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { cn } from '@/utils';

interface JsonViewerProps {
  data: unknown;
  collapsed?: boolean;
  maxHeight?: string;
  className?: string;
}

export function JsonViewer({ data, collapsed = false, maxHeight = '400px', className }: JsonViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const formatted = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
  };

  return (
    <div className={cn('rounded-lg border border-border bg-background', className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
          JSON
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          title="Copiar"
        >
          <Copy className="size-3" />
          Copiar
        </button>
      </div>
      {!isCollapsed && (
        <pre
          className="overflow-auto p-3 font-mono text-xs leading-relaxed text-foreground"
          style={{ maxHeight }}
        >
          {formatted}
        </pre>
      )}
    </div>
  );
}
