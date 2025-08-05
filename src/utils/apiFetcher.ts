import { getBaseUrl } from "./common";

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    method?: RequestMethod;
    headers?: HeadersInit;
    body?: unknown;
    cache?: RequestCache;
    signal?: AbortSignal;
}

function resolveInternalApi(path: string) {
    const baseUrl = getBaseUrl();
    const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
    const isServer = typeof window === "undefined";

    if (isAbsolute) {
        const isInternal = path.startsWith(baseUrl);
        return {
            url: path,
            shouldIncludeCookies: isServer && isInternal
        };
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = isServer ? `${baseUrl}${normalizedPath}` : normalizedPath;

    return {
        url,
        shouldIncludeCookies: isServer
    };
}


export async function apiFetcher<T = unknown>(path: string, opinions: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, cache = 'no-store', signal } = opinions;
    const { url, shouldIncludeCookies } = resolveInternalApi(path);

    let cookieHeader: string | undefined;

    if (shouldIncludeCookies) {
        // Import "cookies" only at runtime on the server, client component cannot import this due to Next.js restrictions
        const { cookies } = await import("next/headers");
        cookieHeader = (await cookies()).toString();
    }

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...(cookieHeader ? { 'Cookie': cookieHeader } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        cache,
        signal
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || response.statusText);
    }

    return response.json() as Promise<T>;
}