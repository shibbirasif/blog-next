import sanitizeHtml from 'sanitize-html';

// Sanitization rules for plain text fields (no HTML allowed)
export const plainTextSanitizationOptions: sanitizeHtml.IOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    allowedIframeHostnames: []
};

// Sanitization rules for rich HTML content fields
export const htmlContentSanitizationOptions: sanitizeHtml.IOptions = {
    allowedTags: [
        'p', 'br', 'strong', 'em', 'u', 's',           // Basic formatting
        'h1', 'h2', 'h3', 'h4',                        // Headers
        'ul', 'ol', 'li',                              // Lists
        'blockquote',                                   // Quotes
        'a', 'img',                                     // Links and images
        'code', 'pre'                                   // Code blocks
    ],
    allowedAttributes: {
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height'],
        '*': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedClasses: {
        '*': ['highlight', 'code-block', 'quote']
    }
};

export const sanitizeToPlainText = (text: string): string => {
    return sanitizeHtml(text, plainTextSanitizationOptions);
};

export const sanitizeHtmlContent = (content: string): string => {
    return sanitizeHtml(content, htmlContentSanitizationOptions);
};

export const isPlainTextValid = (text: string): boolean => {
    const sanitized = sanitizeHtml(text, plainTextSanitizationOptions);
    return text === sanitized;
};

export const isHtmlContentValid = (content: string): boolean => {
    const sanitized = sanitizeHtml(content, htmlContentSanitizationOptions);
    return content === sanitized;
};
