import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingState, ErrorState } from '@/components/shared';
import { Card } from '@/components/ui';
import { useRecord } from '../hooks/use-record';
import { useUpdateRecord } from '../hooks/use-record-mutations';
import { RecordForm } from './record-form';
import { useToast } from '@/providers/toast-provider';

export default function RecordEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: record, isLoading, isError } = useRecord(id ?? '');
  const updateMutation = useUpdateRecord();

  const handleSubmit = (data: { atendimentoPara: string; servico: string; ofertaServico?: string; detalheFalha?: string; categoria?: string; subcategoria?: string }) => {
    if (!id) return;
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => { addToast({ type: 'success', title: 'Ficha atualizada com sucesso' }); navigate('/records'); },
        onError: () => { addToast({ type: 'error', title: 'Erro ao atualizar ficha' }); },
      },
    );
  };

  if (isLoading) return <LoadingState message="Carregando ficha..." />;
  if (isError || !record) return <ErrorState title="Ficha não encontrada" description="Não foi possível carregar os dados da ficha." />;

  return (
    <div>
      <PageHeader title="Editar Ficha" description={`Editando: ${record.atendimentoPara}`} />
      <Card className="max-w-2xl p-6">
        <RecordForm
          defaultValues={{
            atendimentoPara: record.atendimentoPara as 'b2c' | 'b2b' | 'interno',
            servico: record.servico,
            ofertaServico: record.ofertaServico,
            detalheFalha: record.detalheFalha,
            categoria: record.categoria,
            subcategoria: record.subcategoria,
          }}
          onSubmit={handleSubmit} onCancel={() => navigate('/records')} isLoading={updateMutation.isPending} mode="edit"
        />
      </Card>
    </div>
  );
}
