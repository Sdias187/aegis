import { useMutation, useQueryClient } from '@tanstack/react-query';
import { badlistApi } from '../services/badlist-api';
import type { BadlistCreatePayload, BadlistUpdatePayload } from '../types/badlist.types';

export function useCreateBadlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BadlistCreatePayload) => badlistApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badlist'] });
    },
  });
}

export function useUpdateBadlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BadlistUpdatePayload }) =>
      badlistApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badlist'] });
    },
  });
}

export function useDeleteBadlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => badlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badlist'] });
    },
  });
}
