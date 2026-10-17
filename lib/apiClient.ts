async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });

export const apiPatch = <T>(path: string, data: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(data) });
