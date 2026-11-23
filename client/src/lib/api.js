// Thin wrapper around fetch for the REST API (/api/v1, JSON, session cookie).
// Errors arrive as ApiError { status, message, details }; forms map them with useApiForm (KAN-83).
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// A 401 outside /auth means the session ended (30 idle minutes, NFR-SEC-04): go to login and come back after.
function sessionExpired() {
  if (window.location.pathname === '/login') return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?expired=1&next=${next}`);
}

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'We could not reach Beyond Borders. Check your internet connection and try again.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) sessionExpired();
    throw new ApiError(res.status, data?.error ?? 'Request failed.', data?.details);
  }
  return data;
}
