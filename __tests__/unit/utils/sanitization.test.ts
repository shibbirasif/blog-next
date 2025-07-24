import {
    sanitizeToPlainText,
    sanitizeHtmlContent,
    isPlainTextValid,
    isHtmlContentValid,
    plainTextSanitizationOptions,
    htmlContentSanitizationOptions
} from '@/utils/sanitization';

// Mock sanitize-html
jest.mock('sanitize-html', () => {
    const mockSanitizeHtml = jest.fn();

    // Default implementation that mimics real sanitize-html behavior
    mockSanitizeHtml.mockImplementation((input: string, options: any) => {
        // For plain text options (no tags allowed)
        if (options.allowedTags && options.allowedTags.length === 0) {
            return input.replace(/<[^>]*>/g, ''); // Strip all HTML tags
        }

        // For HTML content options (some tags allowed)
        if (options.allowedTags && options.allowedTags.length > 0) {
            // Simple mock: keep allowed tags, remove others
            const allowedTags = options.allowedTags;
            let result = input;

            // Remove script tags (not in allowed list)
            result = result.replace(/<script[^>]*>.*?<\/script>/gi, '');
            result = result.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');

            // Keep basic allowed tags as-is for testing
            return result;
        }

        return input;
    });

    return mockSanitizeHtml;
});

import sanitizeHtml from 'sanitize-html';

const mockSanitizeHtml = sanitizeHtml as jest.MockedFunction<typeof sanitizeHtml>;

