import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/shares';

export function useSharedWithMe() {
  return useQuery({ queryKey: ['shares', 'shared-with-me'], queryFn: api.fetchSharedWithMe });
}

export function useMyShares() {
  return useQuery({ queryKey: ['shares', 'my-shares'], queryFn: api.fetchMyShares });
}

export function useCreateShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, permission }) => api.createShare(email, permission),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shares'] }),
  });
}

export function useRevokeShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.revokeShare(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shares'] }),
  });
}
