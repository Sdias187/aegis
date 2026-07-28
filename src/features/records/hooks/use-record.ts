import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '../services/records-api';

export function useRecord(id: string) {
  return useQuery({
    queryKey: ['record', id],
    queryFn: () => recordsApi.getById(id),
    enabled: !!id,
  });
}
