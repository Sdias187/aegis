import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select } from '@/components/ui';

const ATENDIMENTO_OPTIONS = [
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
  { value: 'interno', label: 'Interno' },
];

const fichaSchema = z.object({
  atendimentoPara: z.enum(['b2c', 'b2b', 'interno'], { required_error: 'Atendimento é obrigatório' }),
  servico: z.string().min(1, 'Serviço é obrigatório').max(100, 'Máximo 100 caracteres'),
  ofertaServico: z.string().max(100).optional(),
  detalheFalha: z.string().max(200).optional(),
  categoria: z.string().max(100).optional(),
  subcategoria: z.string().max(100).optional(),
});

type FichaFormValues = z.infer<typeof fichaSchema>;

interface RecordFormProps {
  defaultValues?: Partial<FichaFormValues>;
  onSubmit: (data: FichaFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function RecordForm({ defaultValues, onSubmit, onCancel, isLoading, mode }: RecordFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FichaFormValues>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      atendimentoPara: undefined,
      servico: '',
      ofertaServico: '',
      detalheFalha: '',
      categoria: '',
      subcategoria: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Atendimento */}
      <div>
        <label htmlFor="atendimentoPara" className="mb-1.5 block text-sm font-medium text-foreground">
          Atendimento <span className="text-danger">*</span>
        </label>
        <Select
          id="atendimentoPara"
          {...register('atendimentoPara')}
          error={errors.atendimentoPara?.message}
          options={ATENDIMENTO_OPTIONS}
          placeholder="Selecione o tipo de atendimento"
        />
      </div>

      {/* Serviço + Oferta Serviço */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="servico" className="mb-1.5 block text-sm font-medium text-foreground">
            Serviço <span className="text-danger">*</span>
          </label>
          <Input id="servico" {...register('servico')} error={errors.servico?.message} placeholder="Ex: Suporte Técnico" />
        </div>
        <div>
          <label htmlFor="ofertaServico" className="mb-1.5 block text-sm font-medium text-foreground">Oferta Serviço</label>
          <Input id="ofertaServico" {...register('ofertaServico')} placeholder="Ex: Premium" />
        </div>
      </div>

      {/* Detalhe da Falha */}
      <div>
        <label htmlFor="detalheFalha" className="mb-1.5 block text-sm font-medium text-foreground">Detalhe da Falha</label>
        <Input id="detalheFalha" {...register('detalheFalha')} placeholder="Ex: Falha na autenticação" />
      </div>

      {/* Categoria + Subcategoria */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium text-foreground">
            Categoria <span className="text-xs text-muted-foreground">(opcional)</span>
          </label>
          <Input id="categoria" {...register('categoria')} placeholder="Ex: Segurança" />
        </div>
        <div>
          <label htmlFor="subcategoria" className="mb-1.5 block text-sm font-medium text-foreground">
            Subcategoria <span className="text-xs text-muted-foreground">(opcional)</span>
          </label>
          <Input id="subcategoria" {...register('subcategoria')} placeholder="Ex: Autenticação" />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={() => navigate('/import/massivo')}>
          Importação Massiva
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            {mode === 'create' ? 'Criar Ficha' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </form>
  );
}
