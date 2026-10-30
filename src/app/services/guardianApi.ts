import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/alana-website-guardian`;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || publicAnonKey;

interface StoredGuardianSession {
  token: string;
  walletAddress: string;
  expiresAt: string;
}

interface ApiErrorBody {
  error?: string;
}

let activeGuardianSession: StoredGuardianSession | null = null;

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  guardian = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('apikey', publishableKey);
  headers.set('Authorization', `Bearer ${publishableKey}`);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (guardian) {
    const session = getStoredGuardianSession();
    if (!session) throw new Error('Guardian authorization required');
    headers.set('X-Guardian-Session', session.token);
  }

  const response = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorBody;
    if (guardian && (response.status === 401 || response.status === 403)) {
      clearStoredGuardianSession();
    }
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getStoredGuardianSession(): StoredGuardianSession | null {
  if (
    !activeGuardianSession ||
    Date.parse(activeGuardianSession.expiresAt) <= Date.now()
  ) {
    activeGuardianSession = null;
    return null;
  }
  return activeGuardianSession;
}

export function storeGuardianSession(session: StoredGuardianSession): void {
  activeGuardianSession = session;
}

export function clearStoredGuardianSession(): void {
  activeGuardianSession = null;
  window.dispatchEvent(new Event('alana-guardian-session-cleared'));
}

export async function requestGuardianNonce(
  walletAddress: string,
): Promise<{ message: string; expiresAt: string }> {
  return apiRequest('/auth/nonce', {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  });
}

export async function verifyGuardianSignature(input: {
  walletAddress: string;
  message: string;
  signature: string;
}): Promise<StoredGuardianSession> {
  return apiRequest('/auth/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function validateGuardianSession(): Promise<{
  walletAddress: string;
  expiresAt: string;
}> {
  return apiRequest('/admin/session', {}, true);
}

export async function fetchPublicResource<T>(
  resource: string,
  params?: Record<string, string>,
): Promise<T[]> {
  const search = new URLSearchParams(params);
  const suffix = search.size > 0 ? `?${search.toString()}` : '';
  const response = await apiRequest<{ data: T[] }>(`/public/${resource}${suffix}`);
  return response.data;
}

export async function fetchPublicItem<T>(resource: string): Promise<T> {
  const response = await apiRequest<{ data: T }>(`/public/${resource}`);
  return response.data;
}

export async function fetchGuardianResource<T>(resource: string): Promise<T[]> {
  const response = await apiRequest<{ data: T[] }>(`/admin/${resource}`, {}, true);
  return response.data;
}

export async function fetchManagedResource<T>(
  resource: string,
  params?: Record<string, string>,
): Promise<T[]> {
  if (getStoredGuardianSession()) {
    try {
      return await fetchGuardianResource<T>(resource);
    } catch {
      // Public pages should remain available during a transient admin-read failure.
    }
  }
  return fetchPublicResource<T>(resource, params);
}

export async function mutateGuardianResource<T>(
  action: string,
  resource: string,
  payload?: unknown,
): Promise<T> {
  const response = await apiRequest<{ data: T }>('/admin/mutate', {
    method: 'POST',
    body: JSON.stringify({ action, resource, payload }),
  }, true);
  return response.data;
}

export async function uploadGuardianMemberImage(file: File): Promise<string> {
  const body = new FormData();
  body.set('file', file);
  const response = await apiRequest<{ url: string }>('/admin/member-image', {
    method: 'POST',
    body,
  }, true);
  return response.url;
}
