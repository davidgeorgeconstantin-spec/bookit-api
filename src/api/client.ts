import { ApiError, type HttpMethod } from '@/types/api';
import { handle } from './mockServer';
import { requestLog } from './requestLog';

/** If VITE_API_URL is set (e.g. http://localhost:4000), the real Express server is used. */
const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const usingMock = !API_URL;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const started = performance.now();
  let status: number;
  let data: unknown;

  if (API_URL) {
    const res = await fetch(API_URL + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    status = res.status;
    data = await res.json();
  } else {
    await delay(250 + Math.random() * 350); // simulate network latency
    ({ status, body: data } = handle(method, path, body));
  }

  requestLog.add({ method, path, status, ms: Math.round(performance.now() - started), requestBody: body, responseBody: data });

  if (status >= 400) {
    const err = data as { error?: string; details?: Record<string, string[]> };
    throw new ApiError(status, err.error ?? 'Request failed', err.details);
  }
  return data as T;
}
