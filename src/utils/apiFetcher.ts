export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    method?: RequestMethod;
    headers?: HeadersInit;
    body?: unknown;
    cache?: RequestCache;
    signal?: AbortSignal;
}

export async function apiFetcher<T = unknown>(path: string, opinions: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, cache = 'no-store', signal } = opinions;

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        cache,
        signal
    };

    const response = await fetch(path, fetchOptions);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || response.statusText);
    }

    return response.json() as Promise<T>;
}