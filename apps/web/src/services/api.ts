import { storage } from '../utils/storage';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '');

let refreshPromise: Promise<string | null> | null = null;

function authHeaders(extra?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(storage.token ? { Authorization: `Bearer ${storage.token}` } : {}),
    ...(storage.tenantId ? { 'X-Tenant-Id': storage.tenantId } : {}),
    ...(extra || {}),
  };
}

async function tryRefreshToken(): Promise<string | null> {
  if (!storage.refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storage.refreshToken }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        const nextAccessToken = body?.accessToken || body?.token;
        if (!res.ok || !nextAccessToken) {
          storage.clearAuth();
          return null;
        }
        storage.token = nextAccessToken;
        if (body.refreshToken) storage.refreshToken = body.refreshToken;
        return nextAccessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api(path: string, opts: RequestInit = {}, retry = true) {
  const res = await fetch(API_URL + path, {
    ...opts,
    headers: authHeaders(opts.headers),
  });

  if (res.status === 401 && retry && storage.refreshToken) {
    const freshToken = await tryRefreshToken();
    if (freshToken) {
      return api(path, opts, false);
    }
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(body?.message || body?.error || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body?.data ?? body;
}

export async function apiDownload(path: string, opts: RequestInit = {}, retry = true) {
  const res = await fetch(API_URL + path, {
    ...opts,
    headers: {
      ...(storage.token ? { Authorization: `Bearer ${storage.token}` } : {}),
      ...(storage.tenantId ? { 'X-Tenant-Id': storage.tenantId } : {}),
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401 && retry && storage.refreshToken) {
    const freshToken = await tryRefreshToken();
    if (freshToken) {
      return apiDownload(path, opts, false);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: any = new Error(body?.message || body?.error || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res;
}

export { API_URL };
