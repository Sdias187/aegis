import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';

const fichaSchema = z.object({
  atendimentoPara: z.string().min(1, 'Atendimento é obrigatório').max(100, 'Máximo 100 caracteres'),
  servico: z.string().min(1, 'Serviço é obrigatório').max(100, 'Máximo 100 caracteres'),
  ofertaServico: z.string().max(100).optional(),
  detalheFalha: z.string().max(1000).optional(),
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
  const { register, handleSubmit, formState: { errors } } = useForm<FichaFormValues>({
    resolver: zodResolver(fichaSchema),
    defaultValues: { atendimentoPara: '', servico: '', ofertaServico: '', detalheFalha: '', categoria: '', subcategoria: '', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="atendimentoPara" className="mb-1.5 block text-sm font-medium text-foreground">Atendimento <span className="text-danger">*</span></label>
        <Input id="atendimentoPara" {...register('atendimentoPara')} error={errors.atendimentoPara?.message} placeholder="Ex: João Silva" />
      </div>
      <div>
        <label htmlFor="servico" className="mb-1.5 block text-sm font-medium text-foreground">Serviço <span className="text-danger">*</span></label>
        <Input id="servico" {...register('servico')} error={errors.servico?.message} placeholder="Ex: Suporte Técnico" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ofertaServico" className="mb-1.5 block text-sm font-medium text-foreground">Oferta Serviço</label>
          <Input id="ofertaServico" {...register('ofertaServico')} placeholder="Ex: Premium" />
        </div>
        <div>
          <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium text-foreground">Categoria</label>
          <Input id="categoria" {...register('categoria')} placeholder="Ex: Segurança" />
        </div>
      </div>
      <div>
        <label htmlFor="subcategoria" className="mb-1.5 block text-sm font-medium text-foreground">Subcategoria</label>
        <Input id="subcategoria" {...register('subcategoria')} placeholder="Ex: Autenticação" />
      </div>
      <div>
        <label htmlFor="detalheFalha" className="mb-1.5 block text-sm font-medium text-foreground">Detalhe da Falha</label>
        <textarea id="detalheFalha" {...register('detalheFalha')} rows={4}
          className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Descrição detalhada da falha..." />
        {errors.detalheFalha && <p className="mt-1 text-xs text-danger" role="alert">{errors.detalheFalha.message}</p>}
      </div>
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" loading={isLoading}>{mode === 'create' ? 'Criar Ficha' : 'Salvar Alterações'}</Button>
      </div>
    </form>
  );
}
