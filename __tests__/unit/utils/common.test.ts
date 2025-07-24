import { getBaseUrl, getPlatformName, truncateText, omit } from '@/utils/common';

// Mock environment variables
const originalEnv = process.env;

describe('common utilities', () => {
    beforeEach(() => {
        // Reset process.env before each test
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    describe('getBaseUrl', () => {
        it('should return NEXTAUTH_URL when environment variable is set', () => {
            process.env.NEXTAUTH_URL = 'https://myapp.com';

            const result = getBaseUrl();

            expect(result).toBe('https://myapp.com');
        });

        it('should return default localhost URL when NEXTAUTH_URL is not set', () => {
            delete process.env.NEXTAUTH_URL;

            const result = getBaseUrl();

            expect(result).toBe('http://localhost:3000');
        });

        it('should return default localhost URL when NEXTAUTH_URL is empty string', () => {
            process.env.NEXTAUTH_URL = '';

            const result = getBaseUrl();

            expect(result).toBe('http://localhost:3000');
        });

        it('should handle different URL formats', () => {
            const testUrls = [
                'https://example.com',
                'http://example.com:8080',
                'https://subdomain.example.com',
                'https://example.com/path',
            ];

            testUrls.forEach(url => {
                process.env.NEXTAUTH_URL = url;
                expect(getBaseUrl()).toBe(url);
            });
        });
    });

    describe('getPlatformName', () => {
        it('should return PLATFORM_NAME when environment variable is set', () => {
            process.env.PLATFORM_NAME = 'My Custom Blog';

            const result = getPlatformName();

            expect(result).toBe('My Custom Blog');
        });

        it('should return default platform name when PLATFORM_NAME is not set', () => {
            delete process.env.PLATFORM_NAME;

            const result = getPlatformName();

            expect(result).toBe('Blog Next');
        });

        it('should return default platform name when PLATFORM_NAME is empty string', () => {
            process.env.PLATFORM_NAME = '';

            const result = getPlatformName();

            expect(result).toBe('Blog Next');
        });

        it('should handle special characters in platform name', () => {
            const specialNames = [
                'Blog & News',
                'Tech Blog 2.0',
                'My-Blog_Site',
                'Blog (Professional)',
            ];

            specialNames.forEach(name => {
                process.env.PLATFORM_NAME = name;
                expect(getPlatformName()).toBe(name);
            });
        });
    });

    describe('truncateText', () => {
        it('should return original text when it is shorter than maxLength', () => {
            const text = 'Short text';
            const result = truncateText(text, 20);

            expect(result).toBe('Short text');
        });

        it('should return original text when it equals maxLength', () => {
            const text = 'Exact length';
            const result = truncateText(text, 12);

            expect(result).toBe('Exact length');
        });

        it('should truncate text and add ellipsis when longer than maxLength', () => {
            const text = 'This is a very long text that needs to be truncated';
            const result = truncateText(text, 20);

            expect(result).toBe('This is a very long...');
            expect(result.length).toBe(22); // 19 (trimmed) + 3 ('...')
        });

        it('should handle empty string', () => {
            const result = truncateText('', 10);

            expect(result).toBe('');
        });

        it('should handle maxLength of 0', () => {
            const text = 'Some text';
            const result = truncateText(text, 0);

            expect(result).toBe('...');
        });

        it('should handle maxLength of 1', () => {
            const text = 'Some text';
            const result = truncateText(text, 1);

            expect(result).toBe('S...');
        });

        it('should trim whitespace before adding ellipsis', () => {
            const text = 'This text has trailing spaces     ';
            const result = truncateText(text, 20);

            expect(result).toBe('This text has traili...');
            expect(result.endsWith('   ...')).toBe(false);
        });

        it('should handle text with only spaces', () => {
            const text = '     ';
            const result = truncateText(text, 3);

            expect(result).toBe('...');
        });

        it('should handle newlines and special characters', () => {
            const text = 'Text with\nnewlines and special chars!@#$%';
            const result = truncateText(text, 15);

            expect(result).toBe('Text with\nnewli...');
        });

        it('should handle unicode characters', () => {
            const text = 'Unicode text: 🚀 émojis and açcénts';
            const result = truncateText(text, 20);

            expect(result).toBe('Unicode text: 🚀 émo...');
        });
    });

    describe('omit', () => {
        it('should omit single key from object', () => {
            const obj = { name: 'John', age: 30, city: 'New York' };
            const result = omit(obj, 'age');

            expect(result).toEqual({ name: 'John', city: 'New York' });
            expect(result).not.toHaveProperty('age');
        });

        it('should omit multiple keys from object', () => {
            const obj = { name: 'John', age: 30, city: 'New York', country: 'USA' };
            const result = omit(obj, 'age', 'country');

            expect(result).toEqual({ name: 'John', city: 'New York' });
            expect(result).not.toHaveProperty('age');
            expect(result).not.toHaveProperty('country');
        });

        it('should return copy of object when no keys to omit', () => {
            const obj = { name: 'John', age: 30 };
            const result = omit(obj);

            expect(result).toEqual(obj);
            expect(result).not.toBe(obj); // Should be a new object
        });

        it('should handle omitting non-existent keys', () => {
            const obj = { name: 'John', age: 30 };
            const result = omit(obj, 'nonExistent' as keyof typeof obj);

            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('should handle empty object', () => {
            const obj = {};
            const result = omit(obj, 'anyKey' as keyof typeof obj);

            expect(result).toEqual({});
        });

        it('should omit all keys leaving empty object', () => {
            const obj = { name: 'John', age: 30 };
            const result = omit(obj, 'name', 'age');

            expect(result).toEqual({});
        });

        it('should preserve object immutability', () => {
            const obj = { name: 'John', age: 30, city: 'New York' };
            const result = omit(obj, 'age');

            // Original object should remain unchanged
            expect(obj).toEqual({ name: 'John', age: 30, city: 'New York' });
            expect(obj).toHaveProperty('age');

            // Result should be different object
            expect(result).not.toBe(obj);
        });

        it('should handle nested objects', () => {
            const obj = {
                user: { name: 'John', age: 30 },
                settings: { theme: 'dark' },
                metadata: { created: '2023-01-01' }
            };
            const result = omit(obj, 'settings');

            expect(result).toEqual({
                user: { name: 'John', age: 30 },
                metadata: { created: '2023-01-01' }
            });
            expect(result.user).toBe(obj.user); // Should be shallow copy
        });

        it('should handle objects with various value types', () => {
            const obj = {
                string: 'text',
                number: 42,
                boolean: true,
                array: [1, 2, 3],
                object: { nested: 'value' },
                nullValue: null,
                undefinedValue: undefined,
                dateValue: new Date('2023-01-01')
            };
            const result = omit(obj, 'boolean', 'nullValue', 'undefinedValue');

            expect(result).toEqual({
                string: 'text',
                number: 42,
                array: [1, 2, 3],
                object: { nested: 'value' },
                dateValue: new Date('2023-01-01')
            });
        });

        it('should maintain type safety', () => {
            const user = {
                id: 1,
                name: 'John',
                email: 'john@example.com',
                age: 30
            };

            const result = omit(user, 'age', 'email');

            expect(result).toEqual({ id: 1, name: 'John' });

            // TypeScript should infer the correct type
            expect(typeof result.id).toBe('number');
            expect(typeof result.name).toBe('string');
        });
    });
});
