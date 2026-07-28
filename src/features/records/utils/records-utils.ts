import type { Ficha } from '../types/records.types';

/** Colunas da AEGIS_FICHAS para exibição na tabela e detalhes */
export const FICHA_COLUMNS: { key: keyof Ficha; label: string }[] = [
  { key: 'atendimentoPara', label: 'Atendimento' },
  { key: 'servico', label: 'Serviço' },
  { key: 'ofertaServico', label: 'Oferta Serviço' },
  { key: 'detalheFalha', label: 'Detalhe da Falha' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'subcategoria', label: 'Subcategoria' },
];
