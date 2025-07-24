import { generateSlug } from '@/utils/slug';

describe('generateSlug', () => {
    describe('Basic functionality', () => {
        it('should convert simple text to lowercase slug', () => {
            const result = generateSlug('Hello World');
            expect(result).toBe('hello-world');
        });

        it('should handle single words', () => {
            const result = generateSlug('JavaScript');
            expect(result).toBe('javascript');
        });

        it('should handle empty string', () => {
            const result = generateSlug('');
            expect(result).toBe('');
        });

        it('should handle single character', () => {
            const result = generateSlug('A');
            expect(result).toBe('a');
        });
    });

    describe('Special character handling', () => {
        it('should remove special characters', () => {
            const result = generateSlug('Hello! @World# $Test%');
            expect(result).toBe('hello-world-test');
        });

        it('should handle punctuation marks', () => {
            const result = generateSlug('Hello, World! How are you?');
            expect(result).toBe('hello-world-how-are-you');
        });

        it('should handle parentheses and brackets', () => {
            const result = generateSlug('Test (2023) [Updated]');
            expect(result).toBe('test-2023-updated');
        });

        it('should handle quotes and apostrophes', () => {
            const result = generateSlug('It\'s a "great" day');
            expect(result).toBe('its-a-great-day');
        });

        it('should handle mathematical symbols', () => {
            const result = generateSlug('Math: 2 + 2 = 4');
            expect(result).toBe('math-2-2-4');
        });
    });

    describe('Whitespace and hyphen handling', () => {
        it('should replace multiple spaces with single hyphen', () => {
            const result = generateSlug('Hello     World');
            expect(result).toBe('hello-world');
        });

        it('should replace tabs and newlines with hyphens', () => {
            const result = generateSlug('Hello\tWorld\nTest');
            expect(result).toBe('hello-world-test');
        });

        it('should handle mixed whitespace characters', () => {
            const result = generateSlug('Hello \t\n World   Test');
            expect(result).toBe('hello-world-test');
        });

        it('should preserve existing hyphens', () => {
            const result = generateSlug('Hello-World-Test');
            expect(result).toBe('hello-world-test');
        });

        it('should consolidate multiple hyphens', () => {
            const result = generateSlug('Hello---World');
            expect(result).toBe('hello-world');
        });

        it('should handle underscores by converting to hyphens', () => {
            const result = generateSlug('Hello_World_Test');
            expect(result).toBe('hello-world-test');
        });

        it('should handle mixed separators', () => {
            const result = generateSlug('Hello-World_Test Space');
            expect(result).toBe('hello-world-test-space');
        });
    });

    describe('Leading and trailing character handling', () => {
        it('should trim leading and trailing spaces', () => {
            const result = generateSlug('   Hello World   ');
            expect(result).toBe('hello-world');
        });

        it('should remove leading hyphens', () => {
            const result = generateSlug('---Hello World');
            expect(result).toBe('hello-world');
        });

        it('should remove trailing hyphens', () => {
            const result = generateSlug('Hello World---');
            expect(result).toBe('hello-world');
        });

        it('should remove both leading and trailing hyphens', () => {
            const result = generateSlug('---Hello World---');
            expect(result).toBe('hello-world');
        });

        it('should handle strings that become only hyphens', () => {
            const result = generateSlug('!@#$%^&*()');
            expect(result).toBe('');
        });

        it('should handle strings with only whitespace', () => {
            const result = generateSlug('   \t\n   ');
            expect(result).toBe('');
        });
    });

    describe('Unicode and international characters', () => {
        it('should handle accented characters', () => {
            const result = generateSlug('Café résumé naïve');
            expect(result).toBe('caf-rsum-nave');
        });

        it('should handle emoji and symbols', () => {
            const result = generateSlug('Hello 🚀 World ✨');
            expect(result).toBe('hello-world');
        });

        it('should handle non-Latin scripts', () => {
            const result = generateSlug('Hello мир 世界');
            expect(result).toBe('hello');
        });

        it('should handle mixed scripts and characters', () => {
            const result = generateSlug('Test Ñoño café 123');
            expect(result).toBe('test-oo-caf-123');
        });
    });

    describe('Numbers and alphanumeric handling', () => {
        it('should preserve numbers', () => {
            const result = generateSlug('Version 2.0.1');
            expect(result).toBe('version-201');
        });

        it('should handle pure numbers', () => {
            const result = generateSlug('123456');
            expect(result).toBe('123456');
        });

        it('should handle mixed alphanumeric', () => {
            const result = generateSlug('HTML5 CSS3 JS ES6');
            expect(result).toBe('html5-css3-js-es6');
        });

        it('should handle version-like strings', () => {
            const result = generateSlug('React v18.2.0');
            expect(result).toBe('react-v1820');
        });
    });

    describe('Real-world scenarios', () => {
        it('should handle blog post titles', () => {
            const result = generateSlug('10 Tips for Better JavaScript Performance');
            expect(result).toBe('10-tips-for-better-javascript-performance');
        });

        it('should handle article titles with dates', () => {
            const result = generateSlug('Update: New Features Released (March 2023)');
            expect(result).toBe('update-new-features-released-march-2023');
        });

        it('should handle technical terms', () => {
            const result = generateSlug('REST APIs vs GraphQL: A Comparison');
            expect(result).toBe('rest-apis-vs-graphql-a-comparison');
        });

        it('should handle question-style titles', () => {
            const result = generateSlug('How to Deploy a Next.js App?');
            expect(result).toBe('how-to-deploy-a-nextjs-app');
        });

        it('should handle titles with acronyms', () => {
            const result = generateSlug('Building a CRUD App with Node.js & MongoDB');
            expect(result).toBe('building-a-crud-app-with-nodejs-mongodb');
        });

        it('should handle long titles', () => {
            const input = 'A Comprehensive Guide to Modern Web Development: From HTML & CSS to React, Node.js, and Database Integration';
            const result = generateSlug(input);
            expect(result).toBe('a-comprehensive-guide-to-modern-web-development-from-html-css-to-react-nodejs-and-database-integration');
        });

        it('should handle titles with code-like content', () => {
            const result = generateSlug('Understanding Array.map() vs Array.forEach()');
            expect(result).toBe('understanding-arraymap-vs-arrayforeach');
        });
    });

    describe('Edge cases and stress tests', () => {
        it('should handle very long strings', () => {
            const longString = 'a'.repeat(1000);
            const result = generateSlug(longString);
            expect(result).toBe(longString.toLowerCase());
            expect(result.length).toBe(1000);
        });

        it('should handle strings with only special characters', () => {
            const result = generateSlug('!@#$%^&*()_+-=[]{}|;:,.<>?');
            expect(result).toBe('');
        });

        it('should handle repeated words', () => {
            const result = generateSlug('Test Test Test');
            expect(result).toBe('test-test-test');
        });

        it('should maintain consistency', () => {
            const input = 'Same Input Text';
            const result1 = generateSlug(input);
            const result2 = generateSlug(input);
            expect(result1).toBe(result2);
            expect(result1).toBe('same-input-text');
        });

        it('should be reversible for simple cases', () => {
            const originalSlug = 'hello-world-test';
            const result = generateSlug(originalSlug);
            expect(result).toBe(originalSlug);
        });

        it('should handle null and undefined gracefully', () => {
            // These will throw errors as expected, since the function expects a string
            expect(() => generateSlug(null as any)).toThrow();
            expect(() => generateSlug(undefined as any)).toThrow();
        });
    });

    describe('URL-safe validation', () => {
        it('should produce URL-safe strings', () => {
            const inputs = [
                'Hello World!',
                'Test @#$% String',
                'Special "Quotes" & Symbols',
                'Numbers 123 & Letters ABC'
            ];

            inputs.forEach(input => {
                const result = generateSlug(input);
                // URL-safe characters: letters, numbers, hyphens
                expect(result).toMatch(/^[a-z0-9-]*$/);
            });
        });

        it('should not contain consecutive hyphens', () => {
            const inputs = [
                'Hello---World',
                'Test___String',
                'Multiple   Spaces'
            ];

            inputs.forEach(input => {
                const result = generateSlug(input);
                expect(result).not.toMatch(/--+/); // No consecutive hyphens
            });
        });

        it('should not start or end with hyphens', () => {
            const inputs = [
                '---Hello World---',
                '___Test String___',
                '   Trimmed Content   '
            ];

            inputs.forEach(input => {
                const result = generateSlug(input);
                expect(result).not.toMatch(/^-/); // No leading hyphen
                expect(result).not.toMatch(/-$/); // No trailing hyphen
            });
        });
    });
});
