import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/todos';

const TODOS_KEY = ['todos'];

export function useTodosQuery(filters, ownerId) {
  return useQuery({
    queryKey: [...TODOS_KEY, ownerId ?? 'self', filters],
    queryFn: () => api.fetchTodos(filters, ownerId),
    // Sync across devices/tabs without needing websockets: refetch whenever
    // the user comes back to the tab or reconnects, on top of react-query's
    // normal cache behavior.
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    keepPreviousData: true,
  });
}

/**
 * Cheap counts for the stats bar: `findAll` runs countDocuments()
 * regardless of `limit`, so limit=1 gets an accurate total while
 * transferring almost no todo data.
 */
export function useTodoStats(ownerId) {
  const pending = useQuery({
    queryKey: [...TODOS_KEY, ownerId ?? 'self', 'stats', 'pending'],
    queryFn: () => api.fetchTodos({ completed: 'false', limit: 1 }, ownerId),
  });
  const completed = useQuery({
    queryKey: [...TODOS_KEY, ownerId ?? 'self', 'stats', 'completed'],
    queryFn: () => api.fetchTodos({ completed: 'true', limit: 1 }, ownerId),
  });

  return {
    pending: pending.data?.total ?? null,
    completed: completed.data?.total ?? null,
    isLoading: pending.isLoading || completed.isLoading,
  };
}

function useInvalidateTodos(ownerId) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [...TODOS_KEY, ownerId ?? 'self'] });
}

export function useCreateTodo(ownerId) {
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: (payload) => api.createTodo(payload, ownerId),
    onSuccess: invalidate,
  });
}

export function useUpdateTodo(ownerId) {
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateTodo(id, payload, ownerId),
    onSuccess: invalidate,
  });
}

export function useReorderTodo(ownerId) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: ({ id, prevId, nextId }) => api.reorderTodo(id, { prevId, nextId }, ownerId),
    // Optimistic: drag-and-drop feels wrong if the card snaps back while
    // waiting on the network, so reorder the cached list immediately and
    // let the follow-up invalidate reconcile with the server's real order.
    onMutate: async ({ id, prevId, nextId }) => {
      await queryClient.cancelQueries({ queryKey: [...TODOS_KEY, ownerId ?? 'self'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: [...TODOS_KEY, ownerId ?? 'self'] });

      previousQueries.forEach(([key, data]) => {
        if (!data?.items) return;
        const items = [...data.items];
        const fromIndex = items.findIndex((t) => t._id === id);
        if (fromIndex === -1) return;
        const [moved] = items.splice(fromIndex, 1);
        const toIndex = nextId
          ? items.findIndex((t) => t._id === nextId)
          : prevId
            ? items.findIndex((t) => t._id === prevId) + 1
            : items.length;
        items.splice(toIndex === -1 ? items.length : toIndex, 0, moved);
        queryClient.setQueryData(key, { ...data, items });
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: invalidate,
  });
}

export function useDeleteTodo(ownerId) {
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: (id) => api.deleteTodo(id, ownerId),
    onSuccess: invalidate,
  });
}

export function useAddSubtask(ownerId) {
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: ({ todoId, title }) => api.addSubtask(todoId, title, ownerId),
    onSuccess: invalidate,
  });
}

export function useUpdateSubtask(ownerId) {
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: ({ todoId, subtaskId, payload }) => api.updateSubtask(todoId, subtaskId, payload, ownerId),
    onSuccess: invalidate,
  });
}

export function useDeleteSubtask(ownerId) {
  const invalidate = useInvalidateTodos(ownerId);
  return useMutation({
    mutationFn: ({ todoId, subtaskId }) => api.deleteSubtask(todoId, subtaskId, ownerId),
    onSuccess: invalidate,
  });
}
