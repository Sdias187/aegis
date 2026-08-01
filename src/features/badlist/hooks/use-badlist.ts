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

export function useFichasForSelect() {
  return useQuery({
    queryKey: ['fichas-select'],
    queryFn: () => badlistApi.listFichas(),
    staleTime: 60 * 1000,
  });
}
