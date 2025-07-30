import sanitizeHtml from 'sanitize-html';
import parse from 'html-parse-stringify';

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
        'img': ['src', 'alt', 'width', 'height',  'style'],
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

    const astOriginal = parse.parse(content);
    const astSanitized = parse.parse(sanitized);

    function minifyStyleAttributes(ast: any[]): any[] {
        return ast.map(node => {
            if (node.type === 'tag' && node.name === 'img' && node.attrs && node.attrs.style) {
                node.attrs.style = node.attrs.style
                    .replace(/\s*:\s*/g, ':')
                    .replace(/\s*;\s*/g, ';')
                    .replace(/;\s*$/g, '');
            }
            if (node.children && node.children.length > 0) {
                node.children = minifyStyleAttributes(node.children);
            }
            return node;
        });
    }
    const astOriginalMin = minifyStyleAttributes(astOriginal);
    const astSanitizedMin = minifyStyleAttributes(astSanitized);

    return JSON.stringify(astOriginalMin) === JSON.stringify(astSanitizedMin);
};
