import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locksApi } from '../services/locks-api';

export function useDisableLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      locksApi.disable(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks'] });
    },
  });
}
