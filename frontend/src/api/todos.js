import { apiFetch } from './client';

function withOwner(params, ownerId) {
  const merged = { ...params };
  if (ownerId) merged.ownerId = ownerId;
  return merged;
}

export function fetchTodos(filters, ownerId) {
  const params = new URLSearchParams();
  Object.entries(withOwner(filters, ownerId) || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  });
  const query = params.toString();
  return apiFetch(`/todos${query ? `?${query}` : ''}`);
}

function ownerQuery(ownerId) {
  return ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : '';
}

export function createTodo(payload, ownerId) {
  return apiFetch(`/todos${ownerQuery(ownerId)}`, { method: 'POST', body: payload });
}

export function updateTodo(id, payload, ownerId) {
  return apiFetch(`/todos/${id}${ownerQuery(ownerId)}`, { method: 'PATCH', body: payload });
}

export function reorderTodo(id, { prevId, nextId }, ownerId) {
  return apiFetch(`/todos/${id}/reorder${ownerQuery(ownerId)}`, { method: 'PATCH', body: { prevId, nextId } });
}

export function deleteTodo(id, ownerId) {
  return apiFetch(`/todos/${id}${ownerQuery(ownerId)}`, { method: 'DELETE' });
}

export function addSubtask(todoId, title, ownerId) {
  return apiFetch(`/todos/${todoId}/subtasks${ownerQuery(ownerId)}`, { method: 'POST', body: { title } });
}

export function updateSubtask(todoId, subtaskId, payload, ownerId) {
  return apiFetch(`/todos/${todoId}/subtasks/${subtaskId}${ownerQuery(ownerId)}`, { method: 'PATCH', body: payload });
}

export function deleteSubtask(todoId, subtaskId, ownerId) {
  return apiFetch(`/todos/${todoId}/subtasks/${subtaskId}${ownerQuery(ownerId)}`, { method: 'DELETE' });
}
