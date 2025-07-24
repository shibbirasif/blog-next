import { apiFetcher, type RequestMethod } from '@/utils/apiFetcher';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiFetcher', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    describe('Successful Requests', () => {
        it('should make a GET request with default options', async () => {
            const mockData = { id: 1, name: 'Test User' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockData),
            });

            const result = await apiFetcher('/api/users');

            expect(mockFetch).toHaveBeenCalledWith('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: undefined,
                cache: 'no-store',
                signal: undefined,
            });
            expect(result).toEqual(mockData);
        });

        it('should make a POST request with body', async () => {
            const requestBody = { name: 'John Doe', email: 'john@example.com' };
            const responseData = { id: 1, ...requestBody };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(responseData),
            });

            const result = await apiFetcher('/api/users', {
                method: 'POST',
                body: requestBody,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                cache: 'no-store',
                signal: undefined,
            });
            expect(result).toEqual(responseData);
        });

        it('should handle PUT request with custom headers', async () => {
            const requestBody = { name: 'Updated Name' };
            const customHeaders = { 'Authorization': 'Bearer token123' };
            const responseData = { success: true };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(responseData),
            });

            const result = await apiFetcher('/api/users/1', {
                method: 'PUT',
                headers: customHeaders,
                body: requestBody,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token123',
                },
                body: JSON.stringify(requestBody),
                cache: 'no-store',
                signal: undefined,
            });
            expect(result).toEqual(responseData);
        });

        it('should handle PATCH request', async () => {
            const requestBody = { status: 'active' };
            const responseData = { id: 1, status: 'active' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(responseData),
            });

            const result = await apiFetcher('/api/users/1', {
                method: 'PATCH',
                body: requestBody,
            });

            expect(result).toEqual(responseData);
            expect(mockFetch).toHaveBeenCalledWith('/api/users/1',
                expect.objectContaining({ method: 'PATCH' })
            );
        });

        it('should handle DELETE request', async () => {
            const responseData = { message: 'User deleted' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(responseData),
            });

            const result = await apiFetcher('/api/users/1', {
                method: 'DELETE',
            });

            expect(result).toEqual(responseData);
            expect(mockFetch).toHaveBeenCalledWith('/api/users/1',
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('should handle custom cache option', async () => {
            const mockData = { cached: true };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockData),
            });

            await apiFetcher('/api/data', {
                cache: 'force-cache',
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/data',
                expect.objectContaining({ cache: 'force-cache' })
            );
        });

        it('should handle AbortSignal', async () => {
            const controller = new AbortController();
            const mockData = { aborted: false };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockData),
            });

            await apiFetcher('/api/data', {
                signal: controller.signal,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/data',
                expect.objectContaining({ signal: controller.signal })
            );
        });

        it('should handle request without body (GET request)', async () => {
            const mockData = { items: [] };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockData),
            });

            await apiFetcher('/api/items', {
                method: 'GET',
                body: undefined,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/items',
                expect.objectContaining({ body: undefined })
            );
        });
    });

    describe('Error Handling', () => {
        it('should throw error for HTTP 4xx responses', async () => {
            const errorResponse = { message: 'User not found' };
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: jest.fn().mockResolvedValueOnce(errorResponse),
            });

            await expect(apiFetcher('/api/users/999')).rejects.toThrow('User not found');

            expect(mockFetch).toHaveBeenCalledWith('/api/users/999', expect.any(Object));
        });

        it('should throw error for HTTP 5xx responses', async () => {
            const errorResponse = { message: 'Internal server error' };
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: jest.fn().mockResolvedValueOnce(errorResponse),
            });

            await expect(apiFetcher('/api/users')).rejects.toThrow('Internal server error');
        });

        it('should use statusText when error response has no message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                json: jest.fn().mockResolvedValueOnce({}),
            });

            await expect(apiFetcher('/api/protected')).rejects.toThrow('Forbidden');
        });

        it('should use statusText when error response JSON parsing fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
            });

            await expect(apiFetcher('/api/invalid')).rejects.toThrow('Bad Request');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(apiFetcher('/api/users')).rejects.toThrow('Network error');
        });

        it('should handle fetch timeout/abort', async () => {
            mockFetch.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));

            await expect(apiFetcher('/api/users')).rejects.toThrow('The operation was aborted');
        });
    });

    describe('Type Safety', () => {
        it('should return typed response', async () => {
            interface User {
                id: number;
                name: string;
                email: string;
            }

            const userData: User = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(userData),
            });

            const result = await apiFetcher<User>('/api/users/1');

            expect(result).toEqual(userData);
            expect(result.id).toBe(1);
            expect(result.name).toBe('John Doe');
            expect(result.email).toBe('john@example.com');
        });

        it('should handle array responses', async () => {
            interface Article {
                id: number;
                title: string;
            }

            const articlesData: Article[] = [
                { id: 1, title: 'First Article' },
                { id: 2, title: 'Second Article' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(articlesData),
            });

            const result = await apiFetcher<Article[]>('/api/articles');

            expect(result).toEqual(articlesData);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty response body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(null),
            });

            const result = await apiFetcher('/api/empty');

            expect(result).toBeNull();
        });

        it('should handle response with undefined/null values', async () => {
            const responseData = {
                name: 'Test',
                value: null,
                optional: undefined,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(responseData),
            });

            const result = await apiFetcher('/api/data');

            expect(result).toEqual({
                name: 'Test',
                value: null,
                optional: undefined,
            });
        });

        it('should handle boolean response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(true),
            });

            const result = await apiFetcher<boolean>('/api/status');

            expect(result).toBe(true);
        });

        it('should handle number response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(42),
            });

            const result = await apiFetcher<number>('/api/count');

            expect(result).toBe(42);
        });

        it('should handle string response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce('success'),
            });

            const result = await apiFetcher<string>('/api/message');

            expect(result).toBe('success');
        });
    });

    describe('Request Method Validation', () => {
        const methods: RequestMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        methods.forEach(method => {
            it(`should handle ${method} method correctly`, async () => {
                const mockData = { method: method.toLowerCase() };
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: jest.fn().mockResolvedValueOnce(mockData),
                });

                await apiFetcher('/api/test', { method });

                expect(mockFetch).toHaveBeenCalledWith('/api/test',
                    expect.objectContaining({ method })
                );
            });
        });
    });

    describe('Header Merging', () => {
        it('should merge custom headers with default Content-Type', async () => {
            const customHeaders = {
                'Authorization': 'Bearer token',
                'X-Custom-Header': 'custom-value',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({}),
            });

            await apiFetcher('/api/test', {
                headers: customHeaders,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/test', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token',
                    'X-Custom-Header': 'custom-value',
                },
                body: undefined,
                cache: 'no-store',
                signal: undefined,
            });
        });

        it('should allow overriding Content-Type header', async () => {
            const customHeaders = {
                'Content-Type': 'text/plain',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({}),
            });

            await apiFetcher('/api/test', {
                headers: customHeaders,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/test',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'text/plain',
                    }),
                })
            );
        });
    });

    describe('JSON Serialization', () => {
        it('should serialize complex objects in body', async () => {
            const complexBody = {
                user: {
                    name: 'John',
                    preferences: {
                        theme: 'dark',
                        notifications: true,
                    },
                },
                tags: ['javascript', 'testing'],
                metadata: {
                    timestamp: '2023-01-01T00:00:00Z',
                    version: 1,
                },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ success: true }),
            });

            await apiFetcher('/api/complex', {
                method: 'POST',
                body: complexBody,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/complex',
                expect.objectContaining({
                    body: JSON.stringify(complexBody),
                })
            );
        });

        it('should handle null body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({}),
            });

            await apiFetcher('/api/test', {
                method: 'POST',
                body: null,
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/test',
                expect.objectContaining({
                    body: undefined, // null body becomes undefined due to truthy check
                })
            );
        });
    });
});
