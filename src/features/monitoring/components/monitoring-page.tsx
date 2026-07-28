import { PageHeader } from '@/components/shared';

export default function MonitoringPage() {
  return (
    <div>
      <PageHeader
        title="Monitoramento"
        description="Logs de monitoramento do sistema"
      />
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-center text-muted-foreground py-8">
          Monitoramento será implementado na Fase 3
        </p>
      </div>
    </div>
  );
}
