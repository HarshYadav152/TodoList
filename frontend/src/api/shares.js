import { apiFetch } from './client';

export function createShare(email, permission) {
  return apiFetch('/shares', { method: 'POST', body: { email, permission } });
}

export function fetchSharedWithMe() {
  return apiFetch('/shares/shared-with-me');
}

export function fetchMyShares() {
  return apiFetch('/shares/my-shares');
}

export function revokeShare(id) {
  return apiFetch(`/shares/${id}`, { method: 'DELETE' });
}
