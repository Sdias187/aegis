import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared';
import { Card } from '@/components/ui';
import { useCreateRecord } from '../hooks/use-record-mutations';
import { RecordForm } from './record-form';
import { useToast } from '@/providers/toast-provider';

export default function RecordCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createMutation = useCreateRecord();

  const handleSubmit = (data: { atendimentoPara: string; servico: string; ofertaServico?: string; detalheFalha?: string; categoria?: string; subcategoria?: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => { addToast({ type: 'success', title: 'Ficha criada com sucesso' }); navigate('/records'); },
      onError: () => { addToast({ type: 'error', title: 'Erro ao criar ficha' }); },
    });
  };

  return (
    <div>
      <PageHeader title="Nova Ficha" description="Preencha os dados para criar um novo registro em AEGIS_FICHAS" />
      <Card className="max-w-2xl p-6">
        <RecordForm onSubmit={handleSubmit} onCancel={() => navigate('/records')} isLoading={createMutation.isPending} mode="create" />
      </Card>
    </div>
  );
}
