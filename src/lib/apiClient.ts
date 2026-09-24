import { API_BASE_URL, getAuthHeaders, getBasicHeaders, getFileUploadHeaders } from '@/services/apiConfig';
import { secureTokenStorage } from '@/services/secureTokenStorage';

/** Status-carrying error so retry logic and 401 handling can branch on code, not message text. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, detail: string) {
    super(`${status} ${detail}`.trim());
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractDetail(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const d = (body as { detail: unknown }).detail;
    if (typeof d === 'string') return d;
    try {
      return JSON.stringify(d);
    } catch {
      return fallback;
    }
  }
  if (typeof body === 'string' && body) return body;
  return fallback;
}

async function request<T>(path: string, init: RequestInit, headers: HeadersInit, fallback: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    mode: 'cors',
  });

  if (!response.ok) {
    const body = await parseBody(response).catch(() => null);
    const detail = extractDetail(body, response.statusText || fallback);
    // Auto-logout on 401 so stale tokens never linger.
    if (response.status === 401) secureTokenStorage.removeToken();
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) return null as T;
  return (await response.json().catch(() => null)) as T;
}

/** Authenticated JSON request. Throws ApiError (never "Bearer null"). */
export function apiRequest<T>(path: string, init: RequestInit = {}, fallback = 'Request failed'): Promise<T> {
  return request<T>(path, init, getAuthHeaders(), fallback);
}

export const apiGet = <T>(path: string, fallback = 'Request failed') =>
  apiRequest<T>(path, { method: 'GET' }, fallback);

export const apiPost = <T>(path: string, body?: unknown, fallback = 'Request failed') =>
  apiRequest<T>(
    path,
    { method: 'POST', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
    fallback,
  );

export const apiPut = <T>(path: string, body?: unknown, fallback = 'Request failed') =>
  apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }, fallback);

export const apiDelete = <T>(path: string, fallback = 'Request failed') =>
  apiRequest<T>(path, { method: 'DELETE' }, fallback);

/** Public (unauthenticated) JSON request. */
export async function publicPost<T>(path: string, body: unknown, fallback = 'Request failed'): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: getBasicHeaders(),
    body: JSON.stringify(body),
    mode: 'cors',
  });
  if (!response.ok) {
    const parsed = await parseBody(response).catch(() => null);
    throw new ApiError(response.status, extractDetail(parsed, fallback));
  }
  return (await response.json().catch(() => null)) as T;
}

/** Authenticated multipart upload (no Content-Type — the browser sets the boundary). */
export async function apiUpload<T>(path: string, formData: FormData, fallback = 'Upload failed'): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: getFileUploadHeaders(),
    body: formData,
    mode: 'cors',
  });
  if (!response.ok) {
    const parsed = await parseBody(response).catch(() => null);
    if (response.status === 401) secureTokenStorage.removeToken();
    throw new ApiError(response.status, extractDetail(parsed, fallback));
  }
  return (await response.json().catch(() => null)) as T;
}
