import { Node, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageComponent from './ResizableImageComponent';

export interface ResizableImageOptions {
    inline: boolean;
    allowBase64: boolean;
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableImage: {
            setImage: (options: { src: string; fileId: string, alt?: string; title?: string; width?: number; height?: number }) => ReturnType;
        };
    }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const ResizableImage = Node.create<ResizableImageOptions>({
    name: 'resizableImage',

    addOptions() {
        return {
            inline: false,
            allowBase64: true,
            HTMLAttributes: {},
        };
    },

    inline() {
        return this.options.inline;
    },

    group() {
        return this.options.inline ? 'inline' : 'block';
    },

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            fileId: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            width: {
                default: null,
                parseHTML: (element) => {
                    const width = element.style.width || element.getAttribute('width');
                    return width ? parseInt(width, 10) : null;
                },
            },
            height: {
                default: null,
                parseHTML: (element) => {
                    const height = element.style.height || element.getAttribute('height');
                    return height ? parseInt(height, 10) : null;
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { width, height, fileId, ...otherAttributes } = HTMLAttributes;
        const style: Record<string, string> = {};

        if (width) style.width = `${width}px`;
        if (height) style.height = `${height}px`;

        return [
            'img',
            {
                ...otherAttributes,
                ...(fileId ? { 'data-file-id': fileId } : {}),
                style: Object.keys(style).length > 0 ? Object.entries(style).map(([k, v]) => `${k}: ${v}`).join('; ') : undefined
            }
        ];
    },

    addCommands() {
        return {
            setImage:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: inputRegex,
                type: this.type,
                getAttributes: (match) => {
                    const [, , alt, src, title] = match;
                    return { src, alt, title };
                },
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});
