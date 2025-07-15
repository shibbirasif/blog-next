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
}


const RichTextEditor: React.FC<RichTextEditorProps> = ({ content = '', onContentChange, editable = true }) => {
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
        // editorProps: {
        //     attributes: {
        //         class: 'prose max-w-none focus:outline-none p-4 min-h-[300px] overflow-y-auto',
        //     },
        // },
    });

    return (
        <div className="border border-gray-300 rounded-lg shadow-sm">
            {editable && <EditorToolbar editor={editor} />}
            <EditorContent editor={editor} className='prose dark:prose-invert max-w-none min-h-[300px] overflow-y-auto'/>
        </div>
    );
};

export default RichTextEditor;
