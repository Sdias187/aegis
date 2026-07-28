import { PageHeader } from '@/components/shared';

export default function ExecutionLogsPage() {
  return (
    <div>
      <PageHeader
        title="Logs de Execução"
        description="Registros de execução das travas"
      />
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-center text-muted-foreground py-8">
          Logs de execução serão implementados na Fase 3
        </p>
      </div>
    </div>
  );
}
