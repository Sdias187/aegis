import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { locksApi } from '../services/locks-api';
import type { TravaListParams } from '../types/locks.types';

export function useLocks(params: TravaListParams) {
  return useQuery({
    queryKey: ['locks', params],
    queryFn: () => locksApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}

export function useLock(id: string) {
  return useQuery({
    queryKey: ['lock', id],
    queryFn: () => locksApi.getById(id),
    enabled: !!id,
  });
}
