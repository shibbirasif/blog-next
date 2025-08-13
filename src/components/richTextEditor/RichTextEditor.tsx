'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import React from 'react';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Emoji from '@tiptap/extension-emoji';
import EditorToolbar from './EditorToolbar';
import ResizeImage from 'tiptap-extension-resize-image';
import AIStatusIndicator from './AIStatusIndicator';
import InlineAISuggestions from './InlineAISuggestions';

interface RichTextEditorProps {
    content: string;
    onContentChange: (html: string) => void;
    onImageUpload?: (fileId: string) => void;
    editable?: boolean;
    hasError?: boolean;
    enableAISuggestions?: boolean;
}


const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content = '',
    onContentChange,
    onImageUpload,
    editable = true,
    hasError = false,
    enableAISuggestions = true
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            Underline,
            // Removed custom ResizableImage extension
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...'
            }),
            ResizeImage,
            Emoji
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose max-w-none text-gray-900 dark:text-white focus:outline-none p-1 min-h-[500px] overflow-y-auto',
            },
        },
    });

    return (
        <div className={`border rounded-lg shadow-sm ${hasError ? 'border-red-500' : 'border-gray-300'} relative`}>
            {editable && (
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 p-2">
                    <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
                    <AIStatusIndicator />
                </div>
            )}
            <div className="relative">
                <EditorContent
                    editor={editor}
                    className='max-w-none min-h-[500px] overflow-y-auto rounded-lg'
                    style={{
                        // Fix bold color in dark mode
                        '--tw-prose-bold': 'var(--tw-prose-invert)',
                        color: 'inherit',
                    } as React.CSSProperties}
                />

                {/* Inline AI Suggestions */}
                {editable && enableAISuggestions && editor && (
                    <InlineAISuggestions
                        editor={editor}
                        isEnabled={enableAISuggestions}
                        triggerWords={8}
                        debounceMs={1500}
                    />
                )}
            </div>
            <style>{`
                .dark .prose strong, .dark .prose b, .dark .prose em {
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
