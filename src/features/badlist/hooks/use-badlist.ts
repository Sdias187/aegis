import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { badlistApi } from '../services/badlist-api';
import type { BadlistListParams } from '../types/badlist.types';

export function useBadlist(params: BadlistListParams) {
  return useQuery({
    queryKey: ['badlist', params],
    queryFn: () => badlistApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useBadlistDetail(id: string | null) {
  return useQuery({
    queryKey: ['badlist', id],
    queryFn: () => badlistApi.getById(id!),
    enabled: !!id,
  });
}

export function useFichasForSelect(params: {
  page: number;
  limit: number;
  search?: string;
  atendimentoPara?: string;
}) {
  return useQuery({
    queryKey: ['fichas-select', params],
    queryFn: () => badlistApi.listFichas(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
