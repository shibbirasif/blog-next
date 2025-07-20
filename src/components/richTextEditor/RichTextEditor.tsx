'use client'; // This MUST be the very first line

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import React from 'react';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Emoji from '@tiptap/extension-emoji';
import EditorToolbar from './EditorToolbar';

interface RichTextEditorProps {
    content: string;
    onContentChange: (html: string) => void;
    editable?: boolean;
    hasError?: boolean;
}


const RichTextEditor: React.FC<RichTextEditorProps> = ({ content = '', onContentChange, editable = true, hasError = false }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            Underline,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...'
            }),
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
                class: 'prose max-w-none focus:outline-none p-1 min-h-[500px] overflow-y-auto',
            },
        },
    });

    return (
        <div className={`border rounded-lg shadow-sm ${hasError ? 'border-red-500' : 'border-gray-300'}`}>
            {editable && <EditorToolbar editor={editor} />}
            <EditorContent editor={editor} className='max-w-none min-h-[500px] overflow-y-auto rounded-lg' />
        </div>
    );
};

export default RichTextEditor;
