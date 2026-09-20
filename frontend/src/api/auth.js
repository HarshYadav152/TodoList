import { apiFetch } from './client';

export function registerRequest(email, password, name) {
  return apiFetch('/auth/register', { method: 'POST', body: { email, password, name }, skipAuthRetry: true });
}

export function loginRequest(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password }, skipAuthRetry: true });
}

export function refreshRequest() {
  return apiFetch('/auth/refresh', { method: 'POST', skipAuthRetry: true });
}

export function logoutRequest() {
  return apiFetch('/auth/logout', { method: 'POST', skipAuthRetry: true });
}