describe('sanitization utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('sanitizeToPlainText', () => {
        it('should remove all HTML tags from input', () => {
            const input = '<p>Hello <strong>world</strong>!</p>';
            mockSanitizeHtml.mockReturnValueOnce('Hello world!');

            const result = sanitizeToPlainText(input);

            expect(mockSanitizeHtml).toHaveBeenCalledWith(input, plainTextSanitizationOptions);
            expect(result).toBe('Hello world!');
        });

        it('should handle plain text input', () => {
            const input = 'Just plain text';
            mockSanitizeHtml.mockReturnValueOnce('Just plain text');

            const result = sanitizeToPlainText(input);

            expect(result).toBe('Just plain text');
        });

        it('should handle empty string', () => {
            const input = '';
            mockSanitizeHtml.mockReturnValueOnce('');

            const result = sanitizeToPlainText(input);

            expect(result).toBe('');
        });

        it('should handle complex HTML structures', () => {
            const input = '<div><p>Content</p><script>alert("xss")</script></div>';
            mockSanitizeHtml.mockReturnValueOnce('Content');

            const result = sanitizeToPlainText(input);

            expect(result).toBe('Content');
        });

        it('should handle malformed HTML', () => {
            const input = '<p>Unclosed tag <strong>bold text';
            mockSanitizeHtml.mockReturnValueOnce('Unclosed tag bold text');

            const result = sanitizeToPlainText(input);

            expect(result).toBe('Unclosed tag bold text');
        });
    });

    describe('sanitizeHtmlContent', () => {
        it('should preserve allowed HTML tags', () => {
            const input = '<p>Hello <strong>world</strong>!</p>';
            mockSanitizeHtml.mockReturnValueOnce('<p>Hello <strong>world</strong>!</p>');

            const result = sanitizeHtmlContent(input);

            expect(mockSanitizeHtml).toHaveBeenCalledWith(input, htmlContentSanitizationOptions);
            expect(result).toBe('<p>Hello <strong>world</strong>!</p>');
        });

        it('should remove dangerous script tags', () => {
            const input = '<p>Safe content</p><script>alert("xss")</script>';
            mockSanitizeHtml.mockReturnValueOnce('<p>Safe content</p>');

            const result = sanitizeHtmlContent(input);

            expect(result).toBe('<p>Safe content</p>');
        });

        it('should preserve allowed attributes', () => {
            const input = '<a href="https://example.com" target="_blank">Link</a>';
            mockSanitizeHtml.mockReturnValueOnce('<a href="https://example.com" target="_blank">Link</a>');

            const result = sanitizeHtmlContent(input);

            expect(result).toBe('<a href="https://example.com" target="_blank">Link</a>');
        });

        it('should handle images with allowed attributes', () => {
            const input = '<img src="image.jpg" alt="Description" width="100">';
            mockSanitizeHtml.mockReturnValueOnce('<img src="image.jpg" alt="Description" width="100">');

            const result = sanitizeHtmlContent(input);

            expect(result).toBe('<img src="image.jpg" alt="Description" width="100">');
        });

        it('should handle lists and headers', () => {
            const input = '<h1>Title</h1><ul><li>Item 1</li><li>Item 2</li></ul>';
            mockSanitizeHtml.mockReturnValueOnce('<h1>Title</h1><ul><li>Item 1</li><li>Item 2</li></ul>');

            const result = sanitizeHtmlContent(input);

            expect(result).toBe('<h1>Title</h1><ul><li>Item 1</li><li>Item 2</li></ul>');
        });
    });

    describe('isPlainTextValid', () => {
        it('should return true for plain text without HTML', () => {
            const input = 'Just plain text';
            mockSanitizeHtml.mockReturnValueOnce('Just plain text');

            const result = isPlainTextValid(input);

            expect(result).toBe(true);
        });

        it('should return false for text with HTML tags', () => {
            const input = '<p>Text with HTML</p>';
            mockSanitizeHtml.mockReturnValueOnce('Text with HTML');

            const result = isPlainTextValid(input);

            expect(result).toBe(false);
        });

        it('should return true for empty string', () => {
            const input = '';
            mockSanitizeHtml.mockReturnValueOnce('');

            const result = isPlainTextValid(input);

            expect(result).toBe(true);
        });

        it('should return false for malicious content', () => {
            const input = '<script>alert("xss")</script>Hello';
            mockSanitizeHtml.mockReturnValueOnce('Hello');

            const result = isPlainTextValid(input);

            expect(result).toBe(false);
        });

        it('should handle special characters correctly', () => {
            const input = 'Text with special chars: & < > " \'';
            mockSanitizeHtml.mockReturnValueOnce('Text with special chars: & < > " \'');

            const result = isPlainTextValid(input);

            expect(result).toBe(true);
        });
    });

    describe('isHtmlContentValid', () => {
        it('should return true for valid HTML with allowed tags', () => {
            const input = '<p>Valid <strong>HTML</strong> content</p>';
            mockSanitizeHtml.mockReturnValueOnce('<p>Valid <strong>HTML</strong> content</p>');

            const result = isHtmlContentValid(input);

            expect(result).toBe(true);
        });

        it('should return false for HTML with disallowed tags', () => {
            const input = '<p>Content</p><script>alert("xss")</script>';
            mockSanitizeHtml.mockReturnValueOnce('<p>Content</p>');

            const result = isHtmlContentValid(input);

            expect(result).toBe(false);
        });

        it('should return true for plain text', () => {
            const input = 'Just plain text';
            mockSanitizeHtml.mockReturnValueOnce('Just plain text');

            const result = isHtmlContentValid(input);

            expect(result).toBe(true);
        });

        it('should return false for HTML with disallowed attributes', () => {
            const input = '<p onclick="alert()">Content</p>';
            mockSanitizeHtml.mockReturnValueOnce('<p>Content</p>');

            const result = isHtmlContentValid(input);

            expect(result).toBe(false);
        });

        it('should return true for empty string', () => {
            const input = '';
            mockSanitizeHtml.mockReturnValueOnce('');

            const result = isHtmlContentValid(input);

            expect(result).toBe(true);
        });
    });

    describe('sanitization options', () => {
        it('should use correct plain text sanitization options', () => {
            const input = '<p>Test</p>';
            sanitizeToPlainText(input);

            expect(mockSanitizeHtml).toHaveBeenCalledWith(input, plainTextSanitizationOptions);

            // Verify the options structure
            const options = mockSanitizeHtml.mock.calls[0]?.[1];
            expect(options?.allowedTags).toEqual([]);
            expect(options?.allowedAttributes).toEqual({});
            expect(options?.disallowedTagsMode).toBe('discard');
        });

        it('should use correct HTML content sanitization options', () => {
            const input = '<p>Test</p>';
            sanitizeHtmlContent(input);

            expect(mockSanitizeHtml).toHaveBeenCalledWith(input, htmlContentSanitizationOptions);

            // Verify the options structure
            const options = mockSanitizeHtml.mock.calls[0]?.[1];
            expect(options?.allowedTags).toContain('p');
            expect(options?.allowedTags).toContain('strong');
            expect(options?.allowedTags).toContain('a');
            expect(options?.allowedAttributes).toHaveProperty('a');
            expect(options?.allowedAttributes).toHaveProperty('img');
        });
    });

    describe('edge cases', () => {
        it('should handle null or undefined input gracefully', () => {
            // Test with undefined
            mockSanitizeHtml.mockReturnValueOnce('');
            const resultUndefined = sanitizeToPlainText(undefined as any);
            expect(resultUndefined).toBe('');

            // Test with null
            mockSanitizeHtml.mockReturnValueOnce('');
            const resultNull = sanitizeToPlainText(null as any);
            expect(resultNull).toBe('');
        });

        it('should handle very long strings', () => {
            const longInput = '<p>' + 'a'.repeat(10000) + '</p>';
            const expectedOutput = 'a'.repeat(10000);
            mockSanitizeHtml.mockReturnValueOnce(expectedOutput);

            const result = sanitizeToPlainText(longInput);

            expect(result).toBe(expectedOutput);
        });

        it('should handle unicode and special characters', () => {
            const input = '<p>Unicode: 🚀 émojis and açcénts</p>';
            const expected = 'Unicode: 🚀 émojis and açcénts';
            mockSanitizeHtml.mockReturnValueOnce(expected);

            const result = sanitizeToPlainText(input);

            expect(result).toBe(expected);
        });

        it('should handle deeply nested HTML', () => {
            const input = '<div><p><strong><em><u>Deeply nested</u></em></strong></p></div>';
            mockSanitizeHtml.mockReturnValueOnce('Deeply nested');

            const result = sanitizeToPlainText(input);

            expect(result).toBe('Deeply nested');
        });

        it('should handle mixed content types', () => {
            const input = 'Plain text <p>HTML paragraph</p> more text <strong>bold</strong>';
            mockSanitizeHtml.mockReturnValueOnce('Plain text HTML paragraph more text bold');

            const result = sanitizeToPlainText(input);

            expect(result).toBe('Plain text HTML paragraph more text bold');
        });
    });
});
