const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Held in module-level memory rather than localStorage so an XSS payload
// can't just read the access token out of storage. It's lost on a hard
// refresh by design — silentRefresh() (see AuthContext) re-derives it from
// the httpOnly refresh cookie on app load.
let accessToken = null;
let onAuthFailure = () => {};

// Prevents a burst of parallel 401s (e.g. several react-query hooks firing
// at once) from each independently racing to refresh the token.
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setOnAuthFailure(handler) {
  onAuthFailure = handler;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh failed');
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Thin fetch wrapper: attaches the bearer token, JSON-encodes bodies,
 * transparently retries once on a 401 after refreshing the access token,
 * and throws an ApiError with the server's message on failure.
 */
export async function apiFetch(path, { method = 'GET', body, skipAuthRetry = false } = {}) {
  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuthRetry) {
    try {
      await refreshAccessToken();
      res = await doFetch();
    } catch {
      onAuthFailure();
      throw new ApiError('Session expired', 401);
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    if (res.status === 401) onAuthFailure();
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, res.status);
  }

  if (res.status === 204) return null;
  return res.json();
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export { API_URL };
