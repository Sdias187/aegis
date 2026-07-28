import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { recordsApi } from '../services/records-api';
import type { FichaListParams } from '../types/records.types';

export function useRecords(params: FichaListParams) {
  return useQuery({
    queryKey: ['records', params],
    queryFn: () =>
      recordsApi.list({ ...params }),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });
}
